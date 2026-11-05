import http from 'http';
import app from './src/app.js';

const testServer = http.createServer(app);
const PORT = 5005;

const runFertilizerTests = async () => {
  const baseUrl = `http://localhost:${PORT}/api`;
  console.log('[Fertilizer Test] Starting comprehensive Fertilizer Recommendation tests...');

  // 1. Register test farmer
  const authRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Balwinder Singh',
      email: `balwinder.${Date.now()}@example.com`,
      password: 'FertilizerPassword2026',
      phone: '9876501234',
      preferredLanguage: 'hi',
      location: { state: 'Punjab', district: 'Ludhiana', city: 'Khanna' }
    })
  });
  const authData = await authRes.json();
  const token = authData.token;
  console.log('✅ 1. Test farmer registered with JWT authentication');

  // 2. Test unauthorized rejection (401)
  const unauthRes = await fetch(`${baseUrl}/fertilizer/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      soilType: 'Black Cotton Soil',
      season: 'Kharif (Monsoon: Jun - Oct)',
      crop: 'Cotton',
      nitrogen: 35,
      phosphorus: 20,
      potassium: 30,
      landArea: 2
    })
  });
  if (unauthRes.status !== 401) {
    throw new Error(`Test 2 Failed: Unauthenticated request was not rejected with 401 (${unauthRes.status})`);
  }
  console.log('✅ 2. Protected route rejected unauthenticated request with 401');

  // 3. Test Zod validation rejection (landArea <= 0 or negative N)
  const badInputRes = await fetch(`${baseUrl}/fertilizer/recommend`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      soilType: 'Black Cotton Soil',
      season: 'Kharif (Monsoon: Jun - Oct)',
      crop: 'Cotton',
      nitrogen: -15, // Invalid negative N
      phosphorus: 20,
      potassium: 30,
      landArea: 0 // Invalid 0 area
    })
  });
  const badData = await badInputRes.json();
  if (badInputRes.status !== 400 || !badData.errors) {
    throw new Error('Test 3 Failed: Invalid inputs were not rejected with Zod 400');
  }
  console.log('✅ 3. Zod validation caught and rejected negative nitrogen and zero land area');

  // 4. Scenario 1: Cotton on Black Cotton Soil (2 Acres)
  const cottonRes = await fetch(`${baseUrl}/fertilizer/recommend`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      soilType: 'Black Cotton Soil',
      season: 'Kharif (Monsoon: Jun - Oct)',
      crop: 'Cotton',
      nitrogen: 35,
      phosphorus: 20,
      potassium: 30,
      landArea: 2
    })
  });
  const cottonData = await cottonRes.json();
  if (cottonRes.status !== 200 || !cottonData.data.fertilizerCombination) {
    throw new Error(`Test 4 Failed: Cotton calculation failed (${cottonRes.status})`);
  }
  const rec1 = cottonData.data;
  console.log(`✅ 4. Scenario 1 (Cotton, 2 Acres): Recommended -> ${rec1.fertilizerCombination}`);
  console.log(`   • Total Urea: ${rec1.dosageBreakdown.totalLandArea.ureaTotalKg} kg (${rec1.dosageBreakdown.totalLandArea.ureaTotalBags})`);
  console.log(`   • Total DAP: ${rec1.dosageBreakdown.totalLandArea.pTotalKg} kg (${rec1.dosageBreakdown.totalLandArea.pTotalBags})`);
  console.log(`   • Total MOP: ${rec1.dosageBreakdown.totalLandArea.mopTotalKg} kg (${rec1.dosageBreakdown.totalLandArea.mopTotalBags})`);

  // 5. Scenario 2: Groundnut on Red Soil (3 Acres) -> Should recommend Single Super Phosphate (SSP)
  const groundnutRes = await fetch(`${baseUrl}/fertilizer/recommend`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      soilType: 'Red Soil',
      season: 'Kharif (Monsoon: Jun - Oct)',
      crop: 'Groundnut',
      nitrogen: 20,
      phosphorus: 15,
      potassium: 25,
      landArea: 3
    })
  });
  const groundnutData = await groundnutRes.json();
  if (groundnutRes.status !== 200) {
    throw new Error('Test 5 Failed: Groundnut calculation failed');
  }
  const rec2 = groundnutData.data;
  if (!rec2.fertilizerCombination.includes('SSP')) {
    throw new Error('Test 5 Failed: Red soil groundnut should trigger SSP (Single Super Phosphate) recommendation');
  }
  console.log(`✅ 5. Scenario 2 (Groundnut, Red Soil, 3 Acres): Triggered SSP -> ${rec2.fertilizerCombination}`);
  console.log(`   • Total SSP: ${rec2.dosageBreakdown.totalLandArea.pTotalKg} kg (${rec2.dosageBreakdown.totalLandArea.pTotalBags})`);

  // 6. Scenario 3: Rice with High Nitrogen soil -> Should apply reduction factor
  const riceRes = await fetch(`${baseUrl}/fertilizer/recommend`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      soilType: 'Clay Soil',
      season: 'Kharif (Monsoon: Jun - Oct)',
      crop: 'Rice (Paddy)',
      nitrogen: 280, // High N
      phosphorus: 18, // Medium P
      potassium: 90,  // Medium K
      landArea: 5
    })
  });
  const riceData = await riceRes.json();
  if (riceRes.status !== 200) {
    throw new Error('Test 6 Failed: Rice calculation failed');
  }
  const rec3 = riceData.data;
  if (rec3.nutrientDeficitAnalysis.nitrogen.status !== 'High') {
    throw new Error('Test 6 Failed: High nitrogen soil status was not recognized');
  }
  console.log(`✅ 6. Scenario 3 (Rice, High Soil N, 5 Acres): High N recognized (${rec3.nutrientDeficitAnalysis.nitrogen.status}) -> Target rate adjusted to ${rec3.nutrientDeficitAnalysis.nitrogen.targetRate}`);

  // 7. Verify recommendation history persistence
  const histRes = await fetch(`${baseUrl}/fertilizer/history`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const histData = await histRes.json();
  if (histRes.status !== 200 || histData.count < 3) {
    throw new Error(`Test 7 Failed: History retrieval failed (${histData.count} records)`);
  }
  console.log(`✅ 7. Fertilizer recommendation history verified in database: ${histData.count} records retrieved successfully.`);

  console.log('\n🌟 ALL 7 FERTILIZER RECOMMENDATION TESTS PASSED PERFECTLY!\n');
};

testServer.listen(PORT, async () => {
  try {
    await runFertilizerTests();
    testServer.close(() => process.exit(0));
  } catch (error) {
    console.error('❌ Fertilizer Test Failure:', error.message);
    testServer.close(() => process.exit(1));
  }
});
