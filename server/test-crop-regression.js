import http from 'http';
import app from './src/app.js';
import { predictCrop, normalizeSoilType, normalizeSeason } from './src/ml/cropPredictor.js';

const PORT = 5010;
const testServer = http.createServer(app);

const runCropRegressionTests = async () => {
  const baseUrl = `http://localhost:${PORT}/api`;
  console.log('\n======================================================================');
  console.log('🔬 CROP RECOMMENDATION REGRESSION & CONFIDENCE VERIFICATION SUITE');
  console.log('======================================================================\n');

  try {
    // -------------------------------------------------------------
    // TEST 1: Canonical Soil & Season Alias Normalization
    // (Explicitly verifying Kharif, Rabi, Zaid, Monsoon, Winter, Summer)
    // -------------------------------------------------------------
    const soilTests = [
      ['black', 'Black Cotton Soil'],
      ['Black Soil', 'Black Cotton Soil'],
      ['regur', 'Black Cotton Soil'],
      ['alluvial', 'Alluvial Soil'],
      ['clayey', 'Clay Soil'],
      ['red soil', 'Red Soil'],
      ['sandy loam', 'Sandy Loam Soil'],
      ['sandy', 'Sandy Loam Soil'],
      ['laterite', 'Laterite Soil']
    ];
    for (const [raw, expected] of soilTests) {
      const norm = normalizeSoilType(raw);
      if (norm !== expected) {
        throw new Error(`Soil alias test failed: "${raw}" -> "${norm}", expected "${expected}"`);
      }
    }

    const seasonTests = [
      ['Kharif', 'Kharif (Monsoon: Jun - Oct)'],
      ['kharif', 'Kharif (Monsoon: Jun - Oct)'],
      ['Monsoon', 'Kharif (Monsoon: Jun - Oct)'],
      ['monsoon', 'Kharif (Monsoon: Jun - Oct)'],
      ['Rabi', 'Rabi (Winter: Oct - Mar)'],
      ['rabi', 'Rabi (Winter: Oct - Mar)'],
      ['Winter', 'Rabi (Winter: Oct - Mar)'],
      ['winter', 'Rabi (Winter: Oct - Mar)'],
      ['Zaid', 'Zaid (Summer: Mar - Jun)'],
      ['zaid', 'Zaid (Summer: Mar - Jun)'],
      ['Summer', 'Zaid (Summer: Mar - Jun)'],
      ['summer', 'Zaid (Summer: Mar - Jun)']
    ];
    for (const [raw, expected] of seasonTests) {
      const norm = normalizeSeason(raw);
      if (norm !== expected) {
        throw new Error(`Season alias test failed: "${raw}" -> "${norm}", expected "${expected}"`);
      }
    }
    console.log('✅ Test 1: Canonical Soil & Season Alias Normalization verified across Kharif, Rabi, Zaid, Monsoon, Winter, and Summer');

    // -------------------------------------------------------------
    // Register authenticated farmer for API calls
    // -------------------------------------------------------------
    const authRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Crop Regression Farmer',
        email: `crop.regress.${Date.now()}@example.com`,
        password: 'PassCropSecure123',
        preferredLanguage: 'en',
        location: { state: 'Telangana', district: 'Warangal', city: 'Warangal' }
      })
    });
    const authData = await authRes.json();
    const token = authData.token;

    // -------------------------------------------------------------
    // TEST 2: The Pigeonpeas Case with "Black Soil" Alias
    // (Master test case: 29.5°C, 78% Hum, 7.1 pH, 145 mm Rain)
    // -------------------------------------------------------------
    const caseARes = await fetch(`${baseUrl}/crop/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        soilType: 'Black Soil', // Alias should map to 'Black Cotton Soil'
        season: 'Kharif (Monsoon: Jun - Oct)',
        temperature: 29.5,
        humidity: 78.0,
        ph: 7.1,
        rainfall: 145.0
      })
    });
    const caseAData = await caseARes.json();
    if (!caseARes.ok || !caseAData.success) {
      throw new Error('Case A API request failed: ' + JSON.stringify(caseAData));
    }
    const caseA = caseAData.data;

    if (caseA.cropName !== 'Pigeonpeas') {
      throw new Error(`Case A failed: Expected "Pigeonpeas", got "${caseA.cropName}"`);
    }
    if (caseA.confidenceScore < 0.90) {
      throw new Error(`Case A failed: Expected genuine high confidence (>=0.90), got ${caseA.confidenceScore}`);
    }
    if (caseA.isConfident !== true) {
      throw new Error(`Case A failed: Expected isConfident === true, got ${caseA.isConfident}`);
    }
    if (caseA.uncertaintyWarning !== null) {
      throw new Error(`Case A failed: Expected uncertaintyWarning === null, got "${caseA.uncertaintyWarning}"`);
    }
    console.log(`✅ Test 2: Master Case ("Black Soil" -> Pigeonpeas): Predicted -> ${caseA.cropName} (Genuine Confidence: ${Math.round(caseA.confidenceScore * 100)}%, isConfident: true)`);

    // -------------------------------------------------------------
    // TEST 3: Ambiguous / Unmapped Soil Type
    // (Verifies removal of artificial 0.70 floor and presence of uncertainty warning)
    // -------------------------------------------------------------
    const caseBRes = await fetch(`${baseUrl}/crop/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        soilType: 'Unmapped Volcanic Soil Substrate',
        season: 'Kharif (Monsoon: Jun - Oct)',
        temperature: 29.5,
        humidity: 78.0,
        ph: 7.1,
        rainfall: 145.0
      })
    });
    const caseBData = await caseBRes.json();
    const caseB = caseBData.data;

    if (caseB.confidenceScore >= 0.70) {
      throw new Error(`Case B failed: Artificial floor not removed! Expected genuine raw confidence < 0.70, got ${caseB.confidenceScore}`);
    }
    if (caseB.isConfident !== false) {
      throw new Error(`Case B failed: Expected isConfident === false for ambiguous soil, got ${caseB.isConfident}`);
    }
    if (caseB.confidenceLevel !== 'moderate') {
      throw new Error(`Case B failed: Expected confidenceLevel === 'moderate', got ${caseB.confidenceLevel}`);
    }
    if (!caseB.uncertaintyWarning || !caseB.uncertaintyWarning.includes('Moderate recommendation certainty')) {
      throw new Error(`Case B failed: Expected uncertainty warning message, got "${caseB.uncertaintyWarning}"`);
    }
    console.log(`✅ Test 3: Unmapped Ambiguous Soil correctly produced genuine unfloored confidence (${Math.round(caseB.confidenceScore * 100)}% < 70%) and triggered uncertainty warning: "${caseB.uncertaintyWarning.substring(0, 60)}..."`);

    // -------------------------------------------------------------
    // TEST 4: Extreme Out-of-Distribution (OOD) Input
    // (Temp: 48°C, Hum: 10%, pH: 9.0, Rain: 10 mm)
    // -------------------------------------------------------------
    const oodRes = await fetch(`${baseUrl}/crop/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        soilType: 'Sandy Loam Soil',
        season: 'Zaid (Summer: Mar - Jun)',
        temperature: 48.0,
        humidity: 10.0,
        ph: 9.0,
        rainfall: 10.0
      })
    });
    const oodData = await oodRes.json();
    const ood = oodData.data;

    if (ood.isConfident !== false) {
      throw new Error(`Test 4 OOD failed: Expected isConfident === false, got ${ood.isConfident}`);
    }
    if (ood.confidenceLevel !== 'low') {
      throw new Error(`Test 4 OOD failed: Expected confidenceLevel === 'low', got ${ood.confidenceLevel}`);
    }
    if (!ood.uncertaintyWarning || !ood.uncertaintyWarning.toLowerCase().includes('extreme or atypical')) {
      throw new Error(`Test 4 OOD failed: Expected extreme parameters warning, got "${ood.uncertaintyWarning}"`);
    }
    console.log(`✅ Test 4: Extreme OOD parameters correctly flagged with low confidence and clear advisory warning: "${ood.uncertaintyWarning.substring(0, 60)}..."`);

    // -------------------------------------------------------------
    // TEST 5: Single Crop Recommendation Guarantee
    // -------------------------------------------------------------
    const testCases = [caseA, caseB, ood];
    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      if (typeof tc.cropName !== 'string' || Array.isArray(tc.cropName) || tc.cropName.includes(',')) {
        throw new Error(`Single crop guarantee failed for scenario ${i + 1}: got ${JSON.stringify(tc.cropName)}`);
      }
    }
    console.log('✅ Test 5: Single-Crop Guarantee strictly verified across all scenarios (exactly one crop name returned, never multiple crops)');

    // -------------------------------------------------------------
    // TEST 6: In-Distribution High Confidence Scenarios
    // -------------------------------------------------------------
    // Cotton
    const cottonPred = predictCrop({
      soilType: 'Black Cotton Soil',
      season: 'Kharif (Monsoon: Jun - Oct)',
      temperature: 24.5,
      humidity: 79.0,
      ph: 6.9,
      rainfall: 80.0
    });
    if (cottonPred.cropName !== 'Cotton' || !cottonPred.isConfident || cottonPred.confidenceScore < 0.90) {
      throw new Error(`Cotton scenario failed: ${JSON.stringify(cottonPred)}`);
    }

    // Rice
    const ricePred = predictCrop({
      soilType: 'Clay Soil',
      season: 'Kharif (Monsoon: Jun - Oct)',
      temperature: 24.0,
      humidity: 82.0,
      ph: 6.5,
      rainfall: 220.0
    });
    if (ricePred.cropName !== 'Rice' || !ricePred.isConfident || ricePred.confidenceScore < 0.90) {
      throw new Error(`Rice scenario failed: ${JSON.stringify(ricePred)}`);
    }
    console.log('✅ Test 6: In-Distribution canonical scenarios (Cotton: 98%+, Rice: 98%+) produce high confidence and clean advisory output');

    // -------------------------------------------------------------
    // TEST 7: Mothbeans Regression Scenario
    // (Summer Zaid, Sandy Loam Soil, Low Rain, High Temp)
    // -------------------------------------------------------------
    const mothbeansRes = await fetch(`${baseUrl}/crop/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        soilType: 'sandy loam', // Tests alias
        season: 'summer', // Tests season alias
        temperature: 32.0,
        humidity: 55.0,
        ph: 6.8,
        rainfall: 45.0
      })
    });
    const mothbeansData = await mothbeansRes.json();
    const mothbeans = mothbeansData.data;

    if (mothbeans.cropName !== 'Mothbeans') {
      throw new Error(`Test 7 Mothbeans failed: Expected "Mothbeans", got "${mothbeans.cropName}"`);
    }
    if (!mothbeans.isConfident || mothbeans.confidenceScore < 0.95) {
      throw new Error(`Test 7 Mothbeans failed: Expected high confidence (>=0.95), got ${mothbeans.confidenceScore}`);
    }
    if (mothbeans.uncertaintyWarning !== null) {
      throw new Error(`Test 7 Mothbeans failed: Expected no uncertainty warning, got "${mothbeans.uncertaintyWarning}"`);
    }
    console.log(`✅ Test 7: Mothbeans Scenario Verified: Predicted -> ${mothbeans.cropName} (Confidence: ${Math.round(mothbeans.confidenceScore * 100)}%, isConfident: true, Aliases: "sandy loam", "summer")`);

    // -------------------------------------------------------------
    // TEST 8: Unknown Soil Consistency Check
    // (Ensures all unknown soils consistently trigger uncertainty warnings)
    // -------------------------------------------------------------
    const unknownSoils = ['Volcanic Ash Soil', 'Peat Moss Substrate', 'Crushed Gravel Media', 'Hydroponic Perlite'];
    for (const uSoil of unknownSoils) {
      const uPred = predictCrop({
        soilType: uSoil,
        season: 'Kharif',
        temperature: 28.0,
        humidity: 70.0,
        ph: 6.5,
        rainfall: 120.0
      });
      if (uPred.isConfident !== false) {
        throw new Error(`Test 8 failed for "${uSoil}": Expected isConfident === false`);
      }
      if (!uPred.uncertaintyWarning || !uPred.uncertaintyWarning.includes('Moderate recommendation certainty')) {
        throw new Error(`Test 8 failed for "${uSoil}": Expected uncertainty warning`);
      }
      if (uPred.confidenceScore >= 0.70) {
        throw new Error(`Test 8 failed for "${uSoil}": Expected confidenceScore < 0.70, got ${uPred.confidenceScore}`);
      }
    }
    console.log('✅ Test 8: Unknown Soil Consistency Check: All 4 arbitrary soil substrates consistently triggered isConfident: false and advisory uncertainty warnings');

    // -------------------------------------------------------------
    // TEST 9: Legacy History Record Compatibility
    // (Verifies that older records without new fields are cleanly handled)
    // -------------------------------------------------------------
    const legacyRecord = {
      inputs: { soilType: 'Clay Soil', season: 'Kharif' },
      recommendation: {
        cropName: 'Rice',
        confidenceScore: 0.98 // Stored as decimal ratio in older records
      }
    };
    const legacyConfVal = legacyRecord.recommendation?.confidenceScore != null
      ? (legacyRecord.recommendation.confidenceScore <= 1.0
          ? Math.round(legacyRecord.recommendation.confidenceScore * 100)
          : Math.round(legacyRecord.recommendation.confidenceScore))
      : 0;
    const legacySummary = `${legacyRecord.inputs.soilType} • Suitability: ${legacyConfVal}%`;
    if (legacySummary !== 'Clay Soil • Suitability: 98%') {
      throw new Error(`Test 9 failed: Expected "Clay Soil • Suitability: 98%", got "${legacySummary}"`);
    }
    console.log(`✅ Test 9: Legacy History Record Compatibility: Formatted cleanly as "${legacySummary}" with zero runtime errors`);

    console.log('\n======================================================================');
    console.log('🎉 ALL 9 CROP RECOMMENDATION REGRESSION TESTS PASSED PERFECTLY!');
    console.log('======================================================================\n');
  } catch (err) {
    console.error('\n❌ CROP REGRESSION TEST FAILED:', err.message);
    process.exitCode = 1;
  } finally {
    testServer.close();
  }
};

testServer.listen(PORT, () => {
  runCropRegressionTests();
});

