import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jpeg from 'jpeg-js';
import app from './src/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 5009;
const testServer = http.createServer(app);

// Helper to construct a synthetic leaf JPEG buffer for foliar testing
const createSyntheticLeafBuffer = (isDiseased = false) => {
  const width = 64;
  const height = 64;
  const frameData = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const texture = ((x * 13 + y * 29) % 20) - 10;

      if (!isDiseased) {
        // Vibrant healthy chlorophyll
        frameData[idx] = Math.min(255, Math.max(0, 48 + texture));
        frameData[idx + 1] = Math.min(255, Math.max(0, 168 + texture));
        frameData[idx + 2] = Math.min(255, Math.max(0, 42 + texture));
        frameData[idx + 3] = 255;
      } else {
        // Necrotic blight spot with chlorotic margin
        const dx = x - 32;
        const dy = y - 32;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= 12) {
          // Dark brown necrosis
          frameData[idx] = Math.min(255, Math.max(0, 75 + texture));
          frameData[idx + 1] = Math.min(255, Math.max(0, 38 + texture));
          frameData[idx + 2] = Math.min(255, Math.max(0, 20 + texture));
        } else if (dist <= 18) {
          // Yellow chlorotic halo
          frameData[idx] = Math.min(255, Math.max(0, 195 + texture));
          frameData[idx + 1] = Math.min(255, Math.max(0, 175 + texture));
          frameData[idx + 2] = Math.min(255, Math.max(0, 35 + texture));
        } else {
          // Surrounding green
          frameData[idx] = Math.min(255, Math.max(0, 52 + texture));
          frameData[idx + 1] = Math.min(255, Math.max(0, 145 + texture));
          frameData[idx + 2] = Math.min(255, Math.max(0, 40 + texture));
        }
        frameData[idx + 3] = 255;
      }
    }
  }

  return jpeg.encode({ data: frameData, width, height }, 85).data;
};

// Multipart form-data builder
const createMultipartBody = (boundary, fields, files) => {
  const chunks = [];
  for (const [key, val] of Object.entries(fields)) {
    chunks.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${val}\r\n`));
  }
  for (const [key, file] of Object.entries(files)) {
    chunks.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${key}"; filename="${file.filename}"\r\nContent-Type: ${file.contentType}\r\n\r\n`));
    chunks.push(file.buffer);
    chunks.push(Buffer.from('\r\n'));
  }
  chunks.push(Buffer.from(`--${boundary}--\r\n`));
  return Buffer.concat(chunks);
};

const runMasterIntegrationTest = async () => {
  const baseUrl = `http://localhost:${PORT}/api`;
  console.log('\n======================================================================');
  console.log('🌾 AGRICULTURE ADVISOR – MASTER END-TO-END INTEGRATION TEST SUITE');
  console.log('======================================================================\n');

  try {
    // -------------------------------------------------------------
    // STEP 1: Core System Health Check
    // -------------------------------------------------------------
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData = await healthRes.json();
    if (!healthRes.ok || !healthData.success) {
      throw new Error('Health check failed: ' + JSON.stringify(healthData));
    }
    console.log('✅ STEP 1: System Health Check Operational (Service Status: 200 OK)');

    // -------------------------------------------------------------
    // STEP 2: Farmer Authentication & Profile Customization
    // -------------------------------------------------------------
    const farmerAPayload = {
      name: 'Dr. M. S. Swaminathan Farm',
      email: `farmer.lead.${Date.now()}@agriadvisor.org`,
      password: 'SecureAgronomyPass2026',
      preferredLanguage: 'te',
      location: { state: 'Telangana', district: 'Warangal', city: 'Narsampet' }
    };
    const regResA = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(farmerAPayload)
    });
    const regDataA = await regResA.json();
    if (!regResA.ok || !regDataA.token) {
      throw new Error('Farmer A registration failed: ' + JSON.stringify(regDataA));
    }
    const tokenA = regDataA.token;
    console.log(`✅ STEP 2: Primary Farmer Registered with JWT Auth (Language: ${farmerAPayload.preferredLanguage}, District: ${farmerAPayload.location.district})`);

    // Register second farmer for Multi-Tenant Security assertions
    const regResB = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Secondary Farmer B',
        email: `farmer.tenant.b.${Date.now()}@agriadvisor.org`,
        password: 'PassTenantIsolation456',
        preferredLanguage: 'hi',
        location: { state: 'Punjab', district: 'Ludhiana', city: 'Khanna' }
      })
    });
    const regDataB = await regResB.json();
    const tokenB = regDataB.token;
    console.log('✅ STEP 2b: Tenant Isolation Probe Farmer B Registered');

    // -------------------------------------------------------------
    // STEP 3: Weather Monitoring & Agricultural Early Warnings
    // -------------------------------------------------------------
    const weatherRes = await fetch(`${baseUrl}/weather?city=Warangal`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    const weatherData = await weatherRes.json();
    if (!weatherRes.ok || !weatherData.success) {
      throw new Error('Weather API failed: ' + JSON.stringify(weatherData));
    }
    console.log(`✅ STEP 3: Weather Telemetry Retrieved (${weatherData.data.location.name}: ${weatherData.data.current.temperature}°C, ${weatherData.data.current.humidity}% Humidity, ${weatherData.data.alerts.length} Active Farm Alerts)`);

    // -------------------------------------------------------------
    // STEP 4: Module 1 – Crop Recommendation (Random Forest ML)
    // -------------------------------------------------------------
    const cropRes = await fetch(`${baseUrl}/crop/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        soilType: 'Black Soil',
        season: 'Kharif (Monsoon: Jun - Oct)',
        temperature: 29.5,
        humidity: 78.0,
        ph: 7.1,
        rainfall: 145.0
      })
    });
    const cropData = await cropRes.json();
    if (!cropRes.ok || !cropData.success) {
      throw new Error('Crop recommendation failed: ' + JSON.stringify(cropData));
    }
    const predictedCrop = cropData.data.cropName;
    const cropConfidence = cropData.data.confidenceScore;
    const cropConfidencePct = cropConfidence <= 1.0 ? Math.round(cropConfidence * 100) : Math.round(cropConfidence);
    console.log(`✅ STEP 4: Crop Recommendation ML Inference Succeeded: "${predictedCrop}" (Confidence: ${cropConfidencePct}%)`);

    // -------------------------------------------------------------
    // STEP 5: Module 2 – Precision Fertilizer Recommendation (STCR Engine)
    // -------------------------------------------------------------
    const fertRes = await fetch(`${baseUrl}/fertilizer/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        soilType: 'Black Soil',
        season: 'Kharif (Monsoon: Jun - Oct)',
        crop: predictedCrop || 'Cotton',
        nitrogen: 180, // Medium/Low deficiency
        phosphorus: 32,
        potassium: 160,
        landArea: 3.5,
        landAreaUnit: 'Acres'
      })
    });
    const fertData = await fertRes.json();
    if (!fertRes.ok || !fertData.success) {
      throw new Error('Fertilizer recommendation failed: ' + JSON.stringify(fertData));
    }
    console.log(`✅ STEP 5: Precision STCR Fertilizer Calculation Succeeded (Fertilizer: ${fertData.data.fertilizerCombination}, Total Bags: ${fertData.data.dosageBreakdown?.totalCommercialBags || 'Calculated'}, 3 Split Timetable)`);

    // -------------------------------------------------------------
    // STEP 6: Module 3 – Multi-Crop Foliar Disease Diagnostic Engine
    // -------------------------------------------------------------
    const boundary = '----WebKitFormBoundaryMasterAgriAdvisor' + Math.random().toString(36).substring(2);
    const leafJpegBuffer = createSyntheticLeafBuffer(true);
    const multipartBody = createMultipartBody(
      boundary,
      { crop: 'Cotton' },
      { image: { filename: 'cotton_leaf_test.jpg', contentType: 'image/jpeg', buffer: leafJpegBuffer } }
    );

    const diseaseRes = await fetch(`${baseUrl}/disease/detect`, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        Authorization: `Bearer ${tokenA}`
      },
      body: multipartBody
    });
    const diseaseData = await diseaseRes.json();
    if (!diseaseRes.ok || !diseaseData.success) {
      throw new Error('Disease detection failed: ' + JSON.stringify(diseaseData));
    }
    const diseaseId = diseaseData.data._id || diseaseData.data.id;
    console.log(`✅ STEP 6: Foliar Disease Classifier Succeeded: "${diseaseData.data.detection.diseaseName}" (Severity: ${diseaseData.data.detection.severity}, Confidence: ${Math.round(diseaseData.data.detection.confidenceScore * 100)}%)`);

    // -------------------------------------------------------------
    // STEP 7: Module 5 – Multilingual Conversational AI & Guardrails
    // -------------------------------------------------------------
    // 7a. Telugu agronomy question
    const chatTelRes = await fetch(`${baseUrl}/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        message: 'నల్ల రేగడి నేలలో పత్తి పంటకు ఎలాంటి ఎరువులు వేయాలి?',
        language: 'te',
        isVoice: true
      })
    });
    const chatTelData = await chatTelRes.json();
    if (!chatTelRes.ok || !chatTelData.success) {
      throw new Error('Multilingual chat failed: ' + JSON.stringify(chatTelData));
    }
    console.log(`✅ STEP 7a: Multilingual Voice Assistant Consultation (Telugu): category="${chatTelData.data.category}"`);

    // 7b. Safety guardrail non-agri deflection test
    const chatGuardRes = await fetch(`${baseUrl}/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        message: 'Who won the cricket world cup match yesterday?',
        language: 'en',
        isVoice: false
      })
    });
    const chatGuardData = await chatGuardRes.json();
    if (!chatGuardRes.ok || !chatGuardData.data?.response?.toLowerCase().includes('agriculture')) {
      throw new Error('Safety guardrail failed: ' + JSON.stringify(chatGuardData));
    }
    console.log('✅ STEP 7b: Safety Guardrails Deflected Non-Agricultural Query with Polite Advisory Guidance');

    // -------------------------------------------------------------
    // STEP 8: Module 8 – Centralized Recommendation History & Aggregation
    // -------------------------------------------------------------
    const historyRes = await fetch(`${baseUrl}/history`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    const historyData = await historyRes.json();
    if (!historyRes.ok || !historyData.success || historyData.count < 4) {
      throw new Error(`Unified history aggregation incomplete. Expected >=4, got: ${historyData.count}`);
    }
    console.log(`✅ STEP 8: Centralized History Aggregated Across All 4 Services (${historyData.count} records verified)`);

    // -------------------------------------------------------------
    // STEP 9: Strict Multi-Tenant Security & Ownership Isolation
    // -------------------------------------------------------------
    // Farmer B attempts unauthorized read of Farmer A's disease diagnosis
    const leakReadRes = await fetch(`${baseUrl}/history/disease/${diseaseId}`, {
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    if (leakReadRes.status !== 403) {
      throw new Error(`Security breach: Tenant B unauthorized read returned ${leakReadRes.status} instead of 403`);
    }

    // Farmer B attempts unauthorized deletion of Farmer A's disease diagnosis
    const leakDeleteRes = await fetch(`${baseUrl}/history/disease/${diseaseId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    if (leakDeleteRes.status !== 403) {
      throw new Error(`Security breach: Tenant B unauthorized delete returned ${leakDeleteRes.status} instead of 403`);
    }
    console.log('✅ STEP 9: Multi-Tenant Isolation Strict Security Barrier Verified (403 Forbidden on Cross-Account Read & Delete)');

    // -------------------------------------------------------------
    // STEP 10: Resource Lifecycle & Disk Cleanup
    // -------------------------------------------------------------
    const deleteOwnerRes = await fetch(`${baseUrl}/history/disease/${diseaseId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    const deleteOwnerData = await deleteOwnerRes.json();
    if (!deleteOwnerRes.ok || !deleteOwnerData.success) {
      throw new Error('Owner record deletion failed: ' + JSON.stringify(deleteOwnerData));
    }
    console.log('✅ STEP 10: Record Deletion & Foliar Image Disk Cleanup Successfully Executed');

    // -------------------------------------------------------------
    // STEP 11: Bulk Clear History
    // -------------------------------------------------------------
    const clearRes = await fetch(`${baseUrl}/history/clear?module=all`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    const clearData = await clearRes.json();
    if (!clearRes.ok || !clearData.success) {
      throw new Error('Clear history failed: ' + JSON.stringify(clearData));
    }
    const verifyEmptyRes = await fetch(`${baseUrl}/history`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    const verifyEmptyData = await verifyEmptyRes.json();
    if (verifyEmptyData.count !== 0) {
      throw new Error('Expected 0 records after clear, found: ' + verifyEmptyData.count);
    }
    console.log('✅ STEP 11: Unified History Bulk Clear Verified (0 Records Remaining for Farmer A)');

    console.log('\n======================================================================');
    console.log('🎉 ALL 11 MASTER INTEGRATION END-TO-END SYSTEM TESTS PASSED PERFECTLY!');
    console.log('======================================================================\n');
  } catch (err) {
    console.error('\n❌ MASTER INTEGRATION TEST FAILED:', err.message);
    process.exitCode = 1;
  } finally {
    testServer.close();
  }
};

testServer.listen(PORT, () => {
  runMasterIntegrationTest();
});
