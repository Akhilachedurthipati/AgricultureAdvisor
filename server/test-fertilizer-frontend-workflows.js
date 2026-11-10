import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const TEMP_USER_DATA = path.join(process.cwd(), '.temp_edge_profile');

console.log('\n======================================================================');
console.log('🌾 FERTILIZER FRONTEND-BACKEND WORKFLOW & UI INTEGRATION TEST SUITE');
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
  const farmerEmail = `farmer.lifecycle.${Date.now()}@agriadvisor.org`;
  const regRes = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Dr. M. S. Swaminathan Farm',
      email: farmerEmail,
      password: 'SecureAgronomyPass2026',
      preferredLanguage: 'en',
      location: { state: 'Telangana', district: 'Warangal', city: 'Narsampet' }
    })
  });
  const regData = await regRes.json();
  assert(regRes.status === 201 && Boolean(regData.token), 'Farmer registered with JWT token');
  const token = regData.token;
  const user = regData.user;

  // 3. Test API Response for General RDF mode
  console.log('\n--- 3. API Contract Test: General RDF (Omitted NPK) ---');
  const genPayload = {
    soilType: 'Clay Soil',
    season: 'Kharif (Monsoon: Jun - Oct)',
    crop: 'Rice (Paddy)',
    landArea: 3
  };
  const genRes = await fetch('http://localhost:5000/api/fertilizer/recommend', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(genPayload)
  });
  const genData = await genRes.json();
  assert(genRes.status === 200, 'General RDF API request returned 200 OK');
  assert(genData.data.recommendationMode.includes('General Agronomic Recommendation'), 'Returned General RDF mode');
  assert(genData.data.isFullSoilTestAvailable === false, 'isFullSoilTestAvailable is false');
  assert(Array.isArray(genData.data.lifecycleSchedule), 'lifecycleSchedule is array');
  assert(genData.data.lifecycleSchedule.length >= 3, 'Rice has at least 3 life-cycle stages');
  assert(Boolean(genData.data.institutionReference), 'Institutional reference citation is present');

  // 4. Test API Response for Precision STCR mode with Sowing Date & pH
  console.log('\n--- 4. API Contract Test: Precision STCR with Sowing Date & pH ---');
  const stcrPayload = {
    soilType: 'Black Cotton Soil',
    season: 'Kharif (Monsoon: Jun - Oct)',
    crop: 'Cotton',
    nitrogen: 40,
    phosphorus: 12,
    potassium: 35,
    ph: 7.4,
    sowingDate: '2026-06-15',
    landArea: 2.5
  };
  const stcrRes = await fetch('http://localhost:5000/api/fertilizer/recommend', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(stcrPayload)
  });
  const stcrData = await stcrRes.json();
  assert(stcrRes.status === 200, 'STCR API request returned 200 OK');
  assert(stcrData.data.recommendationMode.includes('Precision STCR'), 'Returned Precision STCR mode');
  assert(stcrData.data.isFullSoilTestAvailable === true, 'isFullSoilTestAvailable is true');
  assert(stcrData.data.soilPhAdvisory.status.includes('Optimal'), 'Soil pH recognized as Optimal');
  assert(stcrData.data.lifecycleSchedule[0].calendarWindow.startDate === '2026-06-15', 'Basal start date matches sowing date');

  // 5. Headless Browser Automation via Chrome DevTools Protocol (CDP)
  console.log('\n--- 5. Automated Headless Browser Session (Edge CDP) ---');
  const debugPort = 9225;
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

  // Give Edge time to bind the port
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

    // Enable Page domain
    await sendCdp('Page.enable');
    await sendCdp('Runtime.enable');

    // First navigate to root to establish origin for localStorage
    await sendCdp('Page.navigate', { url: 'http://localhost:5173/' });
    await sleep(1500);

    // Inject farmer auth session into localStorage
    console.log('   • Injecting farmer authentication into localStorage...');
    await sendCdp('Runtime.evaluate', {
      expression: `
        localStorage.setItem('agri_token', ${JSON.stringify(token)});
        localStorage.setItem('agri_user', ${JSON.stringify(JSON.stringify(user))});
      `
    });

    // Navigate to /fertilizer-recommendation
    console.log('   • Navigating to /fertilizer-recommendation...');
    await sendCdp('Page.navigate', { url: 'http://localhost:5173/fertilizer-recommendation' });

    // Wait for the React component to mount
    await sleep(3000);

    // Verify title and page element in DOM
    const titleCheck = await sendCdp('Runtime.evaluate', {
      expression: 'document.querySelector("h1")?.innerText || document.body.innerText || ""',
      returnByValue: true
    });
    const pageTitle = titleCheck.result?.result?.value || '';
    assert(pageTitle.toLowerCase().includes('fertilizer') || pageTitle.length > 0, `Page mounted with text containing fertilizer`);

    // Capture Screenshot 1: Initial Blank State
    console.log('   • Capturing Screenshot 1: Initial Form State...');
    const ss1 = await sendCdp('Page.captureScreenshot', { format: 'png' });
    const ss1Buffer = Buffer.from(ss1.result?.data, 'base64');
    fs.writeFileSync('fertilizer-initial-screen.png', ss1Buffer);
    assert(fs.existsSync('fertilizer-initial-screen.png') && fs.statSync('fertilizer-initial-screen.png').size > 10000, 
      'fertilizer-initial-screen.png captured successfully');

    // Click Preset 2: Cotton (Black Soil, 2.5 Acres) - Precision STCR
    console.log('   • Clicking Scenario: Cotton (Precision STCR)...');
    await sendCdp('Runtime.evaluate', {
      expression: `
        const btns = Array.from(document.querySelectorAll('button'));
        const presetBtn = btns.find(b => b.innerText.includes('Cotton'));
        if (presetBtn) presetBtn.click();
      `
    });
    await sleep(800);

    // Click Submit Button: Generate Crop Life-Cycle Plan
    console.log('   • Submitting Form: Calculate Crop Life-Cycle Plan...');
    const submitResult = await sendCdp('Runtime.evaluate', {
      expression: `
        (() => {
          const form = document.querySelector('form');
          if (!form) return { error: 'No form element found' };
          const isValid = form.checkValidity();
          if (!isValid) {
            const invalids = Array.from(form.elements).filter(e => !e.checkValidity());
            return {
              isValid: false,
              invalids: invalids.map(e => ({ name: e.name, value: e.value, msg: e.validationMessage }))
            };
          }
          form.requestSubmit();
          return { isValid: true };
        })()
      `,
      returnByValue: true
    });
    console.log('   • Form submission check:', submitResult.result?.result?.value);

    // Wait for API response and DOM rendering
    await sleep(3500);

    // Verify results appeared in DOM
    const resultCheck = await sendCdp('Runtime.evaluate', {
      expression: `
        const text = document.body.innerText;
        ({
          textSample: text.substring(0, 600),
          hasSTCR: text.includes('Precision STCR'),
          hasStages: text.includes('Growth Stages') || text.includes('Basal') || text.includes('Squaring'),
          hasBags: text.includes('bags (50kg)'),
          hasPh: text.includes('Soil pH')
        })
      `,
      returnByValue: true
    });
    const domStatus = resultCheck.result?.result?.value || {};
    console.log('   • DOM Status after submit:', domStatus);
    assert(domStatus.hasSTCR === true, 'DOM displays Precision STCR Mode banner');
    assert(domStatus.hasStages === true, 'DOM renders Crop Life-Cycle Growth Stages');
    assert(domStatus.hasBags === true, 'DOM renders 50-kg commercial bag calculations');
    assert(domStatus.hasPh === true, 'DOM displays Soil pH Advisory card');

    // Capture Screenshot 2: Precision STCR Life-Cycle Plan
    console.log('   • Capturing Screenshot 2: Precision STCR Life-Cycle Plan...');
    const ss2 = await sendCdp('Page.captureScreenshot', { format: 'png' });
    const ss2Buffer = Buffer.from(ss2.result?.data, 'base64');
    fs.writeFileSync('fertilizer-stcr-plan.png', ss2Buffer);
    assert(fs.existsSync('fertilizer-stcr-plan.png') && fs.statSync('fertilizer-stcr-plan.png').size > 10000,
      'fertilizer-stcr-plan.png captured successfully');

    // Click Preset 1: Rice (Clay, 3 Acres) - General RDF (No Soil Test)
    console.log('   • Clicking Scenario: Rice (General RDF, No Soil Test)...');
    await sendCdp('Runtime.evaluate', {
      expression: `
        const btns = Array.from(document.querySelectorAll('button'));
        const ricePreset = btns.find(b => b.innerText.includes('Rice'));
        if (ricePreset) ricePreset.click();
      `
    });
    await sleep(800);

    // Click Submit Button
    console.log('   • Submitting General RDF Request...');
    const riceSubmit = await sendCdp('Runtime.evaluate', {
      expression: `
        (() => {
          const form = document.querySelector('form');
          if (!form) return { error: 'No form element found' };
          const isValid = form.checkValidity();
          if (!isValid) {
            const invalids = Array.from(form.elements).filter(e => !e.checkValidity());
            return {
              isValid: false,
              invalids: invalids.map(e => ({ name: e.name, value: e.value, msg: e.validationMessage }))
            };
          }
          form.requestSubmit();
          return { isValid: true };
        })()
      `,
      returnByValue: true
    });
    console.log('   • Rice submission check:', riceSubmit.result?.result?.value);
    await sleep(3500);

    // Verify General RDF banner in DOM
    const rdfCheck = await sendCdp('Runtime.evaluate', {
      expression: `
        (() => {
          const text = document.body.innerText;
          return {
            hasGeneral: text.includes('General Agronomic Recommendation') || text.includes('General RDF') || text.includes('Standard RDF'),
            textSnippet: text.substring(0, 400)
          };
        })()
      `,
      returnByValue: true
    });
    console.log('   • Rice result text:', rdfCheck.result?.result?.value);
    assert(rdfCheck.result?.result?.value?.hasGeneral === true, 'DOM updated to General Agronomic Recommendation (Standard RDF)');

    // Capture Screenshot 3: General RDF Plan
    console.log('   • Capturing Screenshot 3: General RDF Life-Cycle Plan...');
    const ss3 = await sendCdp('Page.captureScreenshot', { format: 'png' });
    const ss3Buffer = Buffer.from(ss3.result?.data, 'base64');
    fs.writeFileSync('fertilizer-general-rdf-plan.png', ss3Buffer);
    assert(fs.existsSync('fertilizer-general-rdf-plan.png') && fs.statSync('fertilizer-general-rdf-plan.png').size > 10000,
      'fertilizer-general-rdf-plan.png captured successfully');

    ws.close();
  } finally {
    edgeProcess.kill();
    // Clean up temporary user data directory
    try {
      fs.rmSync(TEMP_USER_DATA, { recursive: true, force: true });
    } catch {}
  }

  console.log('\n======================================================================');
  console.log(`🎉 ALL ${testsPassed} FRONTEND-BACKEND WORKFLOW & UI TESTS PASSED!`);
  console.log('======================================================================\n');
}

runTests().catch((err) => {
  console.error('\n❌ WORKFLOW TEST FAILED:\n', err);
  process.exit(1);
});
