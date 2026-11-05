import http from 'http';
import app from './src/app.js';

const testServer = http.createServer(app);
const PORT = 5002;

const runAuthTests = async () => {
  const baseUrl = `http://localhost:${PORT}/api/auth`;
  let testUserToken = null;

  console.log('[Auth Test] Starting comprehensive authentication suite...');

  // Test 1: Register new farmer
  const regPayload = {
    name: 'Ramesh Patel',
    email: 'ramesh.farmer@example.com',
    password: 'secureFarmPassword123',
    phone: '9876543210',
    preferredLanguage: 'hi',
    location: {
      state: 'Gujarat',
      district: 'Ahmedabad',
      city: 'Sanand'
    }
  };

  const regRes = await fetch(`${baseUrl}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(regPayload)
  });
  const regData = await regRes.json();

  if (regRes.status !== 201 || !regData.token || !regData.user) {
    throw new Error(`Test 1 Failed: Registration failed (${regRes.status}) - ${JSON.stringify(regData)}`);
  }
  console.log('✅ Test 1 Passed: Farmer registration returns 201 and JWT token.');
  testUserToken = regData.token;

  // Test 2: Duplicate email registration rejection
  const dupRes = await fetch(`${baseUrl}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(regPayload)
  });
  const dupData = await dupRes.json();
  if (dupRes.status !== 400 || dupData.success !== false) {
    throw new Error(`Test 2 Failed: Duplicate email was not rejected with 400`);
  }
  console.log('✅ Test 2 Passed: Duplicate email properly rejected with 400.');

  // Test 3: Validation rejection on short password
  const badRes = await fetch(`${baseUrl}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'A', email: 'not-an-email', password: '123' })
  });
  const badData = await badRes.json();
  if (badRes.status !== 400 || !badData.errors) {
    throw new Error(`Test 3 Failed: Invalid inputs were not rejected with Zod errors`);
  }
  console.log('✅ Test 3 Passed: Zod validation rejects malformed payload.');

  // Test 4: Farmer login with valid credentials
  const loginRes = await fetch(`${baseUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'ramesh.farmer@example.com',
      password: 'secureFarmPassword123'
    })
  });
  const loginData = await loginRes.json();
  if (loginRes.status !== 200 || !loginData.token) {
    throw new Error(`Test 4 Failed: Login failed (${loginRes.status})`);
  }
  console.log('✅ Test 4 Passed: Farmer login returns 200 and valid JWT.');

  // Test 5: Farmer login with incorrect password
  const badPassRes = await fetch(`${baseUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'ramesh.farmer@example.com',
      password: 'WrongPassword'
    })
  });
  if (badPassRes.status !== 401) {
    throw new Error(`Test 5 Failed: Invalid password did not return 401`);
  }
  console.log('✅ Test 5 Passed: Invalid password properly returns 401.');

  // Test 6: Protected route without token
  const noTokenRes = await fetch(`${baseUrl}/profile`);
  if (noTokenRes.status !== 401) {
    throw new Error(`Test 6 Failed: Protected route without token did not return 401`);
  }
  console.log('✅ Test 6 Passed: Protected route rejects unauthenticated request with 401.');

  // Test 7: Protected route with valid Bearer token
  const profileRes = await fetch(`${baseUrl}/profile`, {
    headers: { 'Authorization': `Bearer ${testUserToken}` }
  });
  const profileData = await profileRes.json();
  if (profileRes.status !== 200 || profileData.user.email !== 'ramesh.farmer@example.com') {
    throw new Error(`Test 7 Failed: Profile fetch failed (${profileRes.status})`);
  }
  console.log('✅ Test 7 Passed: Protected route returns authentic farmer profile.');

  // Test 8: Update farmer profile
  const updateRes = await fetch(`${baseUrl}/profile`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${testUserToken}` 
    },
    body: JSON.stringify({
      phone: '9988776655',
      preferredLanguage: 'te',
      location: { state: 'Andhra Pradesh', district: 'Guntur', city: 'Tenali' }
    })
  });
  const updateData = await updateRes.json();
  if (updateRes.status !== 200 || updateData.user.preferredLanguage !== 'te') {
    throw new Error(`Test 8 Failed: Profile update failed (${updateRes.status})`);
  }
  console.log('✅ Test 8 Passed: Farmer profile update succeeds and reflects new details.');

  console.log('\n🎉 ALL 8 BACKEND AUTHENTICATION TESTS PASSED PERFECTLY!\n');
};

testServer.listen(PORT, async () => {
  try {
    await runAuthTests();
    testServer.close(() => process.exit(0));
  } catch (error) {
    console.error('❌ Authentication Test Failure:', error.message);
    testServer.close(() => process.exit(1));
  }
});
