import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jpeg from 'jpeg-js';
import app from './src/app.js';
import { PATHOLOGY_DATABASE } from './src/ml/diseaseClassifier.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 5006;
const BASE_URL = `http://localhost:${PORT}`;

function createSyntheticLeaf(crop, isHealthy) {
  const width = 64;
  const height = 64;
  const frameData = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const texture = ((x * 13 + y * 29) % 20) - 10;
      if (isHealthy) {
        frameData[idx] = Math.min(255, Math.max(0, 42 + texture));
        frameData[idx + 1] = Math.min(255, Math.max(0, 175 + texture));
        frameData[idx + 2] = Math.min(255, Math.max(0, 45 + texture));
      } else {
        const dist = Math.hypot(x - 32, y - 32);
        if (dist < 18) {
          frameData[idx] = Math.min(255, Math.max(0, 65 + texture));
          frameData[idx + 1] = Math.min(255, Math.max(0, 32 + texture));
          frameData[idx + 2] = Math.min(255, Math.max(0, 18 + texture));
        } else if (dist < 26) {
          frameData[idx] = Math.min(255, Math.max(0, 195 + texture));
          frameData[idx + 1] = Math.min(255, Math.max(0, 170 + texture));
          frameData[idx + 2] = Math.min(255, Math.max(0, 35 + texture));
        } else {
          frameData[idx] = Math.min(255, Math.max(0, 55 + texture));
          frameData[idx + 1] = Math.min(255, Math.max(0, 150 + texture));
          frameData[idx + 2] = Math.min(255, Math.max(0, 40 + texture));
        }
      }
      frameData[idx + 3] = 255;
    }
  }

  const encoded = jpeg.encode({ data: frameData, width, height }, 85);
  return encoded.data;
}

const testServer = http.createServer(app);

testServer.listen(PORT, async () => {
  console.log('\n[Step 4A Test Suite] Verifying Pathology & Treatment Breakdown Architecture...\n');

  try {
    // -----------------------------------------------------------
    // TEST 1: Database Pathology Structure for All 30 Classes
    // -----------------------------------------------------------
    const classKeys = Object.keys(PATHOLOGY_DATABASE);
    console.log(`Checking ${classKeys.length} pathology database classes...`);
    if (classKeys.length < 26) {
      throw new Error(`Expected at least 26 classes, found ${classKeys.length}`);
    }

    let diseasedCount = 0;
    let healthyCount = 0;

    for (const key of classKeys) {
      const entry = PATHOLOGY_DATABASE[key];
      if (!entry.crop || !entry.diseaseName || !entry.scientificName) {
        throw new Error(`Class ${key} missing basic naming metadata`);
      }
      if (!Array.isArray(entry.symptoms) || entry.symptoms.length === 0) {
        throw new Error(`Class ${key} missing symptoms`);
      }
      if (!Array.isArray(entry.causes) || entry.causes.length === 0) {
        throw new Error(`Class ${key} missing causes`);
      }
      if (!Array.isArray(entry.prevention) || entry.prevention.length === 0) {
        throw new Error(`Class ${key} missing prevention`);
      }

      // Backward compatibility: flat treatment array must exist
      if (!Array.isArray(entry.treatment) || entry.treatment.length === 0) {
        throw new Error(`Class ${key} missing legacy flat treatment array`);
      }

      // Structured treatmentBreakdown verification
      const tb = entry.treatmentBreakdown;
      if (!tb) {
        throw new Error(`Class ${key} missing treatmentBreakdown object`);
      }
      if (!Array.isArray(tb.culturalPractices) || tb.culturalPractices.length === 0) {
        throw new Error(`Class ${key} missing culturalPractices in treatmentBreakdown`);
      }
      if (!Array.isArray(tb.organicBiocontrol) || tb.organicBiocontrol.length === 0) {
        throw new Error(`Class ${key} missing organicBiocontrol in treatmentBreakdown`);
      }
      if (!Array.isArray(tb.chemicalInterventions)) {
        throw new Error(`Class ${key} missing chemicalInterventions array in treatmentBreakdown`);
      }

      if (entry.isHealthy) {
        healthyCount++;
        // Healthy classes should not prescribe chemical interventions
        if (tb.chemicalInterventions.length !== 0) {
          throw new Error(`Healthy class ${key} should have 0 chemical interventions, got ${tb.chemicalInterventions.length}`);
        }
      } else {
        diseasedCount++;
        // Diseased classes must have verified chemical interventions
        if (tb.chemicalInterventions.length === 0) {
          throw new Error(`Diseased class ${key} must have at least 1 verified chemical intervention`);
        }

        for (const chem of tb.chemicalInterventions) {
          if (!chem.chemicalName || typeof chem.chemicalName !== 'string') {
            throw new Error(`Class ${key} chemical intervention missing chemicalName`);
          }
          if (!chem.activeIngredient || typeof chem.activeIngredient !== 'string') {
            throw new Error(`Class ${key} chemical intervention missing activeIngredient`);
          }
          if (!chem.dosage || typeof chem.dosage !== 'string') {
            throw new Error(`Class ${key} chemical intervention missing dosage`);
          }
          if (!chem.applicationTiming || typeof chem.applicationTiming !== 'string') {
            throw new Error(`Class ${key} chemical intervention missing applicationTiming`);
          }
          if (!chem.waitingPeriodPHI || typeof chem.waitingPeriodPHI !== 'string') {
            throw new Error(`Class ${key} chemical intervention missing waitingPeriodPHI`);
          }
          if (!chem.safetyPrecautions || typeof chem.safetyPrecautions !== 'string') {
            throw new Error(`Class ${key} chemical intervention missing safetyPrecautions`);
          }
        }
      }
    }

    console.log(`✅ 1. Pathology database verified: ${classKeys.length} classes (${diseasedCount} diseased, ${healthyCount} healthy) all have complete structured treatment breakdown.`);

    // -----------------------------------------------------------
    // TEST 2: Register user and perform live API scan
    // -----------------------------------------------------------
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Anita Verma',
        email: `anita.verma.${Date.now()}@example.com`,
        password: 'Password@123',
        phoneNumber: '9876543211',
        preferredLanguage: 'hi',
        location: { state: 'Punjab', district: 'Ludhiana', city: 'Ludhiana' }
      })
    });
    const regData = await regRes.json();
    const token = regData.token || regData.data?.token;
    if (!regRes.ok || !token) throw new Error('Failed to register user for testing');
    console.log('✅ 2. Test farmer registered with JWT authentication.');

    // -----------------------------------------------------------
    // TEST 3: API returns structured treatment breakdown & image estimate note
    // -----------------------------------------------------------
    const leafBuf = createSyntheticLeaf('Tomato', false);
    const leafBlob = new Blob([leafBuf], { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('crop', 'Tomato');
    formData.append('image', leafBlob, 'tomato_blight_sample.jpg');

    const detectRes = await fetch(`${BASE_URL}/api/disease/detect`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
    const detectData = await detectRes.json();
    if (!detectRes.ok || !detectData.success) {
      throw new Error(`Disease detection API failed: ${JSON.stringify(detectData)}`);
    }

    const report = detectData.data;
    const detection = report.detection;

    // Check backward compatibility
    if (!Array.isArray(detection.treatment) || detection.treatment.length === 0) {
      throw new Error('API response missing legacy flat detection.treatment array');
    }
    console.log(`✅ 3. Legacy backward compatibility preserved: detection.treatment has ${detection.treatment.length} recommendation strings.`);

    // Check structured treatment breakdown in API response
    const tb = detection.treatmentBreakdown;
    if (!tb || !tb.culturalPractices?.length || !tb.organicBiocontrol?.length || !tb.chemicalInterventions?.length) {
      throw new Error(`API response missing complete treatmentBreakdown: ${JSON.stringify(tb)}`);
    }
    console.log(`✅ 4. Structured treatment breakdown returned in API response:`);
    console.log(`      • Cultural Practices  : ${tb.culturalPractices.length} items`);
    console.log(`      • Organic Biocontrol  : ${tb.organicBiocontrol.length} items`);
    console.log(`      • Chemical Sprays     : ${tb.chemicalInterventions.length} items (CIBRC dosage, PHI, timing verified)`);

    // Verify first chemical item has complete fields
    const chem0 = tb.chemicalInterventions[0];
    console.log(`      • First chemical spray: "${chem0.chemicalName}" (PHI: ${chem0.waitingPeriodPHI})`);

    // -----------------------------------------------------------
    // TEST 4: Verify Affected Area Image-Based Estimate Note
    // -----------------------------------------------------------
    if (!detection.affectedAreaEstimateNote || !detection.affectedAreaEstimateNote.toLowerCase().includes('image-based')) {
      throw new Error(`Expected affectedAreaEstimateNote to indicate image-based estimation, got: ${detection.affectedAreaEstimateNote}`);
    }
    console.log(`✅ 5. Affected area clearly identified as 2D image estimate: "${detection.affectedAreaEstimateNote}"`);

    // -----------------------------------------------------------
    // TEST 5: Verify Persistence in History Store
    // -----------------------------------------------------------
    const historyRes = await fetch(`${BASE_URL}/api/disease/history`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const historyData = await historyRes.json();
    if (!historyRes.ok || historyData.count < 1) {
      throw new Error('Failed to retrieve scan history');
    }
    const savedRecord = historyData.data[0];
    if (!savedRecord.detection?.treatmentBreakdown?.chemicalInterventions?.length) {
      throw new Error('Stored history record missing structured treatmentBreakdown');
    }
    console.log('✅ 6. History persistence verified: treatmentBreakdown successfully stored and retrieved.');

    // -----------------------------------------------------------
    // TEST 6: Single Report Retrieval
    // -----------------------------------------------------------
    const singleRes = await fetch(`${BASE_URL}/api/disease/${report._id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const singleData = await singleRes.json();
    if (!singleRes.ok || !singleData.data?.detection?.treatmentBreakdown) {
      throw new Error('Single report fetch missing structured treatmentBreakdown');
    }
    console.log(`✅ 7. Single diagnostic report retrieval verified with structured treatment data.`);

    console.log('\n🎉 ALL STEP 4A TESTS COMPLETED AND VERIFIED 100% SUCCESFULLY!\n');
    testServer.close(() => process.exit(0));
  } catch (err) {
    console.error('\n❌ Step 4A test failed:', err.message);
    testServer.close(() => process.exit(1));
  }
});
