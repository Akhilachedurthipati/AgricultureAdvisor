import http from 'http';
import app from './src/app.js';
import { isValidCalendarDate } from './src/controllers/fertilizer.controller.js';

const testServer = http.createServer(app);
const PORT = 5006;

const runStep2Tests = async () => {
  const baseUrl = `http://localhost:${PORT}/api`;
  console.log('\n======================================================================');
  console.log('🧪 FERTILIZER STEP 2: CONTROLLER, ZOD SCHEMA & MODEL INTEGRATION TESTS');
  console.log('======================================================================\n');

  let testsPassed = 0;

  function assert(condition, message) {
    if (!condition) {
      console.error(`❌ FAILED: ${message}`);
      throw new Error(message);
    } else {
      console.log(`✅ PASSED: ${message}`);
      testsPassed++;
    }
  }

  // 1. Calendar date validator unit tests
  console.log('--- 1. Calendar Date Validation Engine ---');
  assert(isValidCalendarDate('2026-11-15') === true, '2026-11-15 is a valid calendar date');
  assert(isValidCalendarDate('2024-02-29') === true, '2024-02-29 (leap year) is valid');
  assert(isValidCalendarDate('2025-02-29') === false, '2025-02-29 (non-leap year) is rejected');
  assert(isValidCalendarDate('2026-02-31') === false, '2026-02-31 (impossible date) is rejected');
  assert(isValidCalendarDate('2026-04-31') === false, '2026-04-31 (30 days in April) is rejected');
  assert(isValidCalendarDate('not-a-date') === false, 'Malformed string is rejected');
  assert(isValidCalendarDate('') === false, 'Empty string is rejected');

  // 2. Register a test farmer for JWT authentication
  console.log('\n--- 2. Farmer Authentication ---');
  const regRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Harpreet Kaur',
      email: `harpreet.${Date.now()}@testagri.org`,
      password: 'SecureAgronomyPass2026',
      preferredLanguage: 'hi',
      location: { state: 'Punjab', district: 'Bathinda', city: 'Bathinda' }
    })
  });
  const regData = await regRes.json();
  assert(regRes.status === 201 && Boolean(regData.token), 'Farmer registered with JWT token');
  const token = regData.token;

  // 3. Negative NPK Rejection
  console.log('\n--- 3. Negative NPK Validation Rejection ---');
  const negNRes = await fetch(`${baseUrl}/fertilizer/recommend`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      soilType: 'Black Cotton Soil',
      season: 'Kharif',
      crop: 'Cotton',
      nitrogen: -25, // Negative
      landArea: 2
    })
  });
  const negNData = await negNRes.json();
  assert(negNRes.status === 400 && Boolean(negNData.errors), 'Negative nitrogen rejected with 400 validation error');

  // 4. Invalid pH Rejection (< 3.0 or > 11.0)
  console.log('\n--- 4. Invalid pH Validation Rejection ---');
  const badPhRes = await fetch(`${baseUrl}/fertilizer/recommend`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      soilType: 'Alluvial Soil',
      season: 'Rabi',
      crop: 'Wheat',
      ph: 12.5, // Exceeds 11.0
      landArea: 3
    })
  });
  assert(badPhRes.status === 400, 'pH 12.5 rejected with 400 validation error');

  const lowPhRes = await fetch(`${baseUrl}/fertilizer/recommend`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      soilType: 'Alluvial Soil',
      season: 'Rabi',
      crop: 'Wheat',
      ph: 2.1, // Below 3.0
      landArea: 3
    })
  });
  assert(lowPhRes.status === 400, 'pH 2.1 rejected with 400 validation error');

  // 5. Invalid Calendar Date Rejection
  console.log('\n--- 5. Invalid Calendar Date Validation Rejection ---');
  const badDateRes = await fetch(`${baseUrl}/fertilizer/recommend`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      soilType: 'Alluvial Soil',
      season: 'Rabi',
      crop: 'Wheat',
      sowingDate: '2026-02-31', // Non-existent date
      landArea: 3
    })
  });
  assert(badDateRes.status === 400, 'Non-existent calendar date 2026-02-31 rejected with 400');

  // 6. General RDF when ALL NPK values are omitted (with optional pH omitted)
  console.log('\n--- 6. General RDF Mode (All NPK Omitted, No pH) ---');
  const genAllRes = await fetch(`${baseUrl}/fertilizer/recommend`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      soilType: 'Clay Soil',
      season: 'Kharif',
      crop: 'Rice (Paddy)',
      landArea: 3
    })
  });
  const genAllData = await genAllRes.json();
  assert(genAllRes.status === 200, 'General RDF request succeeded with 200 OK');
  assert(genAllData.data.recommendationMode.includes('General Agronomic Recommendation'), 
    'Mode is General Agronomic Recommendation (Standard RDF)');
  assert(genAllData.data.isFullSoilTestAvailable === false, 'isFullSoilTestAvailable is false');
  assert(genAllData.data.nutrientDeficitAnalysis.nitrogen.measured === 'Not Provided', 
    'Missing N not substituted with zero');
  assert(Array.isArray(genAllData.data.lifecycleSchedule) && genAllData.data.lifecycleSchedule.length >= 3,
    'Returned structured lifecycleSchedule with at least 3 stages');

  // 7. General RDF when only 1 or 2 NPK values are supplied
  console.log('\n--- 7. General RDF Mode (Partial NPK: Only Nitrogen Provided) ---');
  const genPartialRes = await fetch(`${baseUrl}/fertilizer/recommend`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      soilType: 'Clay Soil',
      season: 'Kharif',
      crop: 'Rice (Paddy)',
      nitrogen: 120, // Only N provided; P & K omitted
      landArea: 3
    })
  });
  const genPartialData = await genPartialRes.json();
  assert(genPartialRes.status === 200, 'Partial NPK request succeeded with 200 OK');
  assert(genPartialData.data.recommendationMode.includes('General Agronomic Recommendation'),
    'Partial NPK correctly falls back to General Agronomic Recommendation');
  assert(genPartialData.data.isFullSoilTestAvailable === false, 'Partial NPK leaves isFullSoilTestAvailable false');
  assert(genPartialData.data.nutrientDeficitAnalysis.nitrogen.measured === 120, 'Measured N preserved');
  assert(genPartialData.data.nutrientDeficitAnalysis.phosphorus.measured === 'Not Provided', 'Missing P noted as Not Provided');

  // 8. Precision STCR when ALL THREE NPK values are supplied (with valid pH and valid sowing date)
  console.log('\n--- 8. Precision STCR Mode (Full NPK, pH, Sowing Date) ---');
  const stcrFullRes = await fetch(`${baseUrl}/fertilizer/recommend`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      soilType: 'Black Cotton Soil',
      season: 'Kharif',
      crop: 'Cotton',
      nitrogen: 40,
      phosphorus: 12,
      potassium: 35,
      ph: 7.4,
      sowingDate: '2026-06-15',
      landArea: 2.5
    })
  });
  const stcrFullData = await stcrFullRes.json();
  assert(stcrFullRes.status === 200, 'Full STCR request succeeded with 200 OK');
  assert(stcrFullData.data.recommendationMode.includes('Precision STCR'), 'Mode is Precision STCR');
  assert(stcrFullData.data.isFullSoilTestAvailable === true, 'isFullSoilTestAvailable is true');
  assert(stcrFullData.data.sowingDate === '2026-06-15', 'Sowing date preserved');
  assert(stcrFullData.data.soilPhAdvisory.status.includes('Optimal'), 'Soil pH 7.4 recognized as Optimal');
  
  // Verify calendar window generation
  const basalStage = stcrFullData.data.lifecycleSchedule[0];
  assert(basalStage.calendarWindow.startDate === '2026-06-15', 'Basal start date matches sowing date');
  assert(Boolean(basalStage.calendarWindow.formattedWindow), 'Formatted calendar window exists');

  // 9. Verify History Retrieval (Database Persistence & Unified Serialization)
  console.log('\n--- 9. History Retrieval & Serialization ---');
  const histRes = await fetch(`${baseUrl}/fertilizer/history`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const histData = await histRes.json();
  assert(histRes.status === 200, 'History fetched with 200 OK');
  assert(histData.count >= 3, `History contains stored records (count: ${histData.count})`);
  
  // Verify latest stored record in history
  const latestRec = histData.data[0];
  assert(latestRec.inputs.crop === 'Cotton', 'Latest history record matches Cotton');
  assert(latestRec.inputs.landArea === 2.5, 'Latest history landArea is 2.5');
  assert(latestRec.inputs.sowingDate === '2026-06-15', 'History preserved sowingDate');
  assert(latestRec.recommendation.recommendationMode.includes('Precision STCR'), 'History preserved recommendationMode');
  assert(Array.isArray(latestRec.recommendation.lifecycleSchedule) && latestRec.recommendation.lifecycleSchedule.length >= 3,
    'History preserved lifecycleSchedule array with stages');

  // Unified History endpoint verification
  const uniHistRes = await fetch(`${baseUrl}/history?module=fertilizer`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const uniHistData = await uniHistRes.json();
  assert(uniHistRes.status === 200, 'Unified history endpoint succeeded');
  assert(uniHistData.data.length >= 3, 'Unified history returns standardized fertilizer records');
  assert(uniHistData.data[0].module === 'fertilizer', 'Unified record has module: fertilizer');

  console.log('\n======================================================================');
  console.log(`🎉 ALL ${testsPassed} STEP 2 INTEGRATION TESTS PASSED PERFECTLY!`);
  console.log('======================================================================\n');
};

testServer.listen(PORT, async () => {
  try {
    await runStep2Tests();
    testServer.close(() => process.exit(0));
  } catch (err) {
    console.error('\n❌ STEP 2 TEST RUN FAILED:', err.message);
    testServer.close(() => process.exit(1));
  }
});
