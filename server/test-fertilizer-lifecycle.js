import { 
  calculateFertilizerRecommendation, 
  evaluateSoilNutrient, 
  evaluateSoilPh, 
  computeStageCalendarDates,
  CROP_NUTRIENT_REQUIREMENTS,
  CROP_LIFECYCLE_STAGES
} from './src/services/fertilizer.service.js';

console.log('\n======================================================================');
console.log('🌱 FERTILIZER LIFE-CYCLE PLANNING SERVICE – VERIFICATION TEST SUITE');
console.log('======================================================================\n');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    testsFailed++;
    throw new Error(message);
  } else {
    console.log(`✅ PASSED: ${message}`);
    testsPassed++;
  }
}

try {
  // -------------------------------------------------------------
  // Test 1: Baseline Units & Crop Nutrients Availability
  // -------------------------------------------------------------
  console.log('\n--- 1. Crop Nutrient Requirements & Institutional References ---');
  const supportedCrops = Object.keys(CROP_NUTRIENT_REQUIREMENTS);
  assert(supportedCrops.length >= 8, `Expected at least 8 supported crops, found ${supportedCrops.length}`);
  
  for (const cropName of supportedCrops) {
    const data = CROP_NUTRIENT_REQUIREMENTS[cropName];
    assert(data.n > 0 && data.p > 0 && data.k > 0, `${cropName} has valid baseline N, P2O5, K2O rates`);
    assert(Boolean(data.institutionReference), `${cropName} has identifiable ICAR/SAU reference`);
  }

  // -------------------------------------------------------------
  // Test 2: Mode A - General RDF when Soil Test Values are Omitted
  // -------------------------------------------------------------
  console.log('\n--- 2. General RDF Mode (Omitted Soil Test Values) ---');
  const genRec = calculateFertilizerRecommendation({
    crop: 'Rice (Paddy)',
    soilType: 'Clay Soil',
    season: 'Kharif',
    landArea: 2.5,
    sowingDate: '2026-06-15'
    // N, P, K, pH omitted
  });

  assert(genRec.recommendationMode.includes('General Agronomic Recommendation'), 'Recommendation mode is General RDF');
  assert(genRec.isFullSoilTestAvailable === false, 'isFullSoilTestAvailable is false');
  assert(genRec.nutrientDeficitAnalysis.nitrogen.measured === 'Not Provided', 'Missing N is not replaced with 0 or invented value');
  assert(genRec.nutrientDeficitAnalysis.phosphorus.measured === 'Not Provided', 'Missing P is not replaced with 0 or invented value');
  assert(genRec.nutrientDeficitAnalysis.potassium.measured === 'Not Provided', 'Missing K is not replaced with 0 or invented value');
  assert(genRec.dosageBreakdown.totalLandArea.acres === 2.5, 'Total land area scaled to 2.5 acres');
  assert(genRec.dosageBreakdown.totalLandArea.ureaTotalKg > 0, 'Urea calculated from standard RDF');
  assert(genRec.dosageBreakdown.totalLandArea.pTotalKg > 0, 'DAP calculated from standard RDF');
  assert(genRec.dosageBreakdown.totalLandArea.mopTotalKg > 0, 'MOP calculated from standard RDF');

  // -------------------------------------------------------------
  // Test 3: Mode B - Precision STCR Adjustment with Measured NPK
  // -------------------------------------------------------------
  console.log('\n--- 3. Precision STCR Adjustment Mode (Low Soil P, High Soil N) ---');
  const stcrRec = calculateFertilizerRecommendation({
    crop: 'Cotton',
    soilType: 'Black Cotton Soil',
    season: 'Kharif',
    landArea: 4,
    nitrogen: 280,   // High N (>227) -> factor 0.75
    phosphorus: 8,   // Low P (<10) -> factor 1.30
    potassium: 80,   // Medium K (45-113) -> factor 1.0
    sowingDate: '2026-06-01'
  });

  assert(stcrRec.recommendationMode.includes('Precision STCR'), 'Recommendation mode is STCR Precision');
  assert(stcrRec.isFullSoilTestAvailable === true, 'isFullSoilTestAvailable is true');
  assert(stcrRec.nutrientDeficitAnalysis.nitrogen.status === 'High', 'Recognized High Soil Nitrogen status');
  assert(stcrRec.nutrientDeficitAnalysis.phosphorus.status === 'Low', 'Recognized Low Soil Phosphorus status');
  assert(stcrRec.nutrientDeficitAnalysis.potassium.status === 'Medium', 'Recognized Medium Soil Potassium status');
  // Baseline Cotton: N=48, P=24. High N (48 * 0.75 = 36). Low P (24 * 1.30 = 31.2 -> ~31)
  assert(stcrRec.nutrientDeficitAnalysis.nitrogen.targetRate === '36 kg/acre', 'Target N adjusted by 0.75x factor to 36 kg/acre');
  assert(stcrRec.nutrientDeficitAnalysis.phosphorus.targetRate === '31 kg/acre', 'Target P adjusted by 1.30x factor to 31 kg/acre');

  // -------------------------------------------------------------
  // Test 4: Sowing Date to Calendar Date Windows Calculation
  // -------------------------------------------------------------
  console.log('\n--- 4. Sowing Date to Calendar Date Windows Calculation ---');
  const datesBasal = computeStageCalendarDates('2026-11-10', 0, 2);
  assert(datesBasal.startDate === '2026-11-10', 'Basal start date is 2026-11-10');
  assert(datesBasal.endDate === '2026-11-12', 'Basal end date is 2026-11-12');
  
  const datesCRI = computeStageCalendarDates('2026-11-10', 21, 25);
  assert(datesCRI.startDate === '2026-12-01', 'Crown Root Initiation start date is 2026-12-01');
  assert(datesCRI.endDate === '2026-12-05', 'Crown Root Initiation end date is 2026-12-05');

  // -------------------------------------------------------------
  // Test 5: Life-Cycle Schedule Structure & Bag Consistency
  // -------------------------------------------------------------
  console.log('\n--- 5. Life-Cycle Growth Schedule & Stage Quantities ---');
  const wheatRec = calculateFertilizerRecommendation({
    crop: 'Wheat',
    soilType: 'Alluvial Soil',
    season: 'Rabi',
    landArea: 5,
    sowingDate: '2026-11-15'
  });

  assert(Array.isArray(wheatRec.lifecycleSchedule), 'Lifecycle schedule is an array');
  assert(wheatRec.lifecycleSchedule.length === 2, 'Wheat has 2 verified growth stages (Basal & CRI)');
  
  const stage1 = wheatRec.lifecycleSchedule[0];
  const stage2 = wheatRec.lifecycleSchedule[1];
  assert(stage1.stageName.includes('Basal'), 'Stage 1 is Basal');
  assert(stage1.calendarWindow.startDate === '2026-11-15', 'Stage 1 starts on sowing date');
  assert(stage2.stageName.includes('Crown Root Initiation'), 'Stage 2 is Crown Root Initiation');
  assert(stage1.fertilizers.some(f => f.carrierType === 'DAP'), 'Stage 1 has DAP fertilizer');
  assert(stage2.fertilizers.some(f => f.carrierType === 'Urea'), 'Stage 2 has topdressing Urea');

  // Verify that the sum of stage Urea matches the total farm Urea
  const totalUreaFromStages = wheatRec.lifecycleSchedule.reduce((acc, stg) => {
    const ureaFert = stg.fertilizers.find(f => f.carrierType === 'Urea');
    return acc + (ureaFert ? ureaFert.quantityKg : 0);
  }, 0);
  assert(totalUreaFromStages === wheatRec.dosageBreakdown.totalLandArea.ureaTotalKg, 
    `Stage Urea sum (${totalUreaFromStages} kg) equals total farm Urea (${wheatRec.dosageBreakdown.totalLandArea.ureaTotalKg} kg)`);

  // -------------------------------------------------------------
  // Test 6: Soil pH Evaluation (Cautious Advisory Without Lime/Gypsum Guessing)
  // -------------------------------------------------------------
  console.log('\n--- 6. Soil pH Advisory & Missing Test Identification ---');
  
  // Acidic soil
  const acidPhEval = evaluateSoilPh(5.2);
  assert(acidPhEval.status === 'Acidic', 'Recognized acidic pH 5.2');
  assert(acidPhEval.advisory.includes('CANNOT be determined from pH alone'), 'Advisory states lime requirement cannot be determined from pH alone');
  assert(acidPhEval.missingTests.some(t => t.includes('Lime Requirement')), 'Identified missing Lime Requirement lab test');
  assert(!acidPhEval.advisory.includes('apply 250 kg lime'), 'Does NOT prescribe arbitrary lime quantity');

  // Alkaline soil
  const alkalinePhEval = evaluateSoilPh(8.7);
  assert(alkalinePhEval.status.includes('Alkaline'), 'Recognized alkaline pH 8.7');
  assert(alkalinePhEval.advisory.includes('CANNOT be prescribed from pH alone'), 'Advisory states gypsum requirement cannot be prescribed from pH alone');
  assert(alkalinePhEval.missingTests.some(t => t.includes('Gypsum Requirement')), 'Identified missing Gypsum Requirement lab test');

  // Neutral soil
  const neutralPhEval = evaluateSoilPh(7.0);
  assert(neutralPhEval.status.includes('Optimal'), 'Recognized neutral pH 7.0');
  assert(neutralPhEval.missingTests.length === 0, 'No missing tests for neutral soil');

  // -------------------------------------------------------------
  // Test 7: Backward Compatibility of All Fields
  // -------------------------------------------------------------
  console.log('\n--- 7. Backward Compatibility Check ---');
  const legacyCheck = calculateFertilizerRecommendation({
    soilType: 'Red Soil',
    season: 'Kharif',
    crop: 'Groundnut',
    nitrogen: 20,
    phosphorus: 15,
    potassium: 25,
    landArea: 3
  });

  assert(Boolean(legacyCheck.fertilizerCombination), 'fertilizerCombination present');
  assert(legacyCheck.fertilizerCombination.includes('SSP'), 'SSP selected for Groundnut on Red Soil');
  assert(Boolean(legacyCheck.nutrientDeficitAnalysis), 'nutrientDeficitAnalysis present');
  assert(Boolean(legacyCheck.dosageBreakdown?.totalLandArea), 'dosageBreakdown.totalLandArea present');
  assert(Boolean(legacyCheck.applicationGuidance), 'applicationGuidance text present');
  assert(Array.isArray(legacyCheck.explanations), 'explanations array present');
  assert(Array.isArray(legacyCheck.safetyPrecautions), 'safetyPrecautions array present');
  assert(Boolean(legacyCheck.advisoryDisclaimer), 'advisoryDisclaimer present');

  console.log('\n======================================================================');
  console.log(`🎉 ALL ${testsPassed} VERIFICATION TESTS PASSED SUCCESSFULLY!`);
  console.log('======================================================================\n');
  process.exit(0);

} catch (err) {
  console.error('\n❌ TEST RUN ABORTED DUE TO ERROR:\n', err);
  process.exit(1);
}

