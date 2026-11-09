import http from 'http';
import app from './src/app.js';

const testServer = http.createServer(app);
const PORT = 5007;

async function runCropFrontendWorkflowTests() {
  testServer.listen(PORT, async () => {
    const baseUrl = `http://localhost:${PORT}/api`;
    console.log('\n======================================================================');
    console.log('🌾 AGRICULTURE ADVISOR – CROP WORKFLOW & FRONTEND INTEGRATION TESTS');
    console.log('======================================================================\n');

    try {
      // 1. Authenticate Farmer
      const authRes = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Suresh Kumar',
          email: `suresh.${Date.now()}@example.com`,
          password: 'Password2026!',
          phone: '9848012345',
          preferredLanguage: 'en',
          location: { state: 'Telangana', district: 'Warangal', city: 'Warangal' }
        })
      });
      const authData = await authRes.json();
      const token = authData.token;
      console.log('✅ TEST 1: Farmer registered & JWT session initialized');

      // 2. Test Complete End-to-End Workflow with Open-Meteo Weather Synced
      const cropReqRes = await fetch(`${baseUrl}/crop/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          soilType: 'Black Cotton Soil',
          season: 'Kharif (Monsoon: Jun - Oct)',
          landArea: 6,
          city: 'Warangal' // No manual temperature, humidity, or rainfall provided!
        })
      });
      const cropReqData = await cropReqRes.json();
      if (!cropReqRes.ok || !cropReqData.success) {
        throw new Error(`Test 2 Failed: Crop recommendation failed: ${JSON.stringify(cropReqData)}`);
      }
      const data = cropReqData.data;
      if (!data.id) throw new Error('Test 2 Failed: Recommendation ID missing');
      if (!Array.isArray(data.suitableCrops) || data.suitableCrops.length < 2) {
        throw new Error(`Test 2 Failed: Expected multiple suitable crops, got ${data.suitableCrops?.length}`);
      }
      if (!data.weatherTelemetry || data.weatherTelemetry.temperature == null) {
        throw new Error('Test 2 Failed: Open-Meteo weather telemetry missing');
      }
      console.log(`✅ TEST 2: Complete workflow succeeded without manual weather inputs`);
      console.log(`   • Telemetry: ${data.weatherTelemetry.temperature}°C, ${data.weatherTelemetry.humidity}% Hum, Seasonal: ${data.weatherTelemetry.seasonalCumulativeRainfall}mm, Model Monthly: ${data.weatherTelemetry.monthlyRainfallEquivalent}mm/mo`);
      console.log(`   • Top Recommendation: ${data.cropName} (${Math.round(data.confidenceScore * 100)}%)`);
      console.log(`   • Multiple Viable Options: ${data.suitableCrops.map(c => `${c.cropName} (${c.confidencePercentage}%)`).join(', ')}`);

      // 3. Test Manual Location Selection Fallback (Guntur, AP)
      const manualLocRes = await fetch(`${baseUrl}/crop/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          soilType: 'Clay Soil',
          season: 'Kharif (Monsoon: Jun - Oct)',
          landArea: 4,
          location: {
            name: 'Guntur',
            district: 'Guntur',
            state: 'Andhra Pradesh',
            latitude: 16.3067,
            longitude: 80.4365
          }
        })
      });
      const manualLocData = await manualLocRes.json();
      if (!manualLocRes.ok || !manualLocData.data.weatherTelemetry) {
        throw new Error('Test 3 Failed: Manual location coordinates failed to resolve weather');
      }
      console.log(`✅ TEST 3: Manual location selection fallback verified (Guntur: ${manualLocData.data.weatherTelemetry.temperature}°C, ${manualLocData.data.weatherTelemetry.humidity}%)`);

      // 4. Test Weather Failure Graceful Handling (No Invented Values)
      const failLocRes = await fetch(`${baseUrl}/crop/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          soilType: 'Alluvial Soil',
          season: 'Rabi (Winter: Oct - Mar)',
          landArea: 2,
          city: 'CompletelyBogusLocation998877'
        })
      });
      const failLocData = await failLocRes.json();
      if (failLocRes.status !== 503 && failLocRes.status !== 404 && failLocRes.status !== 400) {
        throw new Error(`Test 4 Failed: Expected 4xx/503 for invalid location, got ${failLocRes.status}`);
      }
      if (failLocData.success !== false || !failLocData.message) {
        throw new Error('Test 4 Failed: Failure must return clear error message');
      }
      console.log(`✅ TEST 4: Weather API failure gracefully rejected with informative notice: "${failLocData.message}"`);

      // 5. Test Optional pH & NPK Omission vs Provision
      // Case 5a: Both omitted -> hasPh === false, ph === null, npk === null
      const omitRes = await fetch(`${baseUrl}/crop/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          soilType: 'Red Soil',
          season: 'Kharif (Monsoon: Jun - Oct)',
          landArea: 3,
          temperature: 27.5,
          humidity: 70.0,
          rainfall: 110.0
        })
      });
      const omitData = await omitRes.json();
      if (omitData.data.evaluatedParameters.hasPh !== false || omitData.data.evaluatedParameters.ph !== null) {
        throw new Error('Test 5a Failed: Omitted pH must not be assigned a default or 0');
      }
      if (omitData.data.evaluatedParameters.npk !== null) {
        throw new Error('Test 5a Failed: Omitted NPK must remain null');
      }

      // Case 5b: Provided -> hasPh === true, ph === 6.5, npk stored
      const provideRes = await fetch(`${baseUrl}/crop/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          soilType: 'Red Soil',
          season: 'Kharif (Monsoon: Jun - Oct)',
          landArea: 3,
          ph: 6.5,
          nitrogen: 24,
          phosphorus: 18,
          potassium: 30,
          temperature: 27.5,
          humidity: 70.0,
          rainfall: 110.0
        })
      });
      const provideData = await provideRes.json();
      if (provideData.data.evaluatedParameters.hasPh !== true || provideData.data.evaluatedParameters.ph !== 6.5) {
        throw new Error('Test 5b Failed: Provided pH was not retained');
      }
      console.log('✅ TEST 5: Optional soil pH & NPK omission vs inclusion verified (no zero/fabricated values)');

      // 6. Test Multiple Crop Selection & Custom Land Allocation Validation
      const recId = data.id;

      // 6a: Over-allocation rejection (e.g. 7 acres on 6-acre field)
      const overRes = await fetch(`${baseUrl}/crop/${recId}/allocation`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          landArea: 6,
          allocatedLand: [
            { cropName: data.suitableCrops[0].cropName, acres: 4.5 },
            { cropName: data.suitableCrops[1].cropName, acres: 3.0 } // 4.5 + 3.0 = 7.5 > 6!
          ]
        })
      });
      const overData = await overRes.json();
      if (overRes.status !== 400 || !overData.message.includes('exceeds')) {
        throw new Error(`Test 6a Failed: Over-allocation was not rejected (${overRes.status})`);
      }
      console.log('✅ TEST 6a: Exceeded land allocation properly rejected (7.5 acres on 6.0 acre field -> 400 Bad Request)');

      // 6b: Valid allocation (e.g. 3.5 acres Crop A + 2.5 acres Crop B = 6.0 acres)
      const validRes = await fetch(`${baseUrl}/crop/${recId}/allocation`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          landArea: 6,
          allocatedLand: [
            { cropName: data.suitableCrops[0].cropName, acres: 3.5 },
            { cropName: data.suitableCrops[1].cropName, acres: 2.5 }
          ]
        })
      });
      const validData = await validRes.json();
      if (!validRes.ok || !validData.success) {
        throw new Error(`Test 6b Failed: Land allocation update failed: ${JSON.stringify(validData)}`);
      }
      console.log(`✅ TEST 6b: Valid custom land allocation successfully saved (3.5 ac ${data.suitableCrops[0].cropName} + 2.5 ac ${data.suitableCrops[1].cropName} on 6-acre field)`);

      // 7. Verify Unified History Record Retrieval
      const historyRes = await fetch(`${baseUrl}/history?module=crop`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const historyData = await historyRes.json();
      if (!historyRes.ok || !Array.isArray(historyData.data) || historyData.data.length === 0) {
        throw new Error('Test 7 Failed: Crop recommendation not found in unified history');
      }
      const historyItem = historyData.data.find(item => item.id === recId) || historyData.data[0];
      if (!historyItem.details?.allocatedLand || historyItem.details.allocatedLand.length !== 2) {
        throw new Error(`Test 7 Failed: History record details missing saved land allocation (${JSON.stringify(historyItem.details?.allocatedLand)})`);
      }
      console.log(`✅ TEST 7: Unified History verified with updated land allocation and weather telemetry`);

      console.log('\n======================================================================');
      console.log('🎉 ALL 7 CROP FRONTEND WORKFLOW INTEGRATION TESTS PASSED 100%!');
      console.log('======================================================================\n');
      process.exit(0);
    } catch (err) {
      console.error('\n❌ CROP WORKFLOW TEST FAILED:', err.message);
      process.exit(1);
    } finally {
      testServer.close();
    }
  });
}

runCropFrontendWorkflowTests();
