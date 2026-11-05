/**
 * Agricultural Fertilizer Recommendation & Nutrient Calculation Service
 * 
 * Implements scientifically defensible nutrient calculations aligned with
 * Indian Council of Agricultural Research (ICAR) and State Agricultural University (SAU)
 * soil-test-based fertilizer recommendation (STCR) principles.
 */

// Baseline Recommended Dose of Fertilizer (RDF) for key crops in kg/acre
// Format: { N: kg/acre, P: kg/acre (P2O5), K: kg/acre (K2O), type: 'cereal'|'pulse'|'commercial'|'fruit'|'vegetable' }
export const CROP_NUTRIENT_REQUIREMENTS = {
  'Rice (Paddy)': {
    n: 45,
    p: 20,
    k: 20,
    cropType: 'cereal',
    splits: { basal: '50% N + 100% P + 50% K', top1: '25% N at tillering (20-25 DAT)', top2: '25% N + 50% K at panicle initiation' }
  },
  'Cotton': {
    n: 48,
    p: 24,
    k: 24,
    cropType: 'commercial',
    splits: { basal: '20% N + 100% P + 50% K at sowing', top1: '40% N at squaring/early vegetative (35-40 DAS)', top2: '40% N + 50% K at boll development (65-70 DAS)' }
  },
  'Wheat': {
    n: 48,
    p: 24,
    k: 16,
    cropType: 'cereal',
    splits: { basal: '50% N + 100% P + 100% K at sowing', top1: '50% N at crown root initiation (21-25 DAS)' }
  },
  'Maize (Corn)': {
    n: 50,
    p: 25,
    k: 20,
    cropType: 'cereal',
    splits: { basal: '33% N + 100% P + 100% K at sowing', top1: '33% N at knee-high stage (25-30 DAS)', top2: '33% N at tasseling stage (45-50 DAS)' }
  },
  'Sugarcane': {
    n: 110,
    p: 35,
    k: 45,
    cropType: 'commercial',
    splits: { basal: '10% N + 100% P + 50% K at planting', top1: '45% N at tillering (45-60 DAP)', top2: '45% N + 50% K at earthing-up (90-120 DAP)' }
  },
  'Groundnut': {
    n: 10,
    p: 20,
    k: 20,
    cropType: 'pulse',
    splits: { basal: '100% N + 100% P + 100% K at sowing (Legume root nodules fix atmospheric nitrogen)' }
  },
  'Pulses (Red Gram/Bengal Gram)': {
    n: 10,
    p: 22,
    k: 10,
    cropType: 'pulse',
    splits: { basal: '100% N + 100% P + 100% K at sowing (Starter nitrogen only; Rhizobium fixes nitrogen)' }
  },
  'Vegetables / Tomato': {
    n: 55,
    p: 30,
    k: 30,
    cropType: 'vegetable',
    splits: { basal: '33% N + 100% P + 50% K at transplanting', top1: '33% N at early vegetative (25-30 DAT)', top2: '33% N + 50% K at flowering/fruiting' }
  }
};

/**
 * Categorize soil nutrient levels based on standard Indian soil testing criteria
 * @param {number} value - Measured nutrient reading (kg/acre or index)
 * @param {string} nutrient - 'N', 'P', or 'K'
 * @returns {object} { status: 'Low'|'Medium'|'High', factor: number, description: string }
 */
export const evaluateSoilNutrient = (value, nutrient) => {
  const val = Number(value);

  // Benchmarks adjusted for per-acre field equivalent readings
  if (nutrient === 'N') {
    if (val < 113) {
      return { status: 'Low', factor: 1.25, description: 'Soil Nitrogen reserves are deficient.' };
    } else if (val <= 227) {
      return { status: 'Medium', factor: 1.0, description: 'Soil Nitrogen reserves are in balanced/sufficient range.' };
    } else {
      return { status: 'High', factor: 0.75, description: 'Soil Nitrogen reserves are rich/abundant.' };
    }
  } else if (nutrient === 'P') {
    if (val < 10) {
      return { status: 'Low', factor: 1.30, description: 'Available Phosphorus is low; root establishment may be impaired.' };
    } else if (val <= 25) {
      return { status: 'Medium', factor: 1.0, description: 'Available Phosphorus is in normal range.' };
    } else {
      return { status: 'High', factor: 0.70, description: 'Available Phosphorus is high; reduce application to prevent fixation.' };
    }
  } else if (nutrient === 'K') {
    if (val < 45) {
      return { status: 'Low', factor: 1.25, description: 'Available Potassium is low; crop disease resistance and brix may be reduced.' };
    } else if (val <= 113) {
      return { status: 'Medium', factor: 1.0, description: 'Available Potassium is in balanced range.' };
    } else {
      return { status: 'High', factor: 0.75, description: 'Available Potassium is high; reduce potash to avoid salt injury.' };
    }
  }

  return { status: 'Medium', factor: 1.0, description: 'Sufficient nutrient balance.' };
};

/**
 * Calculate fertilizer dosages, application timings, and safety guidance
 * @param {object} params
 * @param {string} params.soilType
 * @param {string} params.season
 * @param {string} params.crop
 * @param {number} params.nitrogen
 * @param {number} params.phosphorus
 * @param {number} params.potassium
 * @param {number} params.landArea - In acres
 * @returns {object} Calculated recommendation
 */
export const calculateFertilizerRecommendation = ({
  soilType,
  season,
  crop,
  nitrogen,
  phosphorus,
  potassium,
  landArea
}) => {
  const baseReq = CROP_NUTRIENT_REQUIREMENTS[crop] || {
    n: 45,
    p: 20,
    k: 20,
    cropType: 'cereal',
    splits: { basal: '50% N + 100% P + 50% K', top1: '50% N at active tillering' }
  };

  const area = Number(landArea) > 0 ? Number(landArea) : 1;

  // 1. Evaluate soil nutrient status
  const nEval = evaluateSoilNutrient(nitrogen, 'N');
  const pEval = evaluateSoilNutrient(phosphorus, 'P');
  const kEval = evaluateSoilNutrient(potassium, 'K');

  // 2. Adjust target nutrient requirement using Soil Test Crop Response (STCR) factors
  let targetN = baseReq.n * nEval.factor;
  let targetP = baseReq.p * pEval.factor;
  let targetK = baseReq.k * kEval.factor;

  // 3. Soil Type Modifiers
  const isSandy = soilType.toLowerCase().includes('sandy');
  const isClayOrBlack = soilType.toLowerCase().includes('black') || soilType.toLowerCase().includes('clay');
  const isRedOrLaterite = soilType.toLowerCase().includes('red') || soilType.toLowerCase().includes('laterite');

  // In highly leaching sandy soils, slightly increase N requirement and mandate additional split applications
  if (isSandy) {
    targetN *= 1.10;
  }

  // 4. Fertilizer Choice (DAP vs SSP based on soil and crop):
  // For red/laterite acidic soils, Single Super Phosphate (SSP) is preferred for Sulfur + Calcium.
  // For black, alluvial, and clay soils, DAP (Di-Ammonium Phosphate) is standard.
  const preferSSP = isRedOrLaterite || crop === 'Groundnut' || crop.includes('Pulses');

  let dapKgPerAcre = 0;
  let sspKgPerAcre = 0;
  let nFromP_Source = 0;

  if (preferSSP) {
    // SSP has 16% P2O5 (and 11% S, 19% Ca)
    sspKgPerAcre = targetP / 0.16;
    nFromP_Source = 0; // SSP contains 0% Nitrogen
  } else {
    // DAP has 18% N and 46% P2O5
    dapKgPerAcre = targetP / 0.46;
    nFromP_Source = dapKgPerAcre * 0.18;
  }

  // 5. Nitrogen Calculation (Urea has 46% N)
  // Deduct Nitrogen already supplied by DAP
  const remainingN = Math.max(0, targetN - nFromP_Source);
  const ureaKgPerAcre = remainingN / 0.46;

  // 6. Potassium Calculation (MOP - Muriate of Potash has 60% K2O)
  const mopKgPerAcre = targetK / 0.60;

  // 7. Calculate Total Farm Quantities
  const totalUrea = Math.round(ureaKgPerAcre * area);
  const totalDAP = Math.round(dapKgPerAcre * area);
  const totalSSP = Math.round(sspKgPerAcre * area);
  const totalMOP = Math.round(mopKgPerAcre * area);

  // Standard 50-kg bag equivalents
  const ureaBags = (totalUrea / 50).toFixed(1);
  const pBags = preferSSP ? (totalSSP / 50).toFixed(1) : (totalDAP / 50).toFixed(1);
  const mopBags = (totalMOP / 50).toFixed(1);

  // 8. Fertilizer Combination Title & Summary
  const pSourceName = preferSSP ? 'Single Super Phosphate (SSP 16% P₂O₅)' : 'Di-Ammonium Phosphate (DAP 18-46-0)';
  const fertilizerCombination = preferSSP
    ? 'Urea (46% N) + SSP (16% P₂O₅ + 11% S) + MOP (60% K₂O) + Organic Manure'
    : 'Urea (46% N) + DAP (18-46-0) + MOP (60% K₂O) + Organic Manure';

  // 9. Detailed Reason for Each Recommendation
  const explanations = [
    `Urea (46% N): Recommended to fulfill net nitrogen requirement of ${Math.round(targetN)} kg/acre (${Math.round(remainingN)} kg net N after adjusting for phosphorus carrier). Nitrogen is crucial for chlorophyll synthesis and vigorous vegetative growth.`,
    `${pSourceName}: Recommended to supply ${Math.round(targetP)} kg/acre of P₂O₅. ${preferSSP ? 'SSP also supplies vital Sulfur and Calcium needed for root nodules and pod development.' : 'DAP efficiently provides concentrated water-soluble phosphorus alongside 18% starter ammoniacal nitrogen.'}`,
    `MOP (60% K₂O): Recommended to provide ${Math.round(targetK)} kg/acre of K₂O to enhance drought resistance, stem strength, and disease tolerance.`,
    `Organic Supplementation: Apply 2 to 3 tonnes of well-decomposed Farmyard Manure (FYM) or 500 kg Vermicompost per acre to improve microbial activity and soil cation exchange capacity (CEC).`
  ];

  // 10. Split Application Schedule
  const applicationGuidance = `
For ${area} Acre(s) of ${crop} in ${soilType} (${season}):
• Basal Dose (At Sowing / Land Preparation):
  - Apply 100% of ${preferSSP ? `SSP (${totalSSP} kg)` : `DAP (${totalDAP} kg)`} drilled 5 cm below seed level.
  - Apply 50% of MOP (${Math.round(totalMOP * 0.5)} kg).
  - Apply 25-33% of Urea (${Math.round(totalUrea * 0.3)} kg) as starter nitrogen.
  - Mix organic compost / FYM during final field ploughing.

• 1st Topdressing (Vegetative Growth / Tillering Stage):
  - Broadcast 35-50% of Urea (${Math.round(totalUrea * 0.4)} kg) when soil is moist. ${isSandy ? 'On sandy soil, apply in smaller frequent doses to minimize leaching.' : ''}

• 2nd Topdressing (Flowering / Earthing-up / Panicle Initiation Stage):
  - Broadcast remaining Urea (${Math.round(totalUrea * 0.3)} kg) along with remaining 50% MOP (${Math.round(totalMOP * 0.5)} kg).
  `.trim();

  // 11. Safety Precautions
  const safetyPrecautions = [
    'Always wear protective rubber gloves, mask, and full-sleeve workwear while broadcasting chemical fertilizers.',
    'Never apply nitrogenous fertilizers (Urea) on wet leaf foliage or standing water under intense midday heat to prevent chemical leaf scorch and volatilization losses.',
    'Do not apply fertilizers immediately preceding heavy rainfall or storm warnings to prevent nutrient runoff into local water bodies and farm ponds.',
    'Store fertilizer bags off the floor on wooden pallets in a cool, ventilated, dry shed out of reach of children and domestic farm livestock.',
    'Irrigate the field with light to moderate moisture within 12 to 24 hours of topdressing for efficient root uptake.'
  ];

  return {
    crop,
    soilType,
    season,
    landArea: area,
    landAreaUnit: 'Acres',
    fertilizerCombination,
    nutrientDeficitAnalysis: {
      nitrogen: { measured: Number(nitrogen), status: nEval.status, targetRate: `${Math.round(targetN)} kg/acre`, description: nEval.description },
      phosphorus: { measured: Number(phosphorus), status: pEval.status, targetRate: `${Math.round(targetP)} kg/acre`, description: pEval.description },
      potassium: { measured: Number(potassium), status: kEval.status, targetRate: `${Math.round(targetK)} kg/acre`, description: kEval.description }
    },
    dosageBreakdown: {
      perAcre: {
        urea: `${Math.round(ureaKgPerAcre)} kg / acre`,
        phosphorusFertilizer: `${Math.round(preferSSP ? sspKgPerAcre : dapKgPerAcre)} kg / acre (${preferSSP ? 'SSP' : 'DAP'})`,
        mop: `${Math.round(mopKgPerAcre)} kg / acre`,
        organicManure: '2 - 3 tonnes / acre (FYM or Compost)'
      },
      totalLandArea: {
        acres: area,
        ureaTotalKg: totalUrea,
        ureaTotalBags: `${ureaBags} bags (50kg)`,
        pTotalKg: preferSSP ? totalSSP : totalDAP,
        pTotalBags: `${pBags} bags (50kg)`,
        pCarrierName: preferSSP ? 'SSP' : 'DAP',
        mopTotalKg: totalMOP,
        mopTotalBags: `${mopBags} bags (50kg)`,
        organicTotalTonnes: `${(2.5 * area).toFixed(1)} tonnes FYM`
      }
    },
    explanations,
    applicationGuidance,
    safetyPrecautions,
    advisoryDisclaimer: 'This fertilizer recommendation is an agronomic advisory based on standard crop removal rates and Soil Test Crop Response (STCR) principles. Specific nutrient requirements may vary with seed hybrid and micro-climate. Verify with your local agricultural officer or soil testing laboratory.'
  };
};

export default {
  calculateFertilizerRecommendation,
  evaluateSoilNutrient,
  CROP_NUTRIENT_REQUIREMENTS
};

