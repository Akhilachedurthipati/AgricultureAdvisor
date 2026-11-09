import http from 'http';
import app from './src/app.js';

const testServer = http.createServer(app);
const PORT = 5006;

async function runPhase1Tests() {
  testServer.listen(PORT, async () => {
    const baseUrl = `http://localhost:${PORT}/api`;
    console.log('\n======================================================================');
    console.log('🌾 AGRICULTURE ADVISOR – CROP RECOMMENDATION PHASE 1 VERIFICATION');
    console.log('======================================================================\n');

    try {
      // 1. Authenticate a test farmer
      const authRes = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Ramesh Patel',
          email: `ramesh.${Date.now()}@example.com`,
          password: 'Password1234',
          phone: '9876501234',
          preferredLanguage: 'en',
          location: { state: 'Telangana', district: 'Warangal', city: 'Warangal' }
        })
      });
      const authData = await authRes.json();
      const token = authData.token;
      console.log('✅ STEP 1: Test farmer authenticated successfully');

      // 2. Test Missing Optional Inputs (No pH, No NPK)
      // Must not pass 0 or fabricated numbers to the model
      const noPhRes = await fetch(`${baseUrl}/crop/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          soilType: 'Black Cotton Soil',
          season: 'Kharif (Monsoon: Jun - Oct)',
          landArea: 4,
          // ph omitted
          // npk omitted
          temperature: 28.0,
          humidity: 76.0,
          rainfall: 95.0
        })
      });
      const noPhData = await noPhRes.json();
      if (!noPhRes.ok || !noPhData.success) {
        throw new Error(`Step 2 Failed: Request with omitted optional pH failed (${noPhRes.status}): ${JSON.stringify(noPhData)}`);
      }
      if (noPhData.data.evaluatedParameters.hasPh !== false) {
        throw new Error('Step 2 Failed: Evaluated parameters must indicate hasPh === false when omitted');
      }
      if (noPhData.data.evaluatedParameters.ph !== null) {
        throw new Error('Step 2 Failed: Omitted pH must remain null, never zero or fabricated');
      }
      console.log(`✅ STEP 2: Optional input omission verified (pH omitted, evaluated without zero-substitution, top crop: ${noPhData.data.cropName})`);

      // 3. Test Automatic Weather Retrieval via Location (Open-Meteo Integration)
      const weatherLocRes = await fetch(`${baseUrl}/crop/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          soilType: 'Clay Soil',
          season: 'Kharif (Monsoon: Jun - Oct)',
          landArea: 5,
          city: 'Warangal' // triggers Open-Meteo weather fetch
        })
      });
      const weatherLocData = await weatherLocRes.json();
      if (!weatherLocRes.ok || !weatherLocData.success) {
        throw new Error(`Step 3 Failed: Location-based weather resolution failed: ${JSON.stringify(weatherLocData)}`);
      }
      const telemetry = weatherLocData.data.weatherTelemetry;
      if (!telemetry || !telemetry.dataSource || telemetry.temperature == null || telemetry.humidity == null) {
        throw new Error('Step 3 Failed: Weather telemetry metadata missing from response');
      }
      if (!telemetry.monthlyRainfallEquivalent || telemetry.monthlyRainfallEquivalent > 350) {
        throw new Error(`Step 3 Failed: Monthly rainfall equivalent out of model bounds: ${telemetry.monthlyRainfallEquivalent}`);
      }
      console.log(`✅ STEP 3: Open-Meteo weather integration verified (${telemetry.location?.name || 'Warangal'}: ${telemetry.temperature}°C, ${telemetry.humidity}%, Seasonal Rain: ${telemetry.seasonalCumulativeRainfall}mm, Model Monthly: ${telemetry.monthlyRainfallEquivalent}mm/mo)`);

      // 4. Test Weather Failure Handling (No Silent Guessing / No Fabrication)
      const badLocRes = await fetch(`${baseUrl}/crop/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          soilType: 'Alluvial Soil',
          season: 'Rabi (Winter: Oct - Mar)',
          landArea: 3,
          city: 'NonExistentCityXYZ9999999999'
        })
      });
      const badLocData = await badLocRes.json();
      if (badLocRes.status !== 503 && badLocRes.status !== 404 && badLocRes.status !== 400) {
        throw new Error(`Step 4 Failed: Expected 4xx/503 error on unresolvable location, got ${badLocRes.status}`);
      }
      if (!badLocData.message || badLocData.success !== false) {
        throw new Error('Step 4 Failed: Unresolvable location must return success: false with clear message');
      }
      console.log(`✅ STEP 4: Weather failure correctly handled without silent guessing ("${badLocData.message}")`);

      // 5. Test Multiple Suitable Crop Recommendations
      const multiRes = await fetch(`${baseUrl}/crop/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          soilType: 'Alluvial Soil',
          season: 'Kharif (Monsoon: Jun - Oct)',
          landArea: 6,
          temperature: 26.0,
          humidity: 80.0,
          rainfall: 150.0
        })
      });
      const multiData = await multiRes.json();
      const crops = multiData.data.suitableCrops;
      if (!Array.isArray(crops) || crops.length < 2) {
        throw new Error(`Step 5 Failed: Expected multiple suitable crops (>=2), got ${crops?.length || 0}`);
      }
      crops.forEach((c, idx) => {
        if (!c.cropName || c.confidencePercentage == null || !c.waterDemand || !c.cultivationGuide) {
          throw new Error(`Step 5 Failed: Candidate crop at index ${idx} is missing required agronomic fields`);
        }
      });
      console.log(`✅ STEP 5: Multiple suitable crop recommendations verified (${crops.length} options: ${crops.map(c => `${c.cropName} [${c.confidencePercentage}%]`).join(', ')})`);

      // 6. Test Land Allocation Validation: Exceeding Available Land Rejection
      const overAllocRes = await fetch(`${baseUrl}/crop/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          soilType: 'Clay Soil',
          season: 'Kharif (Monsoon: Jun - Oct)',
          landArea: 3, // 3 acres total
          allocatedLand: [
            { cropName: 'Rice', acres: 2.5 },
            { cropName: 'Jute', acres: 2.0 } // 2.5 + 2.0 = 4.5 > 3 acres!
          ],
          temperature: 25.0,
          humidity: 82.0,
          rainfall: 210.0
        })
      });
      const overAllocData = await overAllocRes.json();
      if (overAllocRes.status !== 400 || !overAllocData.message.includes('exceeds')) {
        throw new Error(`Step 6 Failed: Allocation exceeding available land was not rejected with 400 (${overAllocRes.status})`);
      }
      console.log('✅ STEP 6: Over-allocation validation verified (rejected 4.5 acres on 3-acre field with 400 Bad Request)');

      // 7. Test Valid Land Allocation & Update Endpoint
      const validAllocRes = await fetch(`${baseUrl}/crop/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          soilType: 'Clay Soil',
          season: 'Kharif (Monsoon: Jun - Oct)',
          landArea: 5,
          allocatedLand: [
            { cropName: 'Rice', acres: 3.5 },
            { cropName: 'Banana', acres: 1.5 }
          ],
          temperature: 25.0,
          humidity: 82.0,
          rainfall: 210.0
        })
      });
      const validAllocData = await validAllocRes.json();
      if (!validAllocRes.ok || validAllocData.data.allocatedLand.length !== 2) {
        throw new Error('Step 7 Failed: Valid land allocation failed to save');
      }
      const recId = validAllocData.data.id;

      // Update allocation via dedicated PUT endpoint
      const updateAllocRes = await fetch(`${baseUrl}/crop/${recId}/allocation`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          landArea: 5,
          allocatedLand: [
            { cropName: 'Rice', acres: 4.0 },
            { cropName: 'Banana', acres: 1.0 }
          ]
        })
      });
      const updateAllocData = await updateAllocRes.json();
      if (!updateAllocRes.ok || !updateAllocData.success) {
        throw new Error(`Step 7 Failed: PUT /api/crop/${recId}/allocation failed: ${JSON.stringify(updateAllocData)}`);
      }
      console.log(`✅ STEP 7: Farmer custom land allocation saved and updated successfully (4.0 ac Rice + 1.0 ac Banana on 5-acre field)`);

      console.log('\n======================================================================');
      console.log('🎉 ALL 7 PHASE 1 BACKEND VERIFICATION TESTS PASSED 100%!');
      console.log('======================================================================\n');
      process.exit(0);
    } catch (err) {
      console.error('\n❌ PHASE 1 TEST SUITE FAILED:', err.message);
      process.exit(1);
    } finally {
      testServer.close();
    }
  });
}

runPhase1Tests();

