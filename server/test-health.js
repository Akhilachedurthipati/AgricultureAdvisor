import http from 'http';
import app from './src/app.js';

const testServer = http.createServer(app);

testServer.listen(5001, async () => {
  console.log('[Test] Server listening on port 5001 for health check test...');
  
  try {
    const res = await fetch('http://localhost:5001/api/health');
    const data = await res.json();
    
    console.log('[Test Response Status]:', res.status);
    console.log('[Test Response Body]:', JSON.stringify(data, null, 2));

    if (res.status === 200 && data.success === true && data.service === 'AGRICULTURE ADVISOR API') {
      console.log('✅ HEALTH CHECK TEST PASSED SUCCESSFULLY!');
      testServer.close(() => process.exit(0));
    } else {
      console.error('❌ Health check test failed: unexpected response');
      testServer.close(() => process.exit(1));
    }
  } catch (err) {
    console.error('❌ Test request error:', err);
    testServer.close(() => process.exit(1));
  }
});

