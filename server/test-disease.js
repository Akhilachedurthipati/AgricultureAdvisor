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

// Helper to generate a synthetic JPEG image buffer
function createSyntheticLeafImage(type = 'healthy') {
  const width = 64;
  const height = 64;
  const frameData = Buffer.alloc(width * height * 4);

  if (type === 'healthy') {
    // Uniform vibrant chlorophyll green
    for (let i = 0; i < frameData.length; i += 4) {
      frameData[i] = 40;     // R
      frameData[i + 1] = 175; // G
      frameData[i + 2] = 45;  // B
      frameData[i + 3] = 255; // A
    }
  } else if (type === 'early_blight') {
    // Green leaf with dark brown concentric bullseye and yellow halo
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const dist = Math.hypot(x - 32, y - 32);
        if (dist < 18) {
          // Necrotic target center
          frameData[idx] = 60;
          frameData[idx + 1] = 35;
          frameData[idx + 2] = 20;
          frameData[idx + 3] = 255;
        } else if (dist < 22) {
          // Chlorotic yellow halo
          frameData[idx] = 215;
          frameData[idx + 1] = 190;
          frameData[idx + 2] = 30;
          frameData[idx + 3] = 255;
        } else {
          // Green blade
          frameData[idx] = 40;
          frameData[idx + 1] = 160;
          frameData[idx + 2] = 40;
          frameData[idx + 3] = 255;
        }
      }
    }
  } else if (type === 'blank') {
    // Near black blank image
    frameData.fill(15);
  }

  const encoded = jpeg.encode({ data: frameData, width, height }, 85);
  return encoded.data;
}

const testServer = http.createServer(app);

testServer.listen(PORT, async () => {
  console.log('\n[Crop Disease Test] Starting comprehensive Crop Disease Detection tests...');

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
    const blankBuf = createSyntheticLeafImage('blank');
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
    // TEST 6: Real Leaf Detection - Healthy Tomato Leaf
    // ----------------------------------------------------
    const healthyBuf = createSyntheticLeafImage('healthy');
    const healthyBlob = new Blob([healthyBuf], { type: 'image/jpeg' });
    const healthyForm = new FormData();
    healthyForm.append('crop', 'Tomato');
    healthyForm.append('image', healthyBlob, 'tomato_healthy.jpg');

    const healthyRes = await fetch(`${BASE_URL}/api/disease/detect`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: healthyForm
    });
    const healthyData = await healthyRes.json();

    if (!healthyRes.ok || !healthyData.success) {
      throw new Error(`Healthy leaf detection failed: ${JSON.stringify(healthyData)}`);
    }
    const healthyDetection = healthyData.data.detection;
    if (!healthyDetection.isHealthy || healthyDetection.diseaseName !== 'Tomato Healthy Leaf') {
      throw new Error(`Expected Healthy Tomato Leaf, got: ${JSON.stringify(healthyDetection)}`);
    }
    console.log(`✅ 6. Healthy Leaf Detection: ${healthyDetection.diseaseName} (Confidence: ${(healthyDetection.confidenceScore * 100).toFixed(0)}%, isHealthy: ${healthyDetection.isHealthy})`);

    // ----------------------------------------------------
    // TEST 7: Real Leaf Detection - Diseased (Early Blight)
    // ----------------------------------------------------
    const diseasedBuf = createSyntheticLeafImage('early_blight');
    const diseasedBlob = new Blob([diseasedBuf], { type: 'image/jpeg' });
    const diseasedForm = new FormData();
    diseasedForm.append('crop', 'Tomato');
    diseasedForm.append('image', diseasedBlob, 'tomato_blight.jpg');

    const diseasedRes = await fetch(`${BASE_URL}/api/disease/detect`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: diseasedForm
    });
    const diseasedData = await diseasedRes.json();

    if (!diseasedRes.ok || !diseasedData.success) {
      throw new Error(`Diseased leaf detection failed: ${JSON.stringify(diseasedData)}`);
    }
    const diseasedDetection = diseasedData.data.detection;
    if (diseasedDetection.isHealthy !== false || !diseasedDetection.diseaseName.includes('Blight')) {
      throw new Error(`Expected Blight detection, got: ${JSON.stringify(diseasedDetection)}`);
    }
    if (!diseasedDetection.symptoms?.length || !diseasedDetection.causes?.length || !diseasedDetection.prevention?.length || !diseasedDetection.treatment?.length) {
      throw new Error(`Incomplete pathological details: ${JSON.stringify(diseasedDetection)}`);
    }
    console.log(`✅ 7. Diseased Leaf Detection: ${diseasedDetection.diseaseName} (Severity: ${diseasedDetection.severity}, Affected: ${diseasedDetection.affectedAreaPercentage}%, Confidence: ${(diseasedDetection.confidenceScore * 100).toFixed(0)}%)`);
    console.log(`   • Symptoms: ${diseasedDetection.symptoms.length} items`);
    console.log(`   • Causes: ${diseasedDetection.causes.length} items`);
    console.log(`   • Prevention: ${diseasedDetection.prevention.length} items`);
    console.log(`   • Treatment: ${diseasedDetection.treatment.length} items`);

    const createdReportId = diseasedData.data._id;
    const uploadedFileName = diseasedData.data.imageFileName;

    // ----------------------------------------------------
    // TEST 8: Verify file stored safely on disk
    // ----------------------------------------------------
    const fullUploadPath = path.join(__dirname, 'uploads/leaf-scans', uploadedFileName);
    if (!fs.existsSync(fullUploadPath)) {
      throw new Error(`Uploaded file not found on disk at: ${fullUploadPath}`);
    }
    console.log(`✅ 8. Image file safely stored on disk: uploads/leaf-scans/${uploadedFileName}`);

    // ----------------------------------------------------
    // TEST 9: Retrieve user scan history
    // ----------------------------------------------------
    const historyRes = await fetch(`${BASE_URL}/api/disease/history`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const historyData = await historyRes.json();
    if (!historyRes.ok || historyData.count < 2) {
      throw new Error(`Expected at least 2 history records, got ${historyData.count}`);
    }
    console.log(`✅ 9. User disease detection history verified in database: ${historyData.count} scans retrieved`);

    // ----------------------------------------------------
    // TEST 10: Get single diagnostic report by ID
    // ----------------------------------------------------
    const singleRes = await fetch(`${BASE_URL}/api/disease/${createdReportId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const singleData = await singleRes.json();
    if (!singleRes.ok || singleData.data?._id !== createdReportId) {
      throw new Error(`Failed to retrieve single diagnostic report: ${JSON.stringify(singleData)}`);
    }
    console.log(`✅ 10. Single diagnostic report fetched: ${singleData.data.detection.diseaseName}`);

    // ----------------------------------------------------
    // TEST 11: Delete report and verify file cleanup
    // ----------------------------------------------------
    const deleteRes = await fetch(`${BASE_URL}/api/disease/${createdReportId}`, {
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

    console.log('\n🌟 ALL 11 CROP DISEASE DETECTION TESTS PASSED PERFECTLY!\n');
    testServer.close(() => process.exit(0));
  } catch (err) {
    console.error('\n❌ Disease detection test failed:', err.message);
    testServer.close(() => process.exit(1));
  }
});
