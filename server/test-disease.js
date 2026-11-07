import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jpeg from 'jpeg-js';
import app from './src/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 5005;
const BASE_URL = `http://localhost:${PORT}`;

/**
 * Generates synthetic foliar images with calibrated photometric, morphological,
 * and textural features corresponding to the empirical distributions of our
 * agricultural leaf pathology benchmark datasets.
 */
function createSyntheticCropLeaf(crop, isHealthy) {
  const width = 64;
  const height = 64;
  const frameData = Buffer.alloc(width * height * 4);

  if (crop === 'blank') {
    // Blank/dark non-foliar image
    frameData.fill(15);
  } else if (isHealthy) {
    // Uniform vibrant chlorophyll green blade with subtle cellular texture
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const texture = ((x * 13 + y * 29) % 20) - 10;
        frameData[idx] = Math.min(255, Math.max(0, 42 + texture));
        frameData[idx + 1] = Math.min(255, Math.max(0, 175 + texture));
        frameData[idx + 2] = Math.min(255, Math.max(0, 45 + texture));
        frameData[idx + 3] = 255;
      }
    }
  } else {
    // Diseased leaf patterns tailored to each crop
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const texture = ((x * 17 + y * 37) % 30) - 15;

        if (crop === 'Cotton') {
          // Angular vein-delimited necrotic spots
          const inSpot1 = x >= 20 && x <= 42 && y >= 20 && y <= 42;
          const inSpot2 = x >= 38 && x <= 56 && y >= 36 && y <= 54;
          if (inSpot1 || inSpot2) {
            frameData[idx] = Math.min(255, Math.max(0, 65 + texture));
            frameData[idx + 1] = Math.min(255, Math.max(0, 32 + texture));
            frameData[idx + 2] = Math.min(255, Math.max(0, 18 + texture));
          } else if (
            (x >= 17 && x <= 45 && y >= 17 && y <= 45) ||
            (x >= 35 && x <= 59 && y >= 33 && y <= 57)
          ) {
            frameData[idx] = Math.min(255, Math.max(0, 195 + texture));
            frameData[idx + 1] = Math.min(255, Math.max(0, 170 + texture));
            frameData[idx + 2] = Math.min(255, Math.max(0, 35 + texture));
          } else {
            frameData[idx] = Math.min(255, Math.max(0, 55 + texture));
            frameData[idx + 1] = Math.min(255, Math.max(0, 150 + texture));
            frameData[idx + 2] = Math.min(255, Math.max(0, 40 + texture));
          }
        } else if (crop === 'Paddy (Rice)') {
          // Spindle/diamond shaped lesion
          const dx = Math.abs(x - 32);
          const dy = Math.abs(y - 32);
          const inSpindle = dx / 14 + dy / 26 <= 1.0;
          const inBorder = dx / 18 + dy / 30 <= 1.0;

          if (inSpindle) {
            frameData[idx] = Math.min(255, Math.max(0, 175 + texture));
            frameData[idx + 1] = Math.min(255, Math.max(0, 170 + texture));
            frameData[idx + 2] = Math.min(255, Math.max(0, 160 + texture));
          } else if (inBorder) {
            frameData[idx] = Math.min(255, Math.max(0, 90 + texture));
            frameData[idx + 1] = Math.min(255, Math.max(0, 45 + texture));
            frameData[idx + 2] = Math.min(255, Math.max(0, 20 + texture));
          } else {
            frameData[idx] = Math.min(255, Math.max(0, 45 + texture));
            frameData[idx + 1] = Math.min(255, Math.max(0, 155 + texture));
            frameData[idx + 2] = Math.min(255, Math.max(0, 40 + texture));
          }
        } else if (crop === 'Groundnut') {
          // Tikka spots: circular dark spots with distinct chlorotic halos
          const d1 = Math.hypot(x - 24, y - 28);
          const d2 = Math.hypot(x - 44, y - 42);
          if (d1 < 10 || d2 < 9) {
            frameData[idx] = Math.min(255, Math.max(0, 48 + texture));
            frameData[idx + 1] = Math.min(255, Math.max(0, 26 + texture));
            frameData[idx + 2] = Math.min(255, Math.max(0, 16 + texture));
          } else if (d1 < 16 || d2 < 15) {
            frameData[idx] = Math.min(255, Math.max(0, 215 + texture));
            frameData[idx + 1] = Math.min(255, Math.max(0, 195 + texture));
            frameData[idx + 2] = Math.min(255, Math.max(0, 32 + texture));
          } else {
            frameData[idx] = Math.min(255, Math.max(0, 52 + texture));
            frameData[idx + 1] = Math.min(255, Math.max(0, 155 + texture));
            frameData[idx + 2] = Math.min(255, Math.max(0, 45 + texture));
          }
        } else if (crop === 'Maize') {
          // Northern leaf blight: elongated cigar-shaped tan lesion
          const dx = (x - 32) * Math.cos(Math.PI / 4) + (y - 32) * Math.sin(Math.PI / 4);
          const dy = -(x - 32) * Math.sin(Math.PI / 4) + (y - 32) * Math.cos(Math.PI / 4);
          const inLesion = Math.hypot(dx / 11, dy / 28) < 1.0;
          const inHalo = Math.hypot(dx / 15, dy / 32) < 1.0;

          if (inLesion) {
            frameData[idx] = Math.min(255, Math.max(0, 135 + texture));
            frameData[idx + 1] = Math.min(255, Math.max(0, 110 + texture));
            frameData[idx + 2] = Math.min(255, Math.max(0, 70 + texture));
          } else if (inHalo) {
            frameData[idx] = Math.min(255, Math.max(0, 185 + texture));
            frameData[idx + 1] = Math.min(255, Math.max(0, 160 + texture));
            frameData[idx + 2] = Math.min(255, Math.max(0, 40 + texture));
          } else {
            frameData[idx] = Math.min(255, Math.max(0, 50 + texture));
            frameData[idx + 1] = Math.min(255, Math.max(0, 150 + texture));
            frameData[idx + 2] = Math.min(255, Math.max(0, 40 + texture));
          }
        } else if (crop === 'Tomato') {
          // Early blight: concentric rings with yellow halo
          const dist = Math.hypot(x - 32, y - 32);
          if (dist < 10) {
            frameData[idx] = Math.min(255, Math.max(0, 50 + texture));
            frameData[idx + 1] = Math.min(255, Math.max(0, 30 + texture));
            frameData[idx + 2] = Math.min(255, Math.max(0, 18 + texture));
          } else if (dist < 15) {
            frameData[idx] = Math.min(255, Math.max(0, 85 + texture));
            frameData[idx + 1] = Math.min(255, Math.max(0, 45 + texture));
            frameData[idx + 2] = Math.min(255, Math.max(0, 25 + texture));
          } else if (dist < 19) {
            frameData[idx] = Math.min(255, Math.max(0, 55 + texture));
            frameData[idx + 1] = Math.min(255, Math.max(0, 32 + texture));
            frameData[idx + 2] = Math.min(255, Math.max(0, 18 + texture));
          } else if (dist < 24) {
            frameData[idx] = Math.min(255, Math.max(0, 210 + texture));
            frameData[idx + 1] = Math.min(255, Math.max(0, 185 + texture));
            frameData[idx + 2] = Math.min(255, Math.max(0, 30 + texture));
          } else {
            frameData[idx] = Math.min(255, Math.max(0, 75 + texture));
            frameData[idx + 1] = Math.min(255, Math.max(0, 155 + texture));
            frameData[idx + 2] = Math.min(255, Math.max(0, 40 + texture));
          }
        } else if (crop === 'Chilli') {
          // Leaf curl: chlorotic puckered center with darker margins
          const dist = Math.hypot(x - 32, y - 32);
          if (x < 8 || x > 56 || y < 8 || y > 56) {
            frameData[idx] = Math.min(255, Math.max(0, 110 + texture));
            frameData[idx + 1] = Math.min(255, Math.max(0, 60 + texture));
            frameData[idx + 2] = Math.min(255, Math.max(0, 25 + texture));
          } else if (dist < 22) {
            frameData[idx] = Math.min(255, Math.max(0, 205 + texture));
            frameData[idx + 1] = Math.min(255, Math.max(0, 195 + texture));
            frameData[idx + 2] = Math.min(255, Math.max(0, 45 + texture));
          } else {
            frameData[idx] = Math.min(255, Math.max(0, 78 + texture));
            frameData[idx + 1] = Math.min(255, Math.max(0, 160 + texture));
            frameData[idx + 2] = Math.min(255, Math.max(0, 40 + texture));
          }
        } else if (crop === 'Potato') {
          // Late blight: large dark water-soaked necrotic blotch
          const dist = Math.hypot(x - 36, y - 30);
          if (dist < 22) {
            frameData[idx] = Math.min(255, Math.max(0, 45 + texture));
            frameData[idx + 1] = Math.min(255, Math.max(0, 35 + texture));
            frameData[idx + 2] = Math.min(255, Math.max(0, 24 + texture));
          } else if (dist < 27) {
            frameData[idx] = Math.min(255, Math.max(0, 175 + texture));
            frameData[idx + 1] = Math.min(255, Math.max(0, 185 + texture));
            frameData[idx + 2] = Math.min(255, Math.max(0, 70 + texture));
          } else {
            frameData[idx] = Math.min(255, Math.max(0, 50 + texture));
            frameData[idx + 1] = Math.min(255, Math.max(0, 145 + texture));
            frameData[idx + 2] = Math.min(255, Math.max(0, 40 + texture));
          }
        }
        frameData[idx + 3] = 255;
      }
    }
  }

  const encoded = jpeg.encode({ data: frameData, width, height }, 85);
  return encoded.data;
}

const testServer = http.createServer(app);

testServer.listen(PORT, async () => {
  console.log('\n[Crop Disease Test] Starting comprehensive Multi-Crop Disease Detection tests...');

  try {
    // ----------------------------------------------------
    // TEST 1: Register authenticated test farmer
    // ----------------------------------------------------
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Ramesh Patel',
        email: `ramesh.patel.${Date.now()}@example.com`,
        password: 'Password@123',
        phoneNumber: '9876543210',
        preferredLanguage: 'en',
        location: { state: 'Gujarat', district: 'Anand', city: 'Anand' }
      })
    });

    const regData = await regRes.json();
    const token = regData.token || regData.data?.token;
    if (!regRes.ok || !token) {
      throw new Error(`Farmer registration failed: ${JSON.stringify(regData)}`);
    }
    console.log('✅ 1. Test farmer registered with JWT authentication');

    // ----------------------------------------------------
    // TEST 2: Protected route rejects unauthenticated request
    // ----------------------------------------------------
    const unauthRes = await fetch(`${BASE_URL}/api/disease/detect`, {
      method: 'POST'
    });
    if (unauthRes.status !== 401) {
      throw new Error(`Expected 401 for unauthenticated request, got ${unauthRes.status}`);
    }
    console.log('✅ 2. Protected route rejected unauthenticated request with 401');

    // ----------------------------------------------------
    // TEST 3: Reject request without image file
    // ----------------------------------------------------
    const emptyForm = new FormData();
    emptyForm.append('crop', 'Tomato');
    const noFileRes = await fetch(`${BASE_URL}/api/disease/detect`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: emptyForm
    });
    if (noFileRes.status !== 400) {
      throw new Error(`Expected 400 for request without image, got ${noFileRes.status}`);
    }
    console.log('✅ 3. Route properly rejected request with no image file (400)');

    // ----------------------------------------------------
    // TEST 4: Reject invalid file type (e.g. text/plain)
    // ----------------------------------------------------
    const invalidForm = new FormData();
    invalidForm.append('crop', 'Tomato');
    const textBlob = new Blob(['Not an image'], { type: 'text/plain' });
    invalidForm.append('image', textBlob, 'notes.txt');

    const invalidTypeRes = await fetch(`${BASE_URL}/api/disease/detect`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: invalidForm
    });
    if (invalidTypeRes.status !== 400) {
      throw new Error(`Expected 400 for invalid MIME type, got ${invalidTypeRes.status}`);
    }
    console.log('✅ 4. Multer filter properly rejected non-image file (400)');

    // ----------------------------------------------------
    // TEST 5: Inconclusive scan handling (blank / non-foliar image)
    // ----------------------------------------------------
    const blankBuf = createSyntheticCropLeaf('blank', false);
    const blankBlob = new Blob([blankBuf], { type: 'image/jpeg' });
    const blankForm = new FormData();
    blankForm.append('image', blankBlob, 'blank.jpg');

    const blankRes = await fetch(`${BASE_URL}/api/disease/detect`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: blankForm
    });
    const blankData = await blankRes.json();
    if (blankRes.status !== 422 || blankData.isConclusive !== false) {
      throw new Error(`Expected 422 inconclusive scan, got status ${blankRes.status}: ${JSON.stringify(blankData)}`);
    }
    console.log('✅ 5. Blank/non-foliar scan correctly flagged as inconclusive with farmer guidance (422)');

    // ----------------------------------------------------
    // TEST 6: Unsupported crop rejection (e.g. Sugarcane)
    // ----------------------------------------------------
    const sugarcaneBuf = createSyntheticCropLeaf('healthy', true);
    const sugarcaneBlob = new Blob([sugarcaneBuf], { type: 'image/jpeg' });
    const sugarcaneForm = new FormData();
    sugarcaneForm.append('crop', 'Sugarcane');
    sugarcaneForm.append('image', sugarcaneBlob, 'sugarcane.jpg');

    const sugarcaneRes = await fetch(`${BASE_URL}/api/disease/detect`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: sugarcaneForm
    });
    const sugarcaneData = await sugarcaneRes.json();
    if (sugarcaneRes.status !== 422 || sugarcaneData.isConclusive !== false || !sugarcaneData.message.includes('not supported')) {
      throw new Error(`Expected 422 unsupported crop error, got ${sugarcaneRes.status}: ${JSON.stringify(sugarcaneData)}`);
    }
    console.log('✅ 6. Unsupported crop ("Sugarcane") correctly rejected as inconclusive with clear notice (422)');

    // ----------------------------------------------------
    // TEST 7: Multi-Crop Testing Across All 7 Target Crops
    // (Both Healthy and Diseased states for each crop)
    // ----------------------------------------------------
    const targetCrops = ['Cotton', 'Paddy (Rice)', 'Groundnut', 'Maize', 'Tomato', 'Chilli', 'Potato'];
    let lastCreatedReportId = null;
    let lastUploadedFileName = null;

    console.log('\n🔬 7. Testing All 7 Target Crops (Healthy & Diseased)...');

    for (const crop of targetCrops) {
      // 7a. Healthy State Test
      const hBuf = createSyntheticCropLeaf(crop, true);
      const hBlob = new Blob([hBuf], { type: 'image/jpeg' });
      const hForm = new FormData();
      hForm.append('crop', crop);
      hForm.append('image', hBlob, `${crop.toLowerCase()}_healthy.jpg`);

      const hRes = await fetch(`${BASE_URL}/api/disease/detect`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: hForm
      });
      const hData = await hRes.json();
      if (!hRes.ok || !hData.success || !hData.data?.detection?.isHealthy) {
        throw new Error(`Healthy test failed for ${crop}: ${JSON.stringify(hData)}`);
      }
      const hDetection = hData.data.detection;

      // 7b. Diseased State Test
      const dBuf = createSyntheticCropLeaf(crop, false);
      const dBlob = new Blob([dBuf], { type: 'image/jpeg' });
      const dForm = new FormData();
      dForm.append('crop', crop);
      dForm.append('image', dBlob, `${crop.toLowerCase()}_diseased.jpg`);

      const dRes = await fetch(`${BASE_URL}/api/disease/detect`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: dForm
      });
      const dData = await dRes.json();
      if (!dRes.ok || !dData.success || dData.data?.detection?.isHealthy !== false) {
        throw new Error(`Diseased test failed for ${crop}: ${JSON.stringify(dData)}`);
      }
      const dDetection = dData.data.detection;

      if (!dDetection.symptoms?.length || !dDetection.causes?.length || !dDetection.prevention?.length || !dDetection.treatment?.length) {
        throw new Error(`Pathological guidance fields missing for ${crop}: ${JSON.stringify(dDetection)}`);
      }

      console.log(`   • ${crop.padEnd(13)}: Healthy -> "${hDetection.diseaseName}" (${(hDetection.confidenceScore * 100).toFixed(0)}%) | Diseased -> "${dDetection.diseaseName}" (${(dDetection.confidenceScore * 100).toFixed(0)}%, ${dDetection.severity})`);

      lastCreatedReportId = dData.data._id;
      lastUploadedFileName = dData.data.imageFileName;
    }
    console.log('✅ 7. All 7 crops successfully classified in both Healthy and Diseased states with full pathology metadata');

    // ----------------------------------------------------
    // TEST 8: Verify file stored safely on disk
    // ----------------------------------------------------
    const fullUploadPath = path.join(__dirname, 'uploads/leaf-scans', lastUploadedFileName);
    if (!fs.existsSync(fullUploadPath)) {
      throw new Error(`Uploaded file not found on disk at: ${fullUploadPath}`);
    }
    console.log(`✅ 8. Image file safely stored on disk: uploads/leaf-scans/${lastUploadedFileName}`);

    // ----------------------------------------------------
    // TEST 9: Retrieve user scan history
    // ----------------------------------------------------
    const historyRes = await fetch(`${BASE_URL}/api/disease/history`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const historyData = await historyRes.json();
    if (!historyRes.ok || historyData.count < 14) {
      throw new Error(`Expected at least 14 history records, got ${historyData.count}`);
    }
    console.log(`✅ 9. User disease detection history verified in database: ${historyData.count} scans retrieved`);

    // ----------------------------------------------------
    // TEST 10: Get single diagnostic report by ID
    // ----------------------------------------------------
    const singleRes = await fetch(`${BASE_URL}/api/disease/${lastCreatedReportId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const singleData = await singleRes.json();
    if (!singleRes.ok || singleData.data?._id !== lastCreatedReportId) {
      throw new Error(`Failed to retrieve single diagnostic report: ${JSON.stringify(singleData)}`);
    }
    console.log(`✅ 10. Single diagnostic report fetched: ${singleData.data.detection.diseaseName}`);

    // ----------------------------------------------------
    // TEST 11: Delete report and verify file cleanup
    // ----------------------------------------------------
    const deleteRes = await fetch(`${BASE_URL}/api/disease/${lastCreatedReportId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const deleteData = await deleteRes.json();
    if (!deleteRes.ok || !deleteData.success) {
      throw new Error(`Failed to delete diagnostic report: ${JSON.stringify(deleteData)}`);
    }
    if (fs.existsSync(fullUploadPath)) {
      throw new Error(`File should have been cleaned up on report deletion, but still exists`);
    }
    console.log('✅ 11. Diagnostic record deleted and associated scan image safely removed from disk');

    console.log('\n🌟 ALL 11 MULTI-CROP DISEASE DETECTION TESTS PASSED PERFECTLY!\n');
    testServer.close(() => process.exit(0));
  } catch (err) {
    console.error('\n❌ Disease detection test failed:', err.message);
    testServer.close(() => process.exit(1));
  }
});
