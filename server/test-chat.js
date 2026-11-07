import http from 'http';
import app from './src/app.js';

const testServer = http.createServer(app);
const PORT = 5007;

const runChatTests = async () => {
  const baseUrl = `http://localhost:${PORT}/api`;
  console.log('\n[Chat Test] Starting comprehensive Multilingual AI Farming Assistant tests...');

  // 1. Register test farmer
  const authRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Balram Kishan',
      email: `balram.${Date.now()}@example.com`,
      password: 'SecureFarmPassword2026',
      preferredLanguage: 'te',
      location: { state: 'Telangana', district: 'Warangal', city: 'Narsampet' }
    })
  });
  const authData = await authRes.json();
  const token = authData.token;
  if (!token) {
    throw new Error(`Failed to obtain auth token: ${JSON.stringify(authData)}`);
  }
  console.log('✅ 1. Test farmer registered with JWT authentication');

  // 2. Reject unauthenticated request (401)
  const unauthRes = await fetch(`${baseUrl}/chat/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Hello' })
  });
  if (unauthRes.status !== 401) {
    throw new Error(`Expected 401, got ${unauthRes.status}`);
  }
  console.log('✅ 2. Protected route properly rejected unauthenticated request with 401');

  // 3. Zod validation rejection on empty message (400)
  const invalidRes = await fetch(`${baseUrl}/chat/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ message: ' ' })
  });
  if (invalidRes.status !== 400) {
    throw new Error(`Expected 400 for empty message, got ${invalidRes.status}`);
  }
  console.log('✅ 3. Zod validation caught and rejected empty message payload (400)');

  // 4. Test Crop Advisory Query (English)
  const cropRes = await fetch(`${baseUrl}/chat/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      message: 'Which crop is suitable for black cotton soil in kharif season?',
      language: 'en'
    })
  });
  const cropData = await cropRes.json();
  if (cropRes.status !== 200 || !/cotton|regur|black/i.test(cropData.data.response)) {
    throw new Error(`Crop query failed: ${JSON.stringify(cropData)}`);
  }
  console.log(`✅ 4. Crop advisory query answered: category="${cropData.data.category}"`);
  console.log(`   • Sample: "${cropData.data.response.substring(0, 85)}..."`);

  // 5. Test Fertilizer Advisory Query (English)
  const fertRes = await fetch(`${baseUrl}/chat/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      message: 'When and how should urea fertilizer be applied to paddy?',
      language: 'en'
    })
  });
  const fertData = await fertRes.json();
  if (fertRes.status !== 200 || !/urea|split|basal|tillering/i.test(fertData.data.response)) {
    throw new Error(`Fertilizer query failed: ${JSON.stringify(fertData)}`);
  }
  console.log(`✅ 5. Fertilizer advisory query answered: category="${fertData.data.category}"`);

  // 6. Test Organic Pest Control Query (English)
  const pestRes = await fetch(`${baseUrl}/chat/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      message: 'How can I control whitefly and aphids organically?',
      language: 'en'
    })
  });
  const pestData = await pestRes.json();
  if (pestRes.status !== 200 || !/whitefl|neem|trap/i.test(pestData.data.response)) {
    throw new Error(`Pest control query failed: ${JSON.stringify(pestData)}`);
  }
  console.log(`✅ 6. Organic pest control query answered: category="${pestData.data.category}"`);

  // 7. Test Multilingual Query in Telugu
  const teRes = await fetch(`${baseUrl}/chat/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      message: 'నల్ల రేగడి నేలల్లో ఏ పంటలు వేస్తే మంచిది?',
      language: 'te'
    })
  });
  const teData = await teRes.json();
  if (teRes.status !== 200 || teData.data.language !== 'te') {
    throw new Error(`Telugu query failed: ${JSON.stringify(teData)}`);
  }
  if (!/పత్తి|నేలలు|సారం/i.test(teData.data.response)) {
    throw new Error(`Expected Telugu response, got: ${teData.data.response}`);
  }
  console.log(`✅ 7. Multilingual Telugu query answered: "${teData.data.response.substring(0, 60)}..."`);

  // 8. Test Multilingual Query in Hindi
  const hiRes = await fetch(`${baseUrl}/chat/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      message: 'धान में यूरिया डालने का सही तरीका क्या है?',
      language: 'hi'
    })
  });
  const hiData = await hiRes.json();
  if (hiRes.status !== 200 || hiData.data.language !== 'hi') {
    throw new Error(`Hindi query failed: ${JSON.stringify(hiData)}`);
  }
  if (!/यूरिया|बुवाई|मिट्टी/i.test(hiData.data.response)) {
    throw new Error(`Expected Hindi response, got: ${hiData.data.response}`);
  }
  console.log(`✅ 8. Multilingual Hindi query answered: "${hiData.data.response.substring(0, 60)}..."`);

  // 9. Test Non-Agricultural Safety Guardrail Deflection
  const offTopicRes = await fetch(`${baseUrl}/chat/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      message: 'Who won the cricket match world cup final?',
      language: 'en'
    })
  });
  const offTopicData = await offTopicRes.json();
  if (offTopicRes.status !== 200 || !/specialized AI Agriculture Advisor|only assist with farming/i.test(offTopicData.data.response)) {
    throw new Error(`Expected off-topic deflection message, got: ${JSON.stringify(offTopicData)}`);
  }
  console.log('✅ 9. Safety guardrail correctly deflected non-agricultural query with polite notice');

  // 10. Fetch Chat History
  const histRes = await fetch(`${baseUrl}/chat/history`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  });
  const histData = await histRes.json();
  if (histRes.status !== 200 || !Array.isArray(histData.data) || histData.data.length < 6) {
    throw new Error(`Expected at least 6 history items, got: ${histData.data?.length}`);
  }
  console.log(`✅ 10. User chat history retrieved: ${histData.data.length} messages found`);

  // 11. Clear Chat History
  const delRes = await fetch(`${baseUrl}/chat/history`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  const delData = await delRes.json();
  if (delRes.status !== 200 || !delData.success) {
    throw new Error(`Clear history failed: ${JSON.stringify(delData)}`);
  }

  const verifyDelRes = await fetch(`${baseUrl}/chat/history`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  });
  const verifyDelData = await verifyDelRes.json();
  if (verifyDelData.data?.length !== 0) {
    throw new Error(`Expected 0 history items after deletion, got: ${verifyDelData.data?.length}`);
  }
  console.log('✅ 11. Chat history cleared and verified 0 records remaining');

  console.log('\n🌟 ALL 11 MULTILINGUAL AI FARMING ASSISTANT TESTS PASSED PERFECTLY!\n');
};

testServer.listen(PORT, async () => {
  try {
    await runChatTests();
    testServer.close();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ CHAT TEST FAILED:', err.message);
    testServer.close();
    process.exit(1);
  }
});
