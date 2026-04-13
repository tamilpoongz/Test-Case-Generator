const http = require('http');

const payload = JSON.stringify({
  title: "User Login",
  description: "Users should be able to log in with their credentials",
  acceptanceCriteria: ["User can login with valid credentials", "Error message for invalid credentials"]
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/testcases/generate',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
};

const req = http.request(options, (res) => {
  let data = '';
  
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS:`, res.headers);
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\n✅ RESPONSE BODY:');
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
      console.log('\n📊 ANALYSIS:');
      console.log('- Has draftTestCases:', !!parsed.draftTestCases);
      console.log('- draftTestCases length:', parsed.draftTestCases?.length);
      console.log('- Has summary:', !!parsed.summary);
      console.log('- Status:', parsed.status);
      if (parsed.draftTestCases && parsed.draftTestCases.length > 0) {
        console.log('\n✅ FIRST TEST CASE:');
        console.log(JSON.stringify(parsed.draftTestCases[0], null, 2));
      }
    } catch (e) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

console.log('📤 Sending test request to http://localhost:3001/api/testcases/generate');
console.log('Payload:', payload);
req.write(payload);
req.end();
