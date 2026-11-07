import http from 'http';
import app from './src/app.js';
import { generateFarmerAlerts } from './src/services/weather.service.js';

const PORT = 5006;
const BASE_URL = `http://localhost:${PORT}`;

const testServer = http.createServer(app);

testServer.listen(PORT, async () => {
  console.log('\n[Weather Test] Starting comprehensive Weather Monitoring & Farmer Alerts tests...');

  try {
    // ----------------------------------------------------
    // TEST 1: Register authenticated test farmer
    // ----------------------------------------------------
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Suresh Reddy',
        email: `suresh.reddy.${Date.now()}@example.com`,
        password: 'Password@123',
        phoneNumber: '9123456789',
        preferredLanguage: 'en',
        location: { state: 'Andhra Pradesh', district: 'Guntur', city: 'Guntur' }
      })
    });

    const regData = await regRes.json();
    const token = regData.token || regData.data?.token;
    if (!regRes.ok || !token) {
      throw new Error(`Farmer registration failed: ${JSON.stringify(regData)}`);
    }
    console.log('✅ 1. Test farmer registered with JWT authentication');

    // ----------------------------------------------------
    // TEST 2: Protected route rejects unauthenticated request (401)
    // ----------------------------------------------------
    const unauthRes = await fetch(`${BASE_URL}/api/weather`);
    if (unauthRes.status !== 401) {
      throw new Error(`Expected 401 for unauthenticated request, got ${unauthRes.status}`);
    }
    console.log('✅ 2. Protected route properly rejected request without token (401)');

    // ----------------------------------------------------
    // TEST 3: Input validation catches invalid coordinates (400)
    // ----------------------------------------------------
    const invalidCoordRes = await fetch(`${BASE_URL}/api/weather?lat=999&lon=80`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (invalidCoordRes.status !== 400) {
      throw new Error(`Expected 400 for out-of-range latitude, got ${invalidCoordRes.status}`);
    }
    console.log('✅ 3. Zod validation caught and rejected invalid latitude bounds (400)');

    // ----------------------------------------------------
    // TEST 4: Fetch real live weather by city name (Guntur)
    // ----------------------------------------------------
    const cityRes = await fetch(`${BASE_URL}/api/weather?city=Guntur`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const cityData = await cityRes.json();

    if (!cityRes.ok || !cityData.success || !cityData.data) {
      throw new Error(`Failed to fetch weather by city: ${JSON.stringify(cityData)}`);
    }

    const w = cityData.data;
    if (!w.location || !w.current || !Array.isArray(w.forecast) || !Array.isArray(w.alerts)) {
      throw new Error(`Malformed weather structure: ${JSON.stringify(w)}`);
    }

    // Verify genuine metrics
    if (typeof w.current.temperature !== 'number' || typeof w.current.humidity !== 'number') {
      throw new Error(`Invalid current metrics: ${JSON.stringify(w.current)}`);
    }
    if (w.forecast.length !== 7) {
      throw new Error(`Expected 7-day forecast, got ${w.forecast.length} days`);
    }

    console.log(`✅ 4. Real live weather fetched for ${w.location.name}, ${w.location.state}:`);
    console.log(`   • Temp: ${w.current.temperature}°C (Feels like: ${w.current.apparentTemperature}°C)`);
    console.log(`   • Humidity: ${w.current.humidity}% | Wind: ${w.current.windSpeed} km/h | Condition: ${w.current.condition}`);
    console.log(`   • 7-Day Forecast: ${w.forecast.length} days parsed`);
    console.log(`   • Agricultural Alerts: ${w.alerts.length} active advisories`);

    // ----------------------------------------------------
    // TEST 5: Fetch real live weather by coordinates (17.3850, 78.4867 - Hyderabad)
    // ----------------------------------------------------
    const coordRes = await fetch(`${BASE_URL}/api/weather?lat=17.3850&lon=78.4867`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const coordData = await coordRes.json();
    if (!coordRes.ok || !coordData.success || !coordData.data?.current) {
      throw new Error(`Failed to fetch weather by coordinates: ${JSON.stringify(coordData)}`);
    }
    console.log(`✅ 5. Weather successfully fetched via GPS coordinates: ${coordData.data.current.temperature}°C, ${coordData.data.current.condition}`);

    // ----------------------------------------------------
    // TEST 6: In-memory cache returns quickly on repeated request
    // ----------------------------------------------------
    const cacheRes = await fetch(`${BASE_URL}/api/weather?lat=17.3850&lon=78.4867`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const cacheData = await cacheRes.json();
    if (!cacheRes.ok || !cacheData.data?.fromCache) {
      throw new Error(`Expected cached weather response, got fromCache=${cacheData.data?.fromCache}`);
    }
    console.log('✅ 6. In-memory weather cache operational (responded with fromCache: true)');

    // ----------------------------------------------------
    // TEST 7: Location search autocomplete endpoint works
    // ----------------------------------------------------
    const searchRes = await fetch(`${BASE_URL}/api/weather/search?q=Pune`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const searchData = await searchRes.json();
    if (!searchRes.ok || !Array.isArray(searchData.data) || searchData.data.length === 0) {
      throw new Error(`Location autocomplete search failed: ${JSON.stringify(searchData)}`);
    }
    console.log(`✅ 7. Location search autocomplete verified (${searchData.count} matches for "Pune")`);

    // ----------------------------------------------------
    // TEST 8: Agronomic Alert Engine Unit Tests
    // ----------------------------------------------------
    // Scenario A: Heavy Rain Threshold
    const simulatedHeavyRainCurrent = { temperature: 26, humidity: 90, windSpeed: 20, precipitation: 0, weatherCode: 65 };
    const simulatedHeavyRainForecast = [
      { date: '2026-11-08', tempMax: 28, tempMin: 22, rainSum: 48, rainProbability: 90, windSpeedMax: 22, weatherCode: 65 }
    ];
    const rainAlerts = generateFarmerAlerts(simulatedHeavyRainCurrent, simulatedHeavyRainForecast);
    const heavyRainAlert = rainAlerts.find(a => a.type === 'HEAVY_RAINFALL');
    if (!heavyRainAlert || heavyRainAlert.severity !== 'danger' || !heavyRainAlert.precautions.length) {
      throw new Error(`Heavy rain alert failed to trigger correctly: ${JSON.stringify(rainAlerts)}`);
    }
    console.log(`✅ 8a. Alert Engine: Heavy rain correctly generated danger alert with ${heavyRainAlert.precautions.length} precautions`);

    // Scenario B: Extreme Heatwave Threshold (>= 40°C)
    const simulatedHeatCurrent = { temperature: 42, humidity: 35, windSpeed: 10, precipitation: 0, weatherCode: 0 };
    const simulatedHeatForecast = [
      { date: '2026-11-08', tempMax: 43.5, tempMin: 28, rainSum: 0, rainProbability: 5, windSpeedMax: 12, weatherCode: 0 }
    ];
    const heatAlerts = generateFarmerAlerts(simulatedHeatCurrent, simulatedHeatForecast);
    const heatAlert = heatAlerts.find(a => a.type === 'EXTREME_HEAT');
    if (!heatAlert || heatAlert.severity !== 'danger' || !heatAlert.precautions.length) {
      throw new Error(`Heatwave alert failed to trigger correctly: ${JSON.stringify(heatAlerts)}`);
    }
    console.log(`✅ 8b. Alert Engine: Heatwave (43.5°C) correctly generated danger alert with ${heatAlert.precautions.length} precautions`);

    // Scenario C: Severe Storm / High Wind Threshold (>= 35 km/h)
    const simulatedStormCurrent = { temperature: 24, humidity: 85, windSpeed: 42, precipitation: 10, weatherCode: 95 };
    const simulatedStormForecast = [
      { date: '2026-11-08', tempMax: 26, tempMin: 20, rainSum: 20, rainProbability: 70, windSpeedMax: 45, weatherCode: 95 }
    ];
    const stormAlerts = generateFarmerAlerts(simulatedStormCurrent, simulatedStormForecast);
    const stormAlert = stormAlerts.find(a => a.type === 'SEVERE_STORM');
    if (!stormAlert || stormAlert.severity !== 'danger' || !stormAlert.precautions.some(p => p.toLowerCase().includes('lodging') || p.toLowerCase().includes('staking'))) {
      throw new Error(`Storm alert failed to trigger crop lodging precautions: ${JSON.stringify(stormAlerts)}`);
    }
    console.log('✅ 8c. Alert Engine: Severe storm correctly generated lodging and staking warnings');

    // Scenario D: Optimal Spraying Window (calm winds, mild temps, no rain)
    const simulatedSprayCurrent = { temperature: 24, humidity: 60, windSpeed: 8, precipitation: 0, weatherCode: 1 };
    const simulatedSprayForecast = [
      { date: '2026-11-08', tempMax: 28, tempMin: 19, rainSum: 0, rainProbability: 10, windSpeedMax: 10, weatherCode: 1 }
    ];
    const sprayAlerts = generateFarmerAlerts(simulatedSprayCurrent, simulatedSprayForecast);
    const sprayAlert = sprayAlerts.find(a => a.type === 'OPTIMAL_SPRAY_WINDOW');
    if (!sprayAlert || sprayAlert.severity !== 'info') {
      throw new Error(`Optimal spray window failed to trigger: ${JSON.stringify(sprayAlerts)}`);
    }
    console.log('✅ 8d. Alert Engine: Optimal spraying window identified under calm, dry weather');

    // ----------------------------------------------------
    // TEST 9: Non-existent city handling (404)
    // ----------------------------------------------------
    const notFoundRes = await fetch(`${BASE_URL}/api/weather?city=NonExistentCityXYZ999999`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (notFoundRes.status !== 404) {
      throw new Error(`Expected 404 for non-existent city, got ${notFoundRes.status}`);
    }
    console.log('✅ 9. Non-existent location gracefully returns 404 with helpful error message');

    console.log('\n🌟 ALL 9 WEATHER & FARMER ALERT TESTS PASSED PERFECTLY!\n');
    testServer.close(() => process.exit(0));
  } catch (err) {
    console.error('\n❌ Weather test failed:', err.message);
    testServer.close(() => process.exit(1));
  }
});
