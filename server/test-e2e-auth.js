import http from 'http';
import app from './src/app.js';

const testServer = http.createServer(app);
const PORT = 5003;

testServer.listen(PORT, async () => {
  const baseUrl = `http://localhost:${PORT}/api`;

  try {
    console.log('[E2E Test] Starting End-to-End Farmer Auth Simulation...');

    // 1. Check health
    const healthRes = await fetch(`${baseUrl}/health`);
    const health = await healthRes.json();
    if (healthRes.status !== 200 || !health.success) {
      throw new Error('Health check failed in E2E simulation');
    }
    console.log('✅ 1. System health check operational');

    // 2. Register new farmer Priya Sharma
    const farmerData = {
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      password: 'FarmingPassword2026!',
      phone: '9123456789',
      preferredLanguage: 'te',
      location: {
        state: 'Andhra Pradesh',
        district: 'Krishna',
        city: 'Vijayawada'
      }
    };

    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(farmerData)
    });
    const regResult = await regRes.json();

    if (regRes.status !== 201 || !regResult.token || regResult.user.name !== 'Priya Sharma') {
      throw new Error(`Farmer registration failed: ${JSON.stringify(regResult)}`);
    }
    console.log('✅ 2. Farmer registration successful:', regResult.user.name, `(${regResult.user.email})`);

    const token = regResult.token;

    // 3. Access protected dashboard profile
    const profileRes = await fetch(`${baseUrl}/auth/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const profileResult = await profileRes.json();

    if (profileRes.status !== 200 || profileResult.user.email !== 'priya.sharma@example.com') {
      throw new Error('Failed to retrieve farmer profile with JWT Bearer token');
    }
    console.log('✅ 3. Authenticated profile retrieved. Preferred language:', profileResult.user.preferredLanguage);

    // 4. Update farmer location & phone
    const updateRes = await fetch(`${baseUrl}/auth/profile`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        phone: '9888877777',
        location: { state: 'Telangana', district: 'Warangal', city: 'Hanamkonda' }
      })
    });
    const updateResult = await updateRes.json();

    if (updateRes.status !== 200 || updateResult.user.phone !== '9888877777') {
      throw new Error('Failed to update farmer profile');
    }
    console.log('✅ 4. Farmer profile updated successfully:', updateResult.user.location);

    // 5. Test farmer login
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'priya.sharma@example.com',
        password: 'FarmingPassword2026!'
      })
    });
    const loginResult = await loginRes.json();

    if (loginRes.status !== 200 || !loginResult.token) {
      throw new Error('Farmer login failed with correct credentials');
    }
    console.log('✅ 5. Farmer login verified successfully.');

    console.log('\n🌟 END-TO-END FARMER AUTHENTICATION PIPELINE 100% OPERATIONAL!\n');
    testServer.close(() => process.exit(0));
  } catch (error) {
    console.error('❌ E2E Simulation Failure:', error);
    testServer.close(() => process.exit(1));
  }
});
