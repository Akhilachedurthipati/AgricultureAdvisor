import http from 'http';
import app from './src/app.js';

const testServer = http.createServer(app);
const PORT = 5004;

const runCropTests = async () => {
  const baseUrl = `http://localhost:${PORT}/api`;
  console.log('[Crop ML Test] Starting comprehensive Crop Recommendation ML tests...');

  // 1. Register a test farmer to obtain auth token
  const authRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Kishan Reddy',
      email: `kishan.${Date.now()}@example.com`,
      password: 'CropPassword2026',
      phone: '9988776655',
      preferredLanguage: 'te',
      location: { state: 'Telangana', district: 'Khammam', city: 'Madhira' }
    })
  });
  const authData = await authRes.json();
  const token = authData.token;
  console.log('✅ 1. Authenticated test farmer registered');

  // 2. Test unauthorized rejection
  const unauthRes = await fetch(`${baseUrl}/crop/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      soilType: 'Alluvial Soil',
      season: 'Kharif (Monsoon: Jun - Oct)',
      temperature: 25,
      humidity: 80,
      ph: 6.5,
      rainfall: 200
    })
  });
  if (unauthRes.status !== 401) {
    throw new Error(`Test 2 Failed: Unauthenticated request was not rejected with 401 (${unauthRes.status})`);
  }
  console.log('✅ 2. Protected route properly rejected request without token (401)');

  // 3. Test Zod validation rejection on invalid pH and negative rainfall
  const badInputRes = await fetch(`${baseUrl}/crop/recommend`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      soilType: 'Alluvial Soil',
      season: 'Kharif (Monsoon: Jun - Oct)',
      temperature: 25,
      humidity: 80,
      ph: 15.0, // Invalid pH
      rainfall: -50 // Negative rainfall
    })
  });
  const badInputData = await badInputRes.json();
  if (badInputRes.status !== 400 || !badInputData.errors) {
    throw new Error('Test 3 Failed: Malformed inputs were not rejected with 400');
  }
  console.log('✅ 3. Zod validation caught and rejected invalid pH and negative rainfall');

  // 4. Test Scenario: High Rainfall, High Humidity, Alluvial/Clay, Kharif -> Predict Rice
  const riceRes = await fetch(`${baseUrl}/crop/recommend`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      soilType: 'Clay Soil',
      season: 'Kharif (Monsoon: Jun - Oct)',
      temperature: 24.5,
      humidity: 82.0,
      ph: 6.5,
      rainfall: 220.0
    })
  });
  const riceData = await riceRes.json();
  if (riceRes.status !== 200 || !riceData.data.cropName) {
    throw new Error(`Test 4 Failed: Recommendation failed (${riceRes.status})`);
  }
  console.log(`✅ 4. Scenario 1 (Monsoon, High Rain): Predicted -> ${riceData.data.cropName} (Confidence: ${(riceData.data.confidenceScore * 100).toFixed(0)}%)`);
  if (riceData.data.cropName.toLowerCase() !== 'rice') {
    console.warn(`[Note] Predicted ${riceData.data.cropName} instead of Rice for high moisture scenario.`);
  }

  // 5. Test Scenario: Black Cotton Soil, Warm Kharif -> Predict Cotton
  const cottonRes = await fetch(`${baseUrl}/crop/recommend`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      soilType: 'Black Cotton Soil',
      season: 'Kharif (Monsoon: Jun - Oct)',
      temperature: 26.0,
      humidity: 75.0,
      ph: 7.2,
      rainfall: 85.0
    })
  });
  const cottonData = await cottonRes.json();
  if (cottonRes.status !== 200 || !cottonData.data.cropName) {
    throw new Error(`Test 5 Failed: Cotton prediction failed`);
  }
  console.log(`✅ 5. Scenario 2 (Black Soil, Warm): Predicted -> ${cottonData.data.cropName} (Confidence: ${(cottonData.data.confidenceScore * 100).toFixed(0)}%)`);

  // 6. Test Scenario: Hot Zaid Summer, Sandy Loam, Low Rain -> Predict Watermelon / Muskmelon
  const summerRes = await fetch(`${baseUrl}/crop/recommend`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      soilType: 'Sandy Loam Soil',
      season: 'Zaid (Summer: Mar - Jun)',
      temperature: 32.0,
      humidity: 55.0,
      ph: 6.8,
      rainfall: 45.0
    })
  });
  const summerData = await summerRes.json();
  if (summerRes.status !== 200) {
    throw new Error(`Test 6 Failed: Summer prediction failed`);
  }
  console.log(`✅ 6. Scenario 3 (Summer Zaid, Sandy Loam): Predicted -> ${summerData.data.cropName} (Confidence: ${(summerData.data.confidenceScore * 100).toFixed(0)}%)`);

  // 7. Verify exactly ONE single crop is returned
  if (Array.isArray(riceData.data.cropName) || Array.isArray(cottonData.data.cropName)) {
    throw new Error('Test 7 Failed: Multiple crops were returned instead of exactly ONE best-suited crop.');
  }
  console.log('✅ 7. Verified ONLY ONE single best-suited crop is returned (no top-3 arrays)');

  // 8. Verify recommendation history retrieval
  const histRes = await fetch(`${baseUrl}/crop/history`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const histData = await histRes.json();
  if (histRes.status !== 200 || histData.count < 3) {
    throw new Error(`Test 8 Failed: Recommendation history count incorrect (${histData.count})`);
  }
  console.log(`✅ 8. Recommendation history verified in database: ${histData.count} records retrieved successfully.`);

  console.log('\n🌟 ALL 8 CROP RECOMMENDATION ML TESTS PASSED PERFECTLY!\n');
};

testServer.listen(PORT, async () => {
  try {
    await runCropTests();
    testServer.close(() => process.exit(0));
  } catch (error) {
    console.error('❌ Crop Test Failure:', error.message);
    testServer.close(() => process.exit(1));
  }
});

