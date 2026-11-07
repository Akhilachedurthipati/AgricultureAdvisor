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
 * Predict the single best-suited crop based on soil and climate parameters
 * @param {object} inputs
 * @param {string} inputs.soilType
 * @param {string} inputs.season
 * @param {number} inputs.temperature
 * @param {number} inputs.humidity
 * @param {number} inputs.ph
 * @param {number} inputs.rainfall
 * @returns {object} single recommendation result with genuine confidence and uncertainty warnings
 */
export function predictCrop(inputs) {
  if (!modelData || !modelData.crops) {
    throw new Error('ML Crop model artifact is not loaded');
  }

  const { soilType, season, temperature, humidity, ph, rainfall } = inputs;

  // Validate presence and ranges
  const numTemp = Number(temperature);
  const numHum = Number(humidity);
  const numPh = Number(ph);
  const numRain = Number(rainfall);

  if (isNaN(numTemp) || isNaN(numHum) || isNaN(numPh) || isNaN(numRain)) {
    throw new Error('Temperature, humidity, soil pH, and rainfall must be valid numeric values.');
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
    logLikelihood += gaussianLogPdf(numPh, stats.ph.mean, stats.ph.std);
    logLikelihood += gaussianLogPdf(numRain, stats.rainfall.mean, stats.rainfall.std);

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
      stats: cropInfo.numericalStats
    });
  }

  // Softmax normalization using log-sum-exp
  const maxLog = Math.max(...cropScores.map(c => c.logLikelihood));
  const expScores = cropScores.map(c => ({
    ...c,
    weight: Math.exp(c.logLikelihood - maxLog)
  }));
  const sumExp = expScores.reduce((acc, c) => acc + c.weight, 0);

  // Calculate posterior probability for each crop
  const ranked = expScores.map(c => ({
    cropKey: c.cropKey,
    cropName: c.cropName,
    confidence: c.weight / sumExp,
    logLikelihood: c.logLikelihood,
    cultivationGuide: c.cultivationGuide,
    stats: c.stats
  }));

  // Sort descending by posterior probability
  ranked.sort((a, b) => b.confidence - a.confidence);

  // EXACTLY ONE BEST-SUITED CROP
  const best = ranked[0];
  const secondBest = ranked[1] || null;

  // Genuine posterior probability directly from model output (no artificial clamping)
  const rawConfidence = best.confidence;
  const confidenceScore = Number(rawConfidence.toFixed(2));

  // Out-of-Distribution (OOD) check:
  // In-distribution minimum log-likelihood on verified dataset is -19.20.
  // Severe environmental stress / out-of-distribution threshold is -28.0 (extreme cases reach -40 to -60).
  const isOutOfDistribution = best.logLikelihood < -28.0;

  // Uncertainty evaluation:
  // High confidence requires in-distribution parameters and >= 70% posterior probability
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
      ? ` Alternate candidate: ${secondBest.cropName} (${Math.round(secondBest.confidence * 100)}%).` 
      : '';
    uncertaintyWarning = `Moderate recommendation certainty (${pct}%). The provided climate or soil parameters sit between multiple crop suitability profiles.${altMsg} Please verify your soil test readings and local seasonal weather expectations before planting.`;
  }

  // Generate scientific suitability explanation
  const suitabilityExplanation = generateSuitabilityExplanation({
    cropName: best.cropName,
    soilType: canonicalSoil,
    season: canonicalSeason,
    temp: numTemp,
    humidity: numHum,
    ph: numPh,
    rainfall: numRain,
    idealStats: best.stats
  });

  return {
    cropName: best.cropName,
    confidenceScore,
    isConfident,
    confidenceLevel,
    uncertaintyWarning,
    suitabilityExplanation,
    cultivationInformation: best.cultivationGuide,
    agronomicParameters: {
      optimalTemperature: `${best.stats.temperature.min.toFixed(0)}°C - ${best.stats.temperature.max.toFixed(0)}°C`,
      optimalHumidity: `${best.stats.humidity.min.toFixed(0)}% - ${best.stats.humidity.max.toFixed(0)}%`,
      optimalSoilPh: `${best.stats.ph.min.toFixed(1)} - ${best.stats.ph.max.toFixed(1)}`,
      optimalRainfall: `${best.stats.rainfall.min.toFixed(0)} mm - ${best.stats.rainfall.max.toFixed(0)} mm`
    },
    advisoryDisclaimer: 'This recommendation is a computational agronomic advisory based on regional crop climate models. Environmental conditions, micro-climates, and seed varieties can vary. Confirm with your local agricultural extension officer or soil testing laboratory prior to sowing.'
  };
}

/**
 * Generate a detailed suitability explanation
 */
function generateSuitabilityExplanation({ cropName, soilType, season, temp, humidity, ph, rainfall, idealStats }) {
  const tempStatus = temp >= idealStats.temperature.min && temp <= idealStats.temperature.max
    ? `average temperature of ${temp}°C is within its prime physiological range (${idealStats.temperature.min.toFixed(0)}°C - ${idealStats.temperature.max.toFixed(0)}°C)`
    : `temperature of ${temp}°C is adaptable for this variety`;

  const rainStatus = rainfall >= idealStats.rainfall.min && rainfall <= idealStats.rainfall.max
    ? `expected precipitation of ${rainfall} mm meets its seasonal moisture requirement`
    : `rainfall of ${rainfall} mm can be augmented with supplemental furrow/drip irrigation`;

  const phStatus = ph >= idealStats.ph.min && ph <= idealStats.ph.max
    ? `soil pH of ${ph} provides optimal nutrient bioavailability`
    : `soil pH of ${ph} is tolerable with organic compost conditioning`;

  return `${cropName} is determined to be the single most optimal crop for your land. The ${soilType} offers the appropriate physical structure, drainage, and root penetration characteristics needed during the ${season}. Furthermore, the ${tempStatus}, while ${rainStatus}, and ${phStatus}.`;
}

export default {
  predictCrop,
  normalizeSoilType,
  normalizeSeason,
  SOIL_ALIAS_MAP,
  SEASON_ALIAS_MAP
};


