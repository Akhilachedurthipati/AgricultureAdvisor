import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modelPath = path.join(__dirname, 'model/crop_model.json');

let modelData = null;

// Load the trained ML model artifact
try {
  const raw = fs.readFileSync(modelPath, 'utf8');
  modelData = JSON.parse(raw);
  console.log(`[ML Engine] Crop recommendation model loaded successfully (Validation Accuracy: ${(modelData.metadata.validationAccuracy * 100).toFixed(2)}%).`);
} catch (err) {
  console.error('[ML Engine Error] Failed to load crop_model.json:', err.message);
}

/**
 * Soil Type Canonical Alias Map
 */
export const SOIL_ALIAS_MAP = {
  'black': 'Black Cotton Soil',
  'black soil': 'Black Cotton Soil',
  'black cotton': 'Black Cotton Soil',
  'black cotton soil': 'Black Cotton Soil',
  'regur': 'Black Cotton Soil',
  'alluvial': 'Alluvial Soil',
  'alluvial soil': 'Alluvial Soil',
  'loam': 'Alluvial Soil',
  'loamy': 'Alluvial Soil',
  'clay': 'Clay Soil',
  'clay soil': 'Clay Soil',
  'clayey': 'Clay Soil',
  'red': 'Red Soil',
  'red soil': 'Red Soil',
  'sandy': 'Sandy Loam Soil',
  'sandy loam': 'Sandy Loam Soil',
  'sandy loam soil': 'Sandy Loam Soil',
  'sandy soil': 'Sandy Loam Soil',
  'laterite': 'Laterite Soil',
  'laterite soil': 'Laterite Soil'
};

/**
 * Cropping Season Canonical Alias Map
 */
export const SEASON_ALIAS_MAP = {
  'kharif': 'Kharif (Monsoon: Jun - Oct)',
  'monsoon': 'Kharif (Monsoon: Jun - Oct)',
  'kharif (monsoon: jun - oct)': 'Kharif (Monsoon: Jun - Oct)',
  'rabi': 'Rabi (Winter: Oct - Mar)',
  'winter': 'Rabi (Winter: Oct - Mar)',
  'rabi (winter: oct - mar)': 'Rabi (Winter: Oct - Mar)',
  'zaid': 'Zaid (Summer: Mar - Jun)',
  'summer': 'Zaid (Summer: Mar - Jun)',
  'zaid (summer: mar - jun)': 'Zaid (Summer: Mar - Jun)'
};

/**
 * Normalize soil type input to canonical model label
 */
export function normalizeSoilType(raw) {
  if (!raw || typeof raw !== 'string') return raw;
  const cleaned = raw.trim().toLowerCase();
  return SOIL_ALIAS_MAP[cleaned] || raw.trim();
}

/**
 * Normalize season input to canonical model label
 */
export function normalizeSeason(raw) {
  if (!raw || typeof raw !== 'string') return raw;
  const cleaned = raw.trim().toLowerCase();
  return SEASON_ALIAS_MAP[cleaned] || raw.trim();
}

/**
 * Calculate Gaussian log probability density
 */
function gaussianLogPdf(x, mean, std) {
  const variance = Math.max(std * std, 0.001);
  const diff = x - mean;
  return -0.5 * Math.log(2 * Math.PI * variance) - (diff * diff) / (2 * variance);
}

/**
 * Predict multiple suitable crops based on soil, cropping season, and weather parameters.
 * Mathematically handles missing optional features (e.g. soil pH, NPK) via feature marginalization
 * without inserting zero or fabricating artificial values.
 *
 * @param {object} inputs
 * @param {string} inputs.soilType - Canonical soil type
 * @param {string} inputs.season - Cropping season (Kharif, Rabi, Zaid)
 * @param {number} inputs.temperature - Ambient temperature in °C
 * @param {number} inputs.humidity - Relative humidity in %
 * @param {number} [inputs.ph] - Optional soil pH (3.0 - 10.0)
 * @param {number} inputs.rainfall - Monthly equivalent rainfall in mm
 * @param {number} [inputs.landArea=1] - Available land area in acres
 * @param {object} [inputs.npk] - Optional soil NPK test readings
 * @param {object} [inputs.weatherTelemetry] - Open-Meteo provenance metadata
 * @returns {object} Ranked recommendations with multiple suitable crops, confidence scores, and cultivation guidance
 */
export function predictCrop(inputs) {
  if (!modelData || !modelData.crops) {
    throw new Error('ML Crop model artifact is not loaded');
  }

  const { soilType, season, temperature, humidity, ph, rainfall, landArea = 1, npk, weatherTelemetry } = inputs;

  // Validate presence of required weather and soil parameters
  const numTemp = Number(temperature);
  const numHum = Number(humidity);
  const numRain = Number(rainfall);

  if (isNaN(numTemp) || isNaN(numHum) || isNaN(numRain)) {
    throw new Error('Temperature, humidity, and rainfall must be valid numeric values.');
  }

  // Handle optional Soil pH: if undefined, null, or empty string, it is omitted (NOT set to 0)
  const hasPh = ph !== undefined && ph !== null && ph !== '' && !isNaN(Number(ph));
  const numPh = hasPh ? Number(ph) : null;
  if (hasPh && (numPh < 3.0 || numPh > 10.0)) {
    throw new Error('Soil pH, if provided, must be between 3.0 and 10.0.');
  }

  // Normalize soil type and season using canonical alias mappings
  const canonicalSoil = normalizeSoilType(soilType);
  const canonicalSeason = normalizeSeason(season);

  const cropScores = [];

  // Compute log posterior for every candidate crop
  for (const [cropKey, cropInfo] of Object.entries(modelData.crops)) {
    let logLikelihood = Math.log(cropInfo.prior || 1 / 22);

    // Continuous features (Gaussian log-likelihood)
    const stats = cropInfo.numericalStats;
    logLikelihood += gaussianLogPdf(numTemp, stats.temperature.mean, stats.temperature.std);
    logLikelihood += gaussianLogPdf(numHum, stats.humidity.mean, stats.humidity.std);
    logLikelihood += gaussianLogPdf(numRain, stats.rainfall.mean, stats.rainfall.std);

    // Only include pH in log-likelihood if the farmer provided it (no zero substitution)
    if (hasPh) {
      logLikelihood += gaussianLogPdf(numPh, stats.ph.mean, stats.ph.std);
    }

    // Categorical features (Soil type and season likelihoods)
    const soilProb = cropInfo.soilProbabilities[canonicalSoil] || 0.05;
    const seasonProb = cropInfo.seasonProbabilities[canonicalSeason] || 0.05;

    logLikelihood += Math.log(soilProb);
    logLikelihood += Math.log(seasonProb);

    cropScores.push({
      cropKey,
      cropName: cropInfo.cropName,
      logLikelihood,
      cultivationGuide: cropInfo.cultivationGuide,
      stats: cropInfo.numericalStats,
      soilProb,
      seasonProb
    });
  }

  // Softmax normalization using log-sum-exp
  const maxLog = Math.max(...cropScores.map(c => c.logLikelihood));
  const expScores = cropScores.map(c => ({
    ...c,
    weight: Math.exp(c.logLikelihood - maxLog)
  }));
  const sumExp = expScores.reduce((acc, c) => acc + c.weight, 0);

  // Calculate posterior probability for each candidate crop
  const rankedAll = expScores.map(c => ({
    cropKey: c.cropKey,
    cropName: c.cropName,
    confidence: c.weight / sumExp,
    logLikelihood: c.logLikelihood,
    cultivationGuide: c.cultivationGuide,
    stats: c.stats,
    soilProb: c.soilProb,
    seasonProb: c.seasonProb
  }));

  // Sort descending by posterior probability
  rankedAll.sort((a, b) => b.confidence - a.confidence);

  // Top candidate crop
  const best = rankedAll[0];
  const secondBest = rankedAll[1] || null;

  // Filter multiple viable recommendations:
  // Must have compatible agronomic conditions with the soil and season
  const compatibleCrops = rankedAll.filter(c => c.soilProb >= 0.005 && c.seasonProb >= 0.005);
  let viableCrops = compatibleCrops.filter(c => c.confidence >= 0.005);
  if (viableCrops.length < 2 && compatibleCrops.length >= 2) {
    viableCrops = compatibleCrops.slice(0, 3);
  }
  const multipleCandidates = viableCrops.length > 0 ? viableCrops : rankedAll.slice(0, 3);

  // Helper to categorize water demand based on crop rainfall requirements
  const getWaterDemand = (stats) => {
    if (stats.rainfall.mean < 60) return { level: 'Low', description: 'Drought-tolerant / Low water requirement' };
    if (stats.rainfall.mean <= 130) return { level: 'Moderate', description: 'Moderate irrigation or steady rainfall' };
    return { level: 'High', description: 'High water requirement / standing moisture' };
  };

  // Build formatted list of multiple suitable crop recommendations
  const suitableCrops = multipleCandidates.slice(0, 5).map((candidate, idx) => {
    const rawConf = candidate.confidence;
    const confScore = Number(rawConf.toFixed(2));
    const confPercent = Math.max(1, Math.round(rawConf * 100));
    const waterDemand = getWaterDemand(candidate.stats);

    return {
      rank: idx + 1,
      cropKey: candidate.cropKey,
      cropName: candidate.cropName,
      confidenceScore: confScore,
      confidencePercentage: confPercent,
      isPrimary: idx === 0,
      suitabilityExplanation: generateSuitabilityExplanation({
        cropName: candidate.cropName,
        soilType: canonicalSoil,
        season: canonicalSeason,
        temp: numTemp,
        humidity: numHum,
        ph: numPh,
        rainfall: numRain,
        idealStats: candidate.stats,
        hasPh
      }),
      cultivationGuide: candidate.cultivationGuide,
      waterDemand,
      agronomicParameters: {
        optimalTemperature: `${candidate.stats.temperature.min.toFixed(0)}°C - ${candidate.stats.temperature.max.toFixed(0)}°C`,
        optimalHumidity: `${candidate.stats.humidity.min.toFixed(0)}% - ${candidate.stats.humidity.max.toFixed(0)}%`,
        optimalSoilPh: `${candidate.stats.ph.min.toFixed(1)} - ${candidate.stats.ph.max.toFixed(1)}`,
        optimalRainfall: `${candidate.stats.rainfall.min.toFixed(0)} mm - ${candidate.stats.rainfall.max.toFixed(0)} mm/month`
      },
      allocatedAcres: 0
    };
  });

  // Out-of-Distribution (OOD) check
  const isOutOfDistribution = best.logLikelihood < -28.0;
  const rawConfidence = best.confidence;
  const confidenceScore = Number(rawConfidence.toFixed(2));
  const isConfident = !isOutOfDistribution && rawConfidence >= 0.70;

  let confidenceLevel = 'high';
  if (rawConfidence < 0.50 || isOutOfDistribution) {
    confidenceLevel = 'low';
  } else if (rawConfidence < 0.70) {
    confidenceLevel = 'moderate';
  }

  let uncertaintyWarning = null;
  if (isOutOfDistribution) {
    uncertaintyWarning = `Extreme or atypical environmental parameters detected. The provided soil and climate values sit outside standard agricultural tolerance envelopes (density metric: ${best.logLikelihood.toFixed(1)}). Recommendation is uncertain; verify conditions with an agricultural extension officer before planting.`;
  } else if (!isConfident) {
    const pct = Math.round(rawConfidence * 100);
    const altMsg = secondBest && secondBest.confidence >= 0.15 
      ? ` Alternate candidates: ${suitableCrops.slice(1).map(c => `${c.cropName} (${c.confidencePercentage}%)`).join(', ')}.` 
      : '';
    uncertaintyWarning = `Moderate recommendation certainty (${pct}%). Multiple suitable crops identified across the provided climate and soil conditions.${altMsg} Please verify your soil test readings and local seasonal weather expectations before planting.`;
  }

  return {
    cropName: best.cropName,
    confidenceScore,
    isConfident,
    confidenceLevel,
    uncertaintyWarning,
    suitabilityExplanation: suitableCrops[0]?.suitabilityExplanation || '',
    cultivationInformation: best.cultivationGuide,
    agronomicParameters: suitableCrops[0]?.agronomicParameters,
    suitableCrops,
    evaluatedParameters: {
      soilType: canonicalSoil,
      season: canonicalSeason,
      temperature: numTemp,
      humidity: numHum,
      rainfall: numRain,
      ph: numPh,
      hasPh,
      landArea: Number(landArea) || 1,
      npk: npk || null
    },
    weatherTelemetry: weatherTelemetry || null,
    advisoryDisclaimer: 'This recommendation is a computational agronomic advisory based on regional crop climate models. Environmental conditions, micro-climates, and seed varieties can vary. Confirm with your local agricultural extension officer or soil testing laboratory prior to sowing.'
  };
}

/**
 * Generate a detailed suitability explanation
 */
function generateSuitabilityExplanation({ cropName, soilType, season, temp, humidity, ph, rainfall, idealStats, hasPh }) {
  const tempStatus = temp >= idealStats.temperature.min && temp <= idealStats.temperature.max
    ? `average temperature of ${temp}°C is within its prime physiological range (${idealStats.temperature.min.toFixed(0)}°C - ${idealStats.temperature.max.toFixed(0)}°C)`
    : `temperature of ${temp}°C is adaptable for this variety`;

  const rainStatus = rainfall >= idealStats.rainfall.min && rainfall <= idealStats.rainfall.max
    ? `precipitation of ${rainfall} mm meets its seasonal moisture requirement`
    : `moisture of ${rainfall} mm can be augmented with supplemental furrow/drip irrigation`;

  const phStatus = hasPh
    ? (ph >= idealStats.ph.min && ph <= idealStats.ph.max
        ? `soil pH of ${ph} provides optimal nutrient bioavailability`
        : `soil pH of ${ph} is tolerable with organic compost conditioning`)
    : `compatible across standard ${soilType} pH ranges`;

  return `${cropName} is well-suited for your land. The ${soilType} offers appropriate root penetration during ${season}. The ${tempStatus}, while ${rainStatus}, and ${phStatus}.`;
}

export default {
  predictCrop,
  normalizeSoilType,
  normalizeSeason,
  SOIL_ALIAS_MAP,
  SEASON_ALIAS_MAP
};


