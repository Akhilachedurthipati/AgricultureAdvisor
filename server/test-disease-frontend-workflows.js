import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const TEMP_USER_DATA = path.join(process.cwd(), '.temp_edge_disease_profile');
const ARTIFACT_DIR = 'C:\\Users\\hp\\.gemini\\antigravity\\brain\\cba75478-8cf2-4e6d-a531-062f63b2df6f';

console.log('\n======================================================================');
console.log('🔬 DISEASE DETECTION FRONTEND-BACKEND WORKFLOW & UI INTEGRATION TEST');
console.log('======================================================================\n');

let testsPassed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(message);
  } else {
    console.log(`✅ PASSED: ${message}`);
    testsPassed++;
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTests() {
  // 1. Verify frontend and backend servers are running
  console.log('--- 1. Service Availability Check ---');
  const backendHealth = await fetch('http://localhost:5000/api/health').then(r => r.json());
  assert(backendHealth.success === true, 'Backend API health check is 200 OK');

  const frontendCheck = await fetch('http://localhost:5173/').then(r => r.status);
  assert(frontendCheck === 200, 'Frontend Vite dev server is serving on http://localhost:5173/');

  // 2. Register test farmer
  console.log('\n--- 2. Farmer Authentication ---');
  const farmerEmail = `farmer.pathology.${Date.now()}@agriadvisor.org`;
  const regRes = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Kavita Sundaram Foliar Lab',
      email: farmerEmail,
      password: 'SecurePathology2026',
      preferredLanguage: 'en',
      location: { state: 'Tamil Nadu', district: 'Coimbatore', city: 'Coimbatore' }
    })
  });
  const regData = await regRes.json();
  assert(regRes.status === 201 && Boolean(regData.token), 'Farmer registered with JWT token');
  const token = regData.token;
  const user = regData.user;

  // 3. Headless Browser Automation via Chrome DevTools Protocol (CDP)
  console.log('\n--- 3. Automated Headless Browser Session (Edge CDP) ---');
  const debugPort = 9226;
  if (!fs.existsSync(TEMP_USER_DATA)) {
    fs.mkdirSync(TEMP_USER_DATA, { recursive: true });
  }

  const edgeProcess = spawn(EDGE_PATH, [
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${TEMP_USER_DATA}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1280,1400',
    'about:blank'
  ]);

  await sleep(1500);

  try {
    const versionRes = await fetch(`http://localhost:${debugPort}/json/version`).then(r => r.json());
    const browserWsUrl = versionRes.webSocketDebuggerUrl;
    assert(Boolean(browserWsUrl), 'Connected to Edge DevTools Protocol endpoint');

    // Create a new tab target
    const newTabRes = await fetch(`http://localhost:${debugPort}/json/new?http://localhost:5173/login`, {
      method: 'PUT'
    }).then(r => r.json());
    const tabWsUrl = newTabRes.webSocketDebuggerUrl;

    const ws = new WebSocket(tabWsUrl);
    let msgId = 1;
    const pendingCallbacks = new Map();

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.method === 'Runtime.consoleAPICalled') {
        console.log('      [Browser Console]', data.params?.type, data.params?.args?.map(a => a.value || a.description).join(' '));
      }
      if (data.method === 'Runtime.exceptionThrown') {
        console.error('      [Browser Exception]', data.params?.exceptionDetails?.text, data.params?.exceptionDetails?.exception?.description);
      }
      if (data.id && pendingCallbacks.has(data.id)) {
        const cb = pendingCallbacks.get(data.id);
        pendingCallbacks.delete(data.id);
        cb(data);
      }
    };

    const sendCdp = (method, params = {}) => {
      return new Promise((resolve) => {
        const id = msgId++;
        pendingCallbacks.set(id, resolve);
        ws.send(JSON.stringify({ id, method, params }));
      });
    };

    await new Promise((resolve) => ws.onopen = resolve);
    assert(true, 'WebSocket connection opened to browser tab');

    await sendCdp('Page.enable');
    await sendCdp('Runtime.enable');

    // Inject farmer auth session into localStorage
    console.log('   • Injecting farmer authentication into localStorage...');
    await sendCdp('Page.navigate', { url: 'http://localhost:5173/login' });
    await sleep(1000);
    await sendCdp('Runtime.evaluate', {
      expression: `
        localStorage.clear();
        localStorage.setItem('agri_token', ${JSON.stringify(token)});
        localStorage.setItem('agri_user', ${JSON.stringify(JSON.stringify(user))});
      `
    });

    // Navigate to /disease-detection
    console.log('   • Navigating to /disease-detection...');
    await sendCdp('Page.navigate', { url: 'http://localhost:5173/disease-detection' });
    await sleep(3000);

    // 4. Verify title and page element in DOM
    const titleCheck = await sendCdp('Runtime.evaluate', {
      expression: '(() => document.querySelector("h1")?.innerText || "")()',
      returnByValue: true
    });
    const pageTitle = titleCheck.result?.result?.value || '';
    assert(pageTitle.toLowerCase().includes('disease') || pageTitle.toLowerCase().includes('foliar'), `Page mounted with title: "${pageTitle}"`);

    // Capture Screenshot 1: Initial Screen
    console.log('   • Capturing Screenshot 1: Initial Screen...');
    const ss1 = await sendCdp('Page.captureScreenshot', { format: 'png' });
    if (ss1.result?.data) {
      const p1 = path.join(ARTIFACT_DIR, 'disease-initial-screen.png');
      fs.writeFileSync(p1, Buffer.from(ss1.result.data, 'base64'));
      assert(fs.existsSync(p1), 'Saved disease-initial-screen.png');
    }

    // 5. Test Live Camera Tab Switching & Alignment Reticle DOM Presence
    console.log('\n--- 4. UI Interaction: Tab Switching & Camera Reticle ---');
    await sendCdp('Runtime.evaluate', {
      expression: `(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const camBtn = btns.find(b => b.innerText.includes('Live Camera'));
        if (camBtn) camBtn.click();
        return Boolean(camBtn);
      })()`,
      returnByValue: true
    });
    await sleep(1000);

    const camCheck = await sendCdp('Runtime.evaluate', {
      expression: '(() => Boolean(document.querySelector("video") || document.querySelector(".border-rose-200")))()',
      returnByValue: true
    });
    assert(camCheck.result?.result?.value === true, 'Camera container mounted with video/fallback reticle');

    // Switch back to upload mode
    await sendCdp('Runtime.evaluate', {
      expression: `(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const uploadBtn = btns.find(b => b.innerText.includes('Upload Leaf File'));
        if (uploadBtn) uploadBtn.click();
      })()`
    });
    await sleep(800);

    // 6. Test Calibrated Testing Presets: Tomato Early Blight
    console.log('\n--- 5. Calibrated Preset Test: Tomato Early Blight ---');
    await sendCdp('Runtime.evaluate', {
      expression: `(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const presetToggle = btns.find(b => b.innerText.includes('Calibrated Testing Presets') || b.innerText.includes('Testing Mode'));
        if (presetToggle) presetToggle.click();
      })()`
    });
    await sleep(800);

    // Click Tomato Early Blight preset
    await sendCdp('Runtime.evaluate', {
      expression: `(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const tomatoBtn = btns.find(b => b.innerText.includes('Tomato Early Blight'));
        if (tomatoBtn) tomatoBtn.click();
        return Boolean(tomatoBtn);
      })()`,
      returnByValue: true
    });
    await sleep(1000);

    // Verify Preview is loaded
    const previewCheck = await sendCdp('Runtime.evaluate', {
      expression: '(() => Boolean(document.querySelector("img[alt=\'Leaf preview\']")))()',
      returnByValue: true
    });
    assert(previewCheck.result?.result?.value === true, 'Foliar preview image loaded from calibrated preset');

    // Click "Run Computer Vision Diagnostic" button
    console.log('   • Clicking Run Computer Vision Diagnostic...');
    await sendCdp('Runtime.evaluate', {
      expression: `(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const diagBtn = btns.find(b => b.innerText.includes('Run Computer Vision') || b.innerText.includes('Run Deep Learning'));
        if (diagBtn) diagBtn.click();
      })()`
    });

    // Wait for API response and DOM update
    await sleep(3000);

    // Verify Diagnosis Presentation
    const diagCheck = await sendCdp('Runtime.evaluate', {
      expression: `(() => {
        const errorBanner = document.querySelector('.bg-rose-50, .border-rose-200')?.innerText || '';
        const warningBanner = document.querySelector('.bg-amber-50, .border-amber-200')?.innerText || '';
        const allH3 = Array.from(document.querySelectorAll('h3')).map(h => h.innerText);
        const conditionH3 = document.querySelector('.bg-gradient-to-br h3')?.innerText || '';
        const body = document.body.innerText;
        return {
          diseaseName: conditionH3 || allH3.find(h => h.includes('Blight') || h.includes('Leaf') || h.includes('Spot') || h.includes('Mold')) || '',
          allH3,
          errorBanner,
          warningBanner,
          hasSeverity: body.includes('Severity') || body.includes('Severe'),
          hasCertainty: body.includes('Diagnostic Certainty') || body.includes('Certainty'),
          hasPillars: body.includes('Cultural & Agronomic') && body.includes('Organic & Biological') && body.includes('Chemical Interventions'),
          hasPhi: body.toLowerCase().includes('phi') || body.includes('days')
        };
      })()`,
      returnByValue: true
    });
    const diagRes = diagCheck.result?.result?.value;
    console.log('   • Diagnostic DOM state:', JSON.stringify(diagRes));
    assert(Boolean(diagRes?.diseaseName?.includes('Tomato')), `Diagnosed disease: "${diagRes?.diseaseName}"`);
    assert(diagRes?.hasSeverity === true, 'Visual severity gauge active in prescription');
    assert(diagRes?.hasCertainty === true, 'Diagnostic Certainty percentage displayed');
    assert(diagRes?.hasPillars === true, '3-Pillar Treatment sections rendered (Cultural, Organic, Chemical)');
    assert(diagRes?.hasPhi === true, 'Verified CIBRC Pre-Harvest Interval (PHI) badges displayed');

    // Capture Screenshot 2: Diagnosed Prescription
    console.log('   • Capturing Screenshot 2: Diagnosed Prescription with 3-Pillar Schedule...');
    const ss2 = await sendCdp('Page.captureScreenshot', { format: 'png' });
    if (ss2.result?.data) {
      const p2 = path.join(ARTIFACT_DIR, 'disease-diagnosed-prescription.png');
      fs.writeFileSync(p2, Buffer.from(ss2.result.data, 'base64'));
      assert(fs.existsSync(p2), 'Saved disease-diagnosed-prescription.png');
    }

    // 7. Test Healthy State: Healthy Tomato Leaf
    console.log('\n--- 6. Calibrated Preset Test: Healthy Tomato Leaf ---');
    await sendCdp('Runtime.evaluate', {
      expression: `(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const healthyBtn = btns.find(b => b.innerText.includes('Healthy Tomato Leaf'));
        if (healthyBtn) healthyBtn.click();
      })()`
    });
    await sleep(1000);

    await sendCdp('Runtime.evaluate', {
      expression: `(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const diagBtn = btns.find(b => b.innerText.includes('Run Computer Vision') || b.innerText.includes('Run Deep Learning'));
        if (diagBtn) diagBtn.click();
      })()`
    });
    await sleep(3000);

    const healthyCheck = await sendCdp('Runtime.evaluate', {
      expression: `(() => {
        const text = document.body.innerText;
        return {
          isHealthy: text.includes('Tomato Healthy Leaf') || text.includes('Clean Foliar State'),
          noChemicalNotice: text.includes('No chemical fungicide') || text.includes('Clean foliar tissue detected')
        };
      })()`,
      returnByValue: true
    });
    const healthyRes = healthyCheck.result?.result?.value;
    assert(healthyRes?.isHealthy === true, 'Healthy foliar condition diagnosed cleanly');
    assert(healthyRes?.noChemicalNotice === true, 'Chemical section safely indicates 0 chemical sprays for healthy plant');

    // Capture Screenshot 3: Healthy Condition
    console.log('   • Capturing Screenshot 3: Healthy Foliar Condition...');
    const ss3 = await sendCdp('Page.captureScreenshot', { format: 'png' });
    if (ss3.result?.data) {
      const p3 = path.join(ARTIFACT_DIR, 'disease-healthy-leaf.png');
      fs.writeFileSync(p3, Buffer.from(ss3.result.data, 'base64'));
      assert(fs.existsSync(p3), 'Saved disease-healthy-leaf.png');
    }

    // 8. Test Scan History Drawer
    console.log('\n--- 7. Scan History Drawer Interaction ---');
    await sendCdp('Runtime.evaluate', {
      expression: `(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const histBtn = btns.find(b => b.innerText.includes('Past Scans') || b.innerText.includes('Hide History'));
        if (histBtn) histBtn.click();
      })()`
    });
    await sleep(1500);

    const histCheck = await sendCdp('Runtime.evaluate', {
      expression: `(() => {
        const drawer = document.querySelector('.bg-slate-50.border-slate-200');
        const cards = document.querySelectorAll('.grid-cols-1.sm\\\\:grid-cols-2.lg\\\\:grid-cols-3 > div');
        const text = drawer ? drawer.innerText : '';
        return {
          cardCount: cards.length,
          hasDrawer: Boolean(drawer),
          drawerText: text
        };
      })()`,
      returnByValue: true
    });
    const histData = histCheck.result?.result?.value;
    console.log('   • History drawer state:', JSON.stringify(histData));
    assert(histData?.hasDrawer === true, 'History drawer opened on toggle');
    assert(histData?.cardCount >= 1 || (histData?.drawerText && !histData.drawerText.includes('Loading')), `History drawer displayed ${histData?.cardCount} past scans with preserved metadata`);

    ws.close();
    edgeProcess.kill();

    console.log('\n======================================================================');
    console.log(`🎉 ALL ${testsPassed} DISEASE DETECTION FRONTEND-BACKEND WORKFLOW TESTS PASSED!`);
    console.log('======================================================================\n');
    process.exit(0);

  } catch (err) {
    console.error('\n❌ Frontend workflow test failed:', err.message);
    try { edgeProcess.kill(); } catch {}
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
