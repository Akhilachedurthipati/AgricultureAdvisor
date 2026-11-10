/**
 * Agricultural Fertilizer Recommendation & Life-Cycle Nutrient Planning Service
 * 
 * Implements scientifically defensible nutrient calculations and crop growth stage
 * schedules aligned with Indian Council of Agricultural Research (ICAR) institutes
 * and State Agricultural University (SAU) packages of practices:
 * - ICAR-IIRR (Hyderabad) & PJTSAU for Rice
 * - ICAR-CICR (Nagpur) & TNAU for Cotton
 * - ICAR-IIWBR (Karnal) & PAU (Ludhiana) for Wheat
 * - ICAR-IIMR (Ludhiana) & PAU for Maize
 * - ICAR-SBI (Coimbatore) & ICAR-IISR (Lucknow) for Sugarcane
 * - ICAR-DGR (Junagadh) & TNAU for Groundnut
 * - ICAR-IIPR (Kanpur) for Pulses
 * - ICAR-IIHR (Bengaluru) & TNAU for Tomato/Vegetables
 * 
 * Fertilizer grades adhere to Fertilizer (Control) Order 1985 (FCO) specifications:
 * - Urea: 46% N (0.46 kg N / kg)
 * - DAP (Di-Ammonium Phosphate): 18% N, 46% P2O5 (0.18 kg N, 0.46 kg P2O5 / kg)
 * - SSP (Single Super Phosphate): 16% P2O5, 11% S, 19% Ca (0.16 kg P2O5 / kg)
 * - MOP (Muriate of Potash / Potassium Chloride): 60% K2O (0.60 kg K2O / kg)
 */

// Baseline Recommended Dose of Fertilizer (RDF) in kg/acre
// (1 hectare ≈ 2.471 acres; 1 acre ≈ 0.4047 hectare)
export const CROP_NUTRIENT_REQUIREMENTS = {
  'Rice (Paddy)': {
    n: 45,
    p: 20,
    k: 20,
    cropType: 'cereal',
    institutionReference: 'ICAR-IIRR (Hyderabad) & PJTSAU Package of Practices for semi-dwarf irrigated rice',
    splits: { basal: '50% N + 100% P + 50% K', top1: '25% N at tillering (20-25 DAT)', top2: '25% N + 50% K at panicle initiation' }
  },
  'Cotton': {
    n: 48,
    p: 24,
    k: 24,
    cropType: 'commercial',
    institutionReference: 'ICAR-CICR (Nagpur) & TNAU Agronomy Guide for hybrid/Bt cotton',
    splits: { basal: '20% N + 100% P + 50% K at sowing', top1: '40% N at squaring/early vegetative (35-40 DAS)', top2: '40% N + 50% K at boll development (65-70 DAS)' }
  },
  'Wheat': {
    n: 48,
    p: 24,
    k: 16,
    cropType: 'cereal',
    institutionReference: 'ICAR-IIWBR (Karnal) & PAU (Ludhiana) Package of Practices for irrigated high-yielding wheat',
    splits: { basal: '50% N + 100% P + 100% K at sowing', top1: '50% N at crown root initiation (21-25 DAS)' }
  },
  'Maize (Corn)': {
    n: 50,
    p: 25,
    k: 20,
    cropType: 'cereal',
    institutionReference: 'ICAR-IIMR (Ludhiana) & PAU Package of Practices for hybrid maize',
    splits: { basal: '33% N + 100% P + 100% K at sowing', top1: '33% N at knee-high stage (25-30 DAS)', top2: '33% N at tasseling stage (45-50 DAS)' }
  },
  'Sugarcane': {
    n: 110,
    p: 35,
    k: 45,
    cropType: 'commercial',
    institutionReference: 'ICAR-SBI (Coimbatore) & ICAR-IISR (Lucknow) for spring/autumn planted sugarcane',
    splits: { basal: '10% N + 100% P + 50% K at planting', top1: '45% N at tillering (45-60 DAP)', top2: '45% N + 50% K at earthing-up (90-120 DAP)' }
  },
  'Groundnut': {
    n: 10,
    p: 20,
    k: 20,
    cropType: 'pulse',
    institutionReference: 'ICAR-DGR (Junagadh) & TNAU Agronomy Guide for bunch/runner groundnut',
    splits: { basal: '100% N + 100% P + 100% K at sowing (Legume root nodules fix atmospheric nitrogen)' }
  },
  'Pulses (Red Gram/Bengal Gram)': {
    n: 10,
    p: 22,
    k: 10,
    cropType: 'pulse',
    institutionReference: 'ICAR-IIPR (Kanpur) & PJTSAU Pulses Production Guide',
    splits: { basal: '100% N + 100% P + 100% K at sowing (Starter nitrogen only; Rhizobium fixes nitrogen)' }
  },
  'Vegetables / Tomato': {
    n: 55,
    p: 30,
    k: 30,
    cropType: 'vegetable',
    institutionReference: 'ICAR-IIHR (Bengaluru) & TNAU Horticulture Guide for determinate/hybrid tomato',
    splits: { basal: '33% N + 100% P + 50% K at transplanting', top1: '33% N at early vegetative (25-30 DAT)', top2: '33% N + 50% K at flowering/fruiting' }
  }
};

/**
 * Verified Crop Growth Stages and Nutrient Partition Ratios
 * DAS = Days After Sowing, DAT = Days After Transplanting, DAP = Days After Planting
 */
export const CROP_LIFECYCLE_STAGES = {
  'Rice (Paddy)': [
    {
      stageId: 'basal',
      stageName: 'Basal (Transplanting & Land Preparation)',
      timingLabel: 'At Transplanting (0 DAT)',
      startDay: 0,
      endDay: 2,
      nFraction: 0.50,
      pFraction: 1.00,
      kFraction: 0.50,
      purpose: 'Promotes deep root anchorage, early vegetative establishment, and rapid recovery from transplant shock.',
      applicationMethod: 'Incorporate fully into puddled topsoil during the final field leveling prior to transplanting.'
    },
    {
      stageId: 'tillering',
      stageName: 'Active Tillering Stage',
      timingLabel: '20 - 25 DAT',
      startDay: 20,
      endDay: 25,
      nFraction: 0.25,
      pFraction: 0.00,
      kFraction: 0.00,
      purpose: 'Accelerates production of vigorous tillers, expands photosynthetic leaf area, and increases canopy density.',
      applicationMethod: 'Broadcast evenly over moist field with thin standing water layer (2-3 cm); drain excess ponding before application.'
    },
    {
      stageId: 'panicle',
      stageName: 'Panicle Initiation & Booting Stage',
      timingLabel: '40 - 45 DAT',
      startDay: 40,
      endDay: 45,
      nFraction: 0.25,
      pFraction: 0.00,
      kFraction: 0.50,
      purpose: 'Enhances panicle elongation, spikelet differentiation, grain filling percentage, and increases culm lodging resistance.',
      applicationMethod: 'Broadcast topdressing in the morning after dew dries; ensure soil has adequate moisture.'
    }
  ],
  'Cotton': [
    {
      stageId: 'basal',
      stageName: 'Basal (Sowing / Seedbed Preparation)',
      timingLabel: 'At Sowing (0 DAS)',
      startDay: 0,
      endDay: 2,
      nFraction: 0.20,
      pFraction: 1.00,
      kFraction: 0.50,
      purpose: 'Provides localized starter nutrients to establish the taproot system and support early seedling vigor.',
      applicationMethod: 'Drill or place in bands 5 cm below and 5 cm to the side of the seed line.'
    },
    {
      stageId: 'squaring',
      stageName: 'Squaring / Early Vegetative Stage',
      timingLabel: '35 - 40 DAS',
      startDay: 35,
      endDay: 40,
      nFraction: 0.40,
      pFraction: 0.00,
      kFraction: 0.00,
      purpose: 'Facilitates sympodial branching, healthy square (floral bud) formation, and maximizes leaf chlorophyll synthesis.',
      applicationMethod: 'Side-dress along crop rows 10-15 cm away from the stem base, followed by hoeing/inter-cultivation.'
    },
    {
      stageId: 'boll_development',
      stageName: 'Peak Flowering & Boll Development',
      timingLabel: '65 - 70 DAS',
      startDay: 65,
      endDay: 70,
      nFraction: 0.40,
      pFraction: 0.00,
      kFraction: 0.50,
      purpose: 'Sustains heavy boll load, prevents premature square/boll drop, enhances fiber length and micronaire.',
      applicationMethod: 'Broadcast between rows in moist soil before irrigation; avoid throwing granules into plant leaf whorls.'
    }
  ],
  'Wheat': [
    {
      stageId: 'basal',
      stageName: 'Basal (At Sowing)',
      timingLabel: 'At Sowing (0 DAS)',
      startDay: 0,
      endDay: 2,
      nFraction: 0.50,
      pFraction: 1.00,
      kFraction: 1.00,
      purpose: 'Stimulates seminal root establishment, early tillering readiness, and concentrated phosphorus uptake.',
      applicationMethod: 'Drill simultaneously with a seed-cum-fertilizer drill 3-5 cm below seed depth.'
    },
    {
      stageId: 'crown_root',
      stageName: 'Crown Root Initiation (CRI) / Early Tillering',
      timingLabel: '21 - 25 DAS',
      startDay: 21,
      endDay: 25,
      nFraction: 0.50,
      pFraction: 0.00,
      kFraction: 0.00,
      purpose: 'Crucial for crown root development and synchronous primary tillering.',
      applicationMethod: 'Topdress immediately prior to or 2-3 days following the first critical CRI irrigation.'
    }
  ],
  'Maize (Corn)': [
    {
      stageId: 'basal',
      stageName: 'Basal (At Sowing)',
      timingLabel: 'At Sowing (0 DAS)',
      startDay: 0,
      endDay: 2,
      nFraction: 0.33,
      pFraction: 1.00,
      kFraction: 1.00,
      purpose: 'Promotes rapid radicle emergence, primary root anchorage, and early seedling establishment.',
      applicationMethod: 'Band placement 5 cm away and below the seed line during sowing.'
    },
    {
      stageId: 'knee_high',
      stageName: 'Knee-High Stage (V6-V8)',
      timingLabel: '25 - 30 DAS',
      startDay: 25,
      endDay: 30,
      nFraction: 0.33,
      pFraction: 0.00,
      kFraction: 0.00,
      purpose: 'Fulfills high nitrogen demand during rapid internode elongation and leaf expansion.',
      applicationMethod: 'Side-dress along the row, followed by light earthing-up to prevent lodging.'
    },
    {
      stageId: 'tasseling',
      stageName: 'Tasseling & Silking Stage',
      timingLabel: '45 - 50 DAS',
      startDay: 45,
      endDay: 50,
      nFraction: 0.34,
      pFraction: 0.00,
      kFraction: 0.00,
      purpose: 'Ensures successful pollen viability, silk emergence, kernel setting, and reduces cob tip barrenness.',
      applicationMethod: 'Broadcast between rows when soil moisture is optimal; avoid application on wet leaves.'
    }
  ],
  'Sugarcane': [
    {
      stageId: 'basal',
      stageName: 'Basal (At Planting)',
      timingLabel: 'At Planting (0 DAP)',
      startDay: 0,
      endDay: 3,
      nFraction: 0.10,
      pFraction: 1.00,
      kFraction: 0.50,
      purpose: 'Aids sett bud sprout, settlement, and deep primary root development in the furrow.',
      applicationMethod: 'Apply in furrows below cane setts and cover lightly with loose soil before placing setts.'
    },
    {
      stageId: 'tillering',
      stageName: 'Tillering / Formative Phase',
      timingLabel: '45 - 60 DAP',
      startDay: 45,
      endDay: 60,
      nFraction: 0.45,
      pFraction: 0.00,
      kFraction: 0.00,
      purpose: 'Maximizes production of productive cane stalks and builds foliage canopy.',
      applicationMethod: 'Side-dress along cane lines in moist soil followed by inter-cultivation/weeding.'
    },
    {
      stageId: 'grand_growth',
      stageName: 'Grand Growth Phase & Earthing-Up',
      timingLabel: '90 - 120 DAP',
      startDay: 90,
      endDay: 120,
      nFraction: 0.45,
      pFraction: 0.00,
      kFraction: 0.50,
      purpose: 'Promotes rapid internode lengthening, stalk diameter thickening, sucrose synthesis, and drought/lodging tolerance.',
      applicationMethod: 'Apply along rows prior to final earthing-up; irrigate thoroughly within 24 hours.'
    }
  ],
  'Groundnut': [
    {
      stageId: 'basal',
      stageName: 'Basal (At Sowing)',
      timingLabel: 'At Sowing (0 DAS)',
      startDay: 0,
      endDay: 2,
      nFraction: 1.00,
      pFraction: 1.00,
      kFraction: 1.00,
      purpose: 'Provides starter nitrogen to carry the crop until Rhizobium nodulation becomes active at 15-20 DAS. Phosphorus promotes deep root nodulation.',
      applicationMethod: 'Drill or broadcast and incorporate into top 10 cm soil prior to sowing.'
    },
    {
      stageId: 'pegging',
      stageName: 'Pegging / Pod Development Phase',
      timingLabel: '35 - 45 DAS (Secondary Nutrient Advisory)',
      startDay: 35,
      endDay: 45,
      nFraction: 0.00,
      pFraction: 0.00,
      kFraction: 0.00,
      purpose: 'Developing pods absorb calcium directly from surrounding soil. Calcium prevents "pops" (empty pods), while sulfur increases oil content.',
      applicationMethod: 'Agronomic advisory: Apply Agricultural Gypsum (approx. 150-200 kg/acre) around the plant base followed by light earthing-up.'
    }
  ],
  'Pulses (Red Gram/Bengal Gram)': [
    {
      stageId: 'basal',
      stageName: 'Basal (At Sowing)',
      timingLabel: 'At Sowing (0 DAS)',
      startDay: 0,
      endDay: 2,
      nFraction: 1.00,
      pFraction: 1.00,
      kFraction: 1.00,
      purpose: 'Supplies starter nitrogen before native root nodules fix atmospheric nitrogen. High phosphorus encourages extensive taproot and nodule formation.',
      applicationMethod: 'Band placement 4-5 cm below seed depth using a seed-cum-fertilizer drill.'
    },
    {
      stageId: 'flowering_advisory',
      stageName: 'Flowering & Pod Initiation Stage',
      timingLabel: '35 - 45 DAS (Foliar Nutrition Advisory)',
      startDay: 35,
      endDay: 45,
      nFraction: 0.00,
      pFraction: 0.00,
      kFraction: 0.00,
      purpose: 'Maintains photosynthetic efficiency during reproductive peak and reduces premature floral drop.',
      applicationMethod: 'Agronomic advisory: Foliar spray of 2% DAP (20 g/L water) or 1% Potassium Nitrate (13-0-45) during morning hours at early flowering.'
    }
  ],
  'Vegetables / Tomato': [
    {
      stageId: 'basal',
      stageName: 'Basal (At Transplanting)',
      timingLabel: 'At Transplanting (0 DAT)',
      startDay: 0,
      endDay: 2,
      nFraction: 0.33,
      pFraction: 1.00,
      kFraction: 0.50,
      purpose: 'Assists seedling establishment, rapid root regeneration, and early vegetative branching.',
      applicationMethod: 'Incorporate into planting ridges/beds 5-10 cm deep prior to transplanting.'
    },
    {
      stageId: 'early_vegetative',
      stageName: 'Early Vegetative Growth',
      timingLabel: '20 - 25 DAT',
      startDay: 20,
      endDay: 25,
      nFraction: 0.33,
      pFraction: 0.00,
      kFraction: 0.00,
      purpose: 'Encourages vigorous lateral branch development and abundant flower cluster differentiation.',
      applicationMethod: 'Band placement 10 cm away from plant stems along the wet ridge; avoid touching foliage.'
    },
    {
      stageId: 'flowering_fruiting',
      stageName: 'Flowering & Fruit Development',
      timingLabel: '45 - 50 DAT',
      startDay: 45,
      endDay: 50,
      nFraction: 0.34,
      pFraction: 0.00,
      kFraction: 0.50,
      purpose: 'Supports uniform fruit enlargement, improves skin firmness, and enhances total soluble solids (TSS/Brix).',
      applicationMethod: 'Side-dress along ridges followed by scheduled drip/furrow irrigation.'
    }
  ]
};

/**
 * Categorize soil nutrient levels based on standard Indian soil testing criteria
 * Provisional adjustment factors aligned with STCR calibration logic
 * @param {number|undefined|null} value - Measured nutrient reading (kg/acre or index)
 * @param {string} nutrient - 'N', 'P', or 'K'
 * @returns {object} { status: 'Low'|'Medium'|'High'|'Unavailable', factor: number, description: string }
 */
export const evaluateSoilNutrient = (value, nutrient) => {
  if (value === undefined || value === null || value === '' || isNaN(Number(value))) {
    return {
      status: 'Unavailable',
      factor: 1.0,
      description: 'Soil test reading was not provided. Standard recommended dose applies.'
    };
  }

  const val = Number(value);

  // Benchmarks adjusted for per-acre field equivalent readings
  if (nutrient === 'N') {
    if (val < 113) {
      return { status: 'Low', factor: 1.25, description: 'Soil Nitrogen reserves are deficient (< 113 kg/acre).' };
    } else if (val <= 227) {
      return { status: 'Medium', factor: 1.0, description: 'Soil Nitrogen reserves are in balanced/sufficient range (113 - 227 kg/acre).' };
    } else {
      return { status: 'High', factor: 0.75, description: 'Soil Nitrogen reserves are rich/abundant (> 227 kg/acre).' };
    }
  } else if (nutrient === 'P') {
    if (val < 10) {
      return { status: 'Low', factor: 1.30, description: 'Available Phosphorus is low (< 10 kg/acre); root establishment may be impaired.' };
    } else if (val <= 25) {
      return { status: 'Medium', factor: 1.0, description: 'Available Phosphorus is in normal range (10 - 25 kg/acre).' };
    } else {
      return { status: 'High', factor: 0.70, description: 'Available Phosphorus is high (> 25 kg/acre); reduce application to prevent fixation.' };
    }
  } else if (nutrient === 'K') {
    if (val < 45) {
      return { status: 'Low', factor: 1.25, description: 'Available Potassium is low (< 45 kg/acre); lodging resistance and grain filling may suffer.' };
    } else if (val <= 113) {
      return { status: 'Medium', factor: 1.0, description: 'Available Potassium is in balanced range (45 - 113 kg/acre).' };
    } else {
      return { status: 'High', factor: 0.75, description: 'Available Potassium is high (> 113 kg/acre); reduce potash to prevent salt accumulation.' };
    }
  }

  return { status: 'Medium', factor: 1.0, description: 'Sufficient nutrient balance.' };
};

/**
 * Generate cautious advisory guidance for soil pH without guessing lime/gypsum requirements
 * @param {number|undefined|null} ph - Measured soil pH
 * @returns {object} { phValue, status, advisory, missingTests }
 */
export const evaluateSoilPh = (ph) => {
  if (ph === undefined || ph === null || ph === '' || isNaN(Number(ph))) {
    return {
      phValue: null,
      status: 'Not Provided',
      advisory: 'Soil pH was not provided. Most field crops thrive within pH 6.0 to 7.8. Periodic soil testing is advised.',
      missingTests: ['Soil pH (1:2.5 soil-water suspension)']
    };
  }

  const val = Number(ph);

  if (val < 6.0) {
    return {
      phValue: val,
      status: 'Acidic',
      advisory: `Soil test indicates acidic conditions (pH ${val.toFixed(1)}). In acid soils, phosphorus becomes fixed into insoluble iron/aluminum compounds and beneficial soil microbes are suppressed. While agricultural lime or dolomite is the standard amendment, precise application rates CANNOT be determined from pH alone without a laboratory Lime Requirement (buffer pH / SMP) test. Do not apply arbitrary lime quantities. Prefer Single Super Phosphate (SSP) over DAP for better phosphorus availability in acidic soils.`,
      missingTests: ['Laboratory Lime Requirement (Buffer pH / Shoemaker-McLean-Pratt SMP test)', 'Exchangeable Acidity (Al + H)']
    };
  } else if (val > 8.2) {
    return {
      phValue: val,
      status: 'Alkaline / Calcareous',
      advisory: `Soil test indicates alkaline reaction (pH ${val.toFixed(1)}). Under alkaline and calcareous conditions, phosphorus fixes into insoluble calcium phosphates, and micronutrients like Zinc and Iron become poorly available. If poor water infiltration or crusting is observed, gypsum may be needed; however, the exact quantity CANNOT be prescribed from pH alone without an Exchangeable Sodium Percentage (ESP) or Gypsum Requirement (Schoonover) test. Incorporate 2-3 tonnes/acre of organic FYM or green manure to release buffering organic acids.`,
      missingTests: ['Laboratory Gypsum Requirement (GR / Schoonover method)', 'Exchangeable Sodium Percentage (ESP)', 'Electrical Conductivity (ECe)']
    };
  }

  return {
    phValue: val,
    status: 'Optimal / Neutral',
    advisory: `Soil pH ${val.toFixed(1)} is within the favorable agronomic range (6.0 - 8.2) for balanced nutrient availability and microbial mineralization.`,
    missingTests: []
  };
};

/**
 * Helper to calculate calendar dates based on sowing date and relative days
 * @param {string|Date|null} sowingDate 
 * @param {number} startDay 
 * @param {number} endDay 
 * @returns {object} { startDateStr, endDateStr, formattedWindow }
 */
export const computeStageCalendarDates = (sowingDate, startDay, endDay) => {
  if (!sowingDate) {
    return {
      startDate: null,
      endDate: null,
      formattedWindow: `Day ${startDay} - Day ${endDay}`
    };
  }

  const base = new Date(sowingDate);
  if (isNaN(base.getTime())) {
    return {
      startDate: null,
      endDate: null,
      formattedWindow: `Day ${startDay} - Day ${endDay}`
    };
  }

  const startMs = base.getTime() + (startDay * 24 * 60 * 60 * 1000);
  const endMs = base.getTime() + (endDay * 24 * 60 * 60 * 1000);

  const startDateObj = new Date(startMs);
  const endDateObj = new Date(endMs);

  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  const startStr = startDateObj.toLocaleDateString('en-IN', options);
  const endStr = endDateObj.toLocaleDateString('en-IN', options);

  const formattedWindow = startStr === endStr ? startStr : `${startStr} – ${endStr}`;

  return {
    startDate: startDateObj.toISOString().split('T')[0],
    endDate: endDateObj.toISOString().split('T')[0],
    formattedWindow
  };
};

/**
 * Calculate fertilizer dosages, growth stage schedules, and safety guidance
 * Supports both General RDF (when NPK missing) and STCR Precision adjustments (when NPK provided)
 * 
 * @param {object} params
 * @param {string} params.soilType
 * @param {string} params.season
 * @param {string} params.crop
 * @param {number} [params.nitrogen]
 * @param {number} [params.phosphorus]
 * @param {number} [params.potassium]
 * @param {number} [params.ph]
 * @param {number} params.landArea - In acres
 * @param {string|Date} [params.sowingDate] - Sowing date in YYYY-MM-DD format
 * @returns {object} Comprehensive fertilizer recommendation
 */
export const calculateFertilizerRecommendation = ({
  soilType = 'Alluvial Soil',
  season = 'Kharif',
  crop = 'Rice (Paddy)',
  nitrogen,
  phosphorus,
  potassium,
  ph,
  landArea = 1,
  sowingDate = null
}) => {
  const baseReq = CROP_NUTRIENT_REQUIREMENTS[crop] || {
    n: 45,
    p: 20,
    k: 20,
    cropType: 'cereal',
    institutionReference: 'ICAR standard cereal package of practices',
    splits: { basal: '50% N + 100% P + 50% K', top1: '50% N at active tillering' }
  };

  const area = Number(landArea) > 0 ? Number(landArea) : 1;

  // Determine recommendation mode: General RDF vs STCR Precision
  const hasSoilTestN = nitrogen !== undefined && nitrogen !== null && nitrogen !== '' && !isNaN(Number(nitrogen));
  const hasSoilTestP = phosphorus !== undefined && phosphorus !== null && phosphorus !== '' && !isNaN(Number(phosphorus));
  const hasSoilTestK = potassium !== undefined && potassium !== null && potassium !== '' && !isNaN(Number(potassium));

  const isFullSoilTestAvailable = hasSoilTestN && hasSoilTestP && hasSoilTestK;
  const recommendationMode = isFullSoilTestAvailable 
    ? 'Precision STCR Soil-Test-Adjusted Plan'
    : 'General Agronomic Recommendation (Standard RDF)';

  // 1. Evaluate soil nutrients
  const nEval = evaluateSoilNutrient(nitrogen, 'N');
  const pEval = evaluateSoilNutrient(phosphorus, 'P');
  const kEval = evaluateSoilNutrient(potassium, 'K');

  // 2. Adjust target nutrient requirement
  // In General RDF mode (soil test not provided), multipliers default to 1.0
  let targetN = baseReq.n * (isFullSoilTestAvailable ? nEval.factor : 1.0);
  let targetP = baseReq.p * (isFullSoilTestAvailable ? pEval.factor : 1.0);
  let targetK = baseReq.k * (isFullSoilTestAvailable ? kEval.factor : 1.0);

  // 3. Soil Type Modifiers
  const isSandy = soilType.toLowerCase().includes('sandy');
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

  // 8. Soil pH Evaluation
  const soilPhAdvisory = evaluateSoilPh(ph);

  // 9. Fertilizer Combination Title & Summary
  const pSourceName = preferSSP ? 'Single Super Phosphate (SSP 16% P₂O₅)' : 'Di-Ammonium Phosphate (DAP 18-46-0)';
  const fertilizerCombination = preferSSP
    ? 'Urea (46% N) + SSP (16% P₂O₅ + 11% S) + MOP (60% K₂O) + Organic Manure'
    : 'Urea (46% N) + DAP (18-46-0) + MOP (60% K₂O) + Organic Manure';

  // 10. Detailed Reason for Each Recommendation
  const explanations = [
    `Urea (46% N): Recommended to fulfill net nitrogen requirement of ${Math.round(targetN)} kg/acre (${Math.round(remainingN)} kg net N after adjusting for phosphorus carrier). Nitrogen is crucial for chlorophyll synthesis and vigorous vegetative growth.`,
    `${pSourceName}: Recommended to supply ${Math.round(targetP)} kg/acre of P₂O₅. ${preferSSP ? 'SSP also supplies vital Sulfur and Calcium needed for root nodules and pod development.' : 'DAP efficiently provides concentrated water-soluble phosphorus alongside 18% starter ammoniacal nitrogen.'}`,
    `MOP (60% K₂O): Recommended to provide ${Math.round(targetK)} kg/acre of K₂O to enhance drought resistance, stem strength, and disease tolerance.`,
    `Organic Supplementation: Apply 2 to 3 tonnes of well-decomposed Farmyard Manure (FYM) or 500 kg Vermicompost per acre to improve microbial activity and soil cation exchange capacity (CEC).`
  ];

  if (!isFullSoilTestAvailable) {
    explanations.unshift('Standard Agronomic Recommendation: Soil test values were not fully provided. Dosages reflect standard ICAR/SAU baseline Recommended Dose of Fertilizer (RDF) for this crop.');
  } else {
    explanations.unshift('Precision STCR Advisory: Nutrient targets have been adjusted according to measured Soil Health Card values using provisional STCR category factors.');
  }

  // 11. Structured Crop Life-Cycle Stages Calculation
  const cropStages = CROP_LIFECYCLE_STAGES[crop] || [
    {
      stageId: 'basal',
      stageName: 'Basal Dose (Land Preparation)',
      timingLabel: 'At Sowing / Planting (0 DAS)',
      startDay: 0,
      endDay: 2,
      nFraction: 0.50,
      pFraction: 1.00,
      kFraction: 0.50,
      purpose: 'Initial root establishment and starter nutrition.',
      applicationMethod: 'Incorporate during final land preparation.'
    },
    {
      stageId: 'top1',
      stageName: 'Topdressing Stage',
      timingLabel: '25 - 30 DAS',
      startDay: 25,
      endDay: 30,
      nFraction: 0.50,
      pFraction: 0.00,
      kFraction: 0.50,
      purpose: 'Supports vegetative canopy development and stem strength.',
      applicationMethod: 'Broadcast in moist soil condition.'
    }
  ];

  // Calculate stage-by-stage quantities
  // Keep track of distributed quantities to ensure rounding sums match totalLandArea exactly
  let remainingUreaToDistribute = totalUrea;
  let remainingMopToDistribute = totalMOP;
  let remainingPToDistribute = preferSSP ? totalSSP : totalDAP;

  const lifecycleSchedule = cropStages.map((stg, index) => {
    const isLastStage = index === cropStages.length - 1;
    const calendarDates = computeStageCalendarDates(sowingDate, stg.startDay, stg.endDay);

    // Calculate stage nutrient goals
    const stageTargetN = targetN * stg.nFraction * area;
    const stageTargetP = targetP * stg.pFraction * area;
    const stageTargetK = targetK * stg.kFraction * area;

    const stageFertilizers = [];

    // Phosphorus carrier is applied 100% at basal in Indian agronomy
    if (stg.pFraction > 0) {
      const pQty = preferSSP ? totalSSP : totalDAP;
      stageFertilizers.push({
        fertilizerName: preferSSP ? 'Single Super Phosphate (SSP 16% P₂O₅)' : 'Di-Ammonium Phosphate (DAP 18-46-0)',
        carrierType: preferSSP ? 'SSP' : 'DAP',
        quantityKg: pQty,
        bags50kg: preferSSP ? pBags : pBags,
        splitPercentage: Math.round(stg.pFraction * 100),
        applicationTip: 'Apply full dose drilled or incorporated in soil at planting/sowing.'
      });
      remainingPToDistribute = 0;
    }

    // Urea distribution
    // For basal stage with DAP, starter N is provided by DAP, so basal urea is net remaining basal N
    let stageUreaKg = 0;
    if (stg.nFraction > 0) {
      if (isLastStage) {
        stageUreaKg = Math.max(0, remainingUreaToDistribute);
      } else {
        // Proportion of remaining net urea
        stageUreaKg = Math.round(totalUrea * stg.nFraction);
        remainingUreaToDistribute -= stageUreaKg;
      }

      if (stageUreaKg > 0) {
        stageFertilizers.push({
          fertilizerName: 'Urea (46% N)',
          carrierType: 'Urea',
          quantityKg: stageUreaKg,
          bags50kg: (stageUreaKg / 50).toFixed(1),
          splitPercentage: Math.round(stg.nFraction * 100),
          applicationTip: isSandy ? 'On sandy soils, split further into smaller frequent doses.' : 'Apply when soil is moist.'
        });
      }
    }

    // Potassium distribution
    let stageMopKg = 0;
    if (stg.kFraction > 0) {
      if (isLastStage) {
        stageMopKg = Math.max(0, remainingMopToDistribute);
      } else {
        stageMopKg = Math.round(totalMOP * stg.kFraction);
        remainingMopToDistribute -= stageMopKg;
      }

      if (stageMopKg > 0) {
        stageFertilizers.push({
          fertilizerName: 'Muriate of Potash (MOP 60% K₂O)',
          carrierType: 'MOP',
          quantityKg: stageMopKg,
          bags50kg: (stageMopKg / 50).toFixed(1),
          splitPercentage: Math.round(stg.kFraction * 100),
          applicationTip: 'Enhances water regulation, lodging resistance, and disease defense.'
        });
      }
    }

    return {
      stageId: stg.stageId,
      stageName: stg.stageName,
      timingLabel: stg.timingLabel,
      startDay: stg.startDay,
      endDay: stg.endDay,
      calendarWindow: calendarDates,
      purpose: stg.purpose,
      applicationMethod: stg.applicationMethod,
      nutrientsSupplied: {
        nKg: Math.round(stageTargetN),
        pKg: Math.round(stageTargetP),
        kKg: Math.round(stageTargetK)
      },
      fertilizers: stageFertilizers
    };
  });

  // 12. Text Application Guidance (Preserved for backward compatibility)
  const applicationGuidance = `
For ${area} Acre(s) of ${crop} in ${soilType} (${season}):
• Mode: ${recommendationMode}
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

  // 13. Safety Precautions
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
    sowingDate: sowingDate ? String(sowingDate) : null,
    recommendationMode,
    isFullSoilTestAvailable,
    fertilizerCombination,
    nutrientDeficitAnalysis: {
      nitrogen: { 
        measured: hasSoilTestN ? Number(nitrogen) : 'Not Provided', 
        status: nEval.status, 
        targetRate: `${Math.round(targetN)} kg/acre`, 
        description: nEval.description 
      },
      phosphorus: { 
        measured: hasSoilTestP ? Number(phosphorus) : 'Not Provided', 
        status: pEval.status, 
        targetRate: `${Math.round(targetP)} kg/acre`, 
        description: pEval.description 
      },
      potassium: { 
        measured: hasSoilTestK ? Number(potassium) : 'Not Provided', 
        status: kEval.status, 
        targetRate: `${Math.round(targetK)} kg/acre`, 
        description: kEval.description 
      }
    },
    soilPhAdvisory,
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
    lifecycleSchedule,
    institutionReference: baseReq.institutionReference || 'ICAR Standard Package of Practices',
    explanations,
    applicationGuidance,
    safetyPrecautions,
    advisoryDisclaimer: 'This fertilizer recommendation is an agronomic advisory based on standard crop removal rates and provisional Soil Test Crop Response (STCR) principles. Specific nutrient requirements may vary with seed hybrid, cropping history, and micro-climate. Verify with your local agricultural officer or soil testing laboratory.'
  };
};

export default {
  calculateFertilizerRecommendation,
  evaluateSoilNutrient,
  evaluateSoilPh,
  computeStageCalendarDates,
  CROP_NUTRIENT_REQUIREMENTS,
  CROP_LIFECYCLE_STAGES
};
