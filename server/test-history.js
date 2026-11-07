import http from 'http';
import app from './src/app.js';

const testServer = http.createServer(app);
const PORT = 5008;

const runHistoryTests = async () => {
  const baseUrl = `http://localhost:${PORT}/api`;
  console.log('\n[History Test] Starting comprehensive Unified History & Multi-Tenant Isolation tests...');

  // 1. Register Farmer A
  const authResA = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Ramesh Patel',
      email: `ramesh.${Date.now()}@example.com`,
      password: 'SecurePassword123',
      preferredLanguage: 'en',
      location: { state: 'Gujarat', district: 'Anand', city: 'Anand' }
    })
  });
  const authDataA = await authResA.json();
  const tokenA = authDataA.token;
  const userAId = authDataA.user?.id || authDataA.user?._id;
  console.log('✅ 1. Test Farmer A registered with JWT authentication');

  // 2. Register Farmer B (for multi-tenant isolation verification)
  const authResB = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Suresh Kumar',
      email: `suresh.${Date.now()}@example.com`,
      password: 'SecurePassword456',
      preferredLanguage: 'hi',
      location: { state: 'Punjab', district: 'Ludhiana', city: 'Ludhiana' }
    })
  });
  const authDataB = await authResB.json();
  const tokenB = authDataB.token;
  console.log('✅ 2. Test Farmer B registered with JWT authentication (Tenant Isolation)');

  // 3. Create Crop Recommendation for Farmer A
  const cropRes = await fetch(`${baseUrl}/crop/recommend`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenA}`
    },
    body: JSON.stringify({
      soilType: 'Black Soil',
      season: 'Kharif (Monsoon: Jun - Oct)',
      temperature: 28,
      humidity: 70,
      ph: 7.2,
      rainfall: 120
    })
  });
  const cropData = await cropRes.json();
  if (cropRes.status !== 200) {
    throw new Error(`Crop creation failed: ${JSON.stringify(cropData)}`);
  }
  console.log('✅ 3. Crop recommendation created for Farmer A');

  // 4. Create Fertilizer Recommendation for Farmer A
  const fertRes = await fetch(`${baseUrl}/fertilizer/recommend`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenA}`
    },
    body: JSON.stringify({
      soilType: 'Black Soil',
      season: 'Kharif',
      crop: 'Cotton',
      nitrogen: 120,
      phosphorus: 25,
      potassium: 180,
      landArea: 2,
      landAreaUnit: 'Acres'
    })
  });
  const fertData = await fertRes.json();
  if (fertRes.status !== 200) {
    throw new Error(`Fertilizer creation failed: ${JSON.stringify(fertData)}`);
  }
  console.log('✅ 4. Fertilizer plan created for Farmer A');

  // 5. Create Chat Consultation for Farmer A
  const chatRes = await fetch(`${baseUrl}/chat/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenA}`
    },
    body: JSON.stringify({
      message: 'What natural methods control pests in cotton?',
      language: 'en'
    })
  });
  const chatData = await chatRes.json();
  if (chatRes.status !== 200) {
    throw new Error(`Chat creation failed: ${JSON.stringify(chatData)}`);
  }
  console.log('✅ 5. Chat consultation logged for Farmer A');

  // 6. Query Unified History for Farmer A
  const histResA = await fetch(`${baseUrl}/history`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  const histDataA = await histResA.json();
  if (histResA.status !== 200 || !Array.isArray(histDataA.data) || histDataA.data.length < 3) {
    throw new Error(`Unified history query failed: ${JSON.stringify(histDataA)}`);
  }

  const modulesFound = new Set(histDataA.data.map(d => d.module));
  if (!modulesFound.has('crop') || !modulesFound.has('fertilizer') || !modulesFound.has('chat')) {
    throw new Error(`Expected crop, fertilizer, and chat records, found: ${Array.from(modulesFound).join(', ')}`);
  }
  console.log(`✅ 6. Centralized history aggregated successfully (${histDataA.data.length} records across modules: ${Array.from(modulesFound).join(', ')})`);

  // 7. Verify Module Filtering
  const cropFilterRes = await fetch(`${baseUrl}/history?module=crop`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  const cropFilterData = await cropFilterRes.json();
  const allCrop = cropFilterData.data.every(d => d.module === 'crop');
  if (!allCrop || cropFilterData.data.length === 0) {
    throw new Error(`Module filter failed: ${JSON.stringify(cropFilterData)}`);
  }
  console.log(`✅ 7a. Module filter (module=crop) verified: ${cropFilterData.data.length} crop records returned`);

  const fertFilterRes = await fetch(`${baseUrl}/history?module=fertilizer`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  const fertFilterData = await fertFilterRes.json();
  const allFert = fertFilterData.data.every(d => d.module === 'fertilizer');
  if (!allFert || fertFilterData.data.length === 0) {
    throw new Error(`Module filter failed: ${JSON.stringify(fertFilterData)}`);
  }
  console.log(`✅ 7b. Module filter (module=fertilizer) verified: ${fertFilterData.data.length} fertilizer records returned`);

  // 8. Verify Search Filtering
  const searchRes = await fetch(`${baseUrl}/history?search=Cotton`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  const searchData = await searchRes.json();
  if (searchRes.status !== 200 || searchData.data.length === 0) {
    throw new Error(`Search filter failed: ${JSON.stringify(searchData)}`);
  }
  console.log(`✅ 8. Keyword search filter verified: ${searchData.data.length} records matched "Cotton"`);

  // 9. Verify Pagination
  const pageRes = await fetch(`${baseUrl}/history?page=1&limit=2`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  const pageData = await pageRes.json();
  if (pageRes.status !== 200 || pageData.data.length > 2 || pageData.totalPages < 2) {
    throw new Error(`Pagination failed: ${JSON.stringify(pageData)}`);
  }
  console.log(`✅ 9. Pagination verified: page=${pageData.page}, limit=${pageData.limit}, totalPages=${pageData.totalPages}`);

  // 10. Single Record Retrieval
  const targetRecord = histDataA.data[0];
  const detailRes = await fetch(`${baseUrl}/history/${targetRecord.module}/${targetRecord.id}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  const detailData = await detailRes.json();
  if (detailRes.status !== 200 || detailData.data.id !== targetRecord.id) {
    throw new Error(`Detail fetch failed: ${JSON.stringify(detailData)}`);
  }
  console.log(`✅ 10. Single record retrieved by ID: "${detailData.data.title}"`);

  // 11. STRICT MULTI-TENANT ISOLATION TESTS
  // Farmer B attempts to GET Farmer A's record -> MUST RETURN 403 FORBIDDEN
  const intruderGetRes = await fetch(`${baseUrl}/history/${targetRecord.module}/${targetRecord.id}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${tokenB}` }
  });
  if (intruderGetRes.status !== 403) {
    throw new Error(`Tenant Isolation Breach! Farmer B accessed Farmer A's record with status: ${intruderGetRes.status}`);
  }
  console.log('✅ 11a. Security Isolation: Farmer B unauthorized read rejected with 403 Forbidden');

  // Farmer B attempts to DELETE Farmer A's record -> MUST RETURN 403 FORBIDDEN
  const intruderDelRes = await fetch(`${baseUrl}/history/${targetRecord.module}/${targetRecord.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${tokenB}` }
  });
  if (intruderDelRes.status !== 403) {
    throw new Error(`Tenant Isolation Breach! Farmer B deleted Farmer A's record with status: ${intruderDelRes.status}`);
  }
  console.log('✅ 11b. Security Isolation: Farmer B unauthorized delete rejected with 403 Forbidden');

  // 12. Delete Single Record by Owner (Farmer A)
  const delRes = await fetch(`${baseUrl}/history/${targetRecord.module}/${targetRecord.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  const delData = await delRes.json();
  if (delRes.status !== 200 || !delData.success) {
    throw new Error(`Delete failed: ${JSON.stringify(delData)}`);
  }
  console.log(`✅ 12. Single record deleted successfully by owner`);

  // 13. Clear All History for Farmer A
  const clearRes = await fetch(`${baseUrl}/history/clear?module=all`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  const clearData = await clearRes.json();
  if (clearRes.status !== 200 || !clearData.success) {
    throw new Error(`Clear failed: ${JSON.stringify(clearData)}`);
  }

  // 14. Verify Farmer A history is empty
  const verifyHistRes = await fetch(`${baseUrl}/history`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  const verifyHistData = await verifyHistRes.json();
  if (verifyHistData.count !== 0 || verifyHistData.data.length !== 0) {
    throw new Error(`Expected 0 history records for Farmer A after clear, got: ${verifyHistData.count}`);
  }
  console.log('✅ 13. History clear verified: Farmer A records empty');

  // 15. Verify Farmer Profile Update via JWT
  const updateProfileRes = await fetch(`${baseUrl}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenA}`
    },
    body: JSON.stringify({
      name: 'Ramesh Bhai Patel',
      phone: '9876543210',
      preferredLanguage: 'hi',
      location: { state: 'Gujarat', district: 'Anand', city: 'Vallabh Vidyanagar' }
    })
  });
  const updateProfileData = await updateProfileRes.json();
  if (updateProfileRes.status !== 200 || updateProfileData.user?.name !== 'Ramesh Bhai Patel') {
    throw new Error(`Profile update failed: ${JSON.stringify(updateProfileData)}`);
  }
  console.log('✅ 14. Farmer profile update API validated with JWT and Zod');

  console.log('\n🌟 ALL 14 RECOMMENDATION HISTORY & PROFILE TESTS PASSED PERFECTLY!\n');
};

testServer.listen(PORT, async () => {
  try {
    await runHistoryTests();
    testServer.close();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ HISTORY TEST FAILED:', err.message);
    testServer.close();
    process.exit(1);
  }
});
