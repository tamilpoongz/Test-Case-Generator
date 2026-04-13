const http = require('http');

const userStoryData = {
  title: "Guest User Checkout and Order Placement",
  description: "As a guest user, I want to proceed with checkout and place an order without logging in, so that I can complete my purchase by entering valid delivery details, selecting available shipping and payment options, and receiving order confirmation when all required validations are passed.",
  acceptanceCriteria: [
    "Given a guest user has one or more items in the cart,",
    "When the user proceeds to checkout without logging in,",
    "Then the system must allow the user to continue checkout as a guest."
  ]
};

const payload = JSON.stringify({
  title: userStoryData.title,
  description: userStoryData.description,
  acceptanceCriteria: userStoryData.acceptanceCriteria
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
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    const response = JSON.parse(data);
    
    console.log('\n');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('   TEST CASE GENERATION RESULTS');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('\n📋 USER STORY:');
    console.log(`   Title: ${userStoryData.title}`);
    console.log(`   Description: ${userStoryData.description.substring(0, 100)}...`);
    console.log(`   Criteria: ${userStoryData.acceptanceCriteria.length} criteria provided`);
    
    console.log('\n📊 GENERATION SUMMARY:');
    console.log(`   Status: ${response.status}`);
    console.log(`   Total Test Cases Generated: ${response.summary.totalTestCases}`);
    console.log(`   Average Confidence: ${(response.summary.averageConfidence * 100).toFixed(1)}%`);
    console.log(`   Test Case Types: ${Object.keys(response.summary.byType).join(', ')}`);
    
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('   GENERATED TEST CASES (All Details)');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    response.draftTestCases.forEach((tc, index) => {
      console.log(`\n📌 TEST CASE ${index + 1}: ${tc.testCaseId}`);
      console.log(`   ┌─────────────────────────────────────────────────────────`);
      console.log(`   │ Title: ${tc.testCaseTitle}`);
      console.log(`   │ Type: ${tc.testType} | Priority: ${tc.priority} | Confidence: ${(tc.confidenceScore * 100).toFixed(0)}%`);
      console.log(`   ├─────────────────────────────────────────────────────────`);
      console.log(`   │ PRECONDITIONS:`);
      tc.preconditions.forEach(pc => console.log(`   │   • ${pc}`));
      console.log(`   │`);
      console.log(`   │ TEST STEPS:`);
      tc.testSteps.forEach((step, i) => console.log(`   │   ${i + 1}. ${step}`));
      console.log(`   │`);
      console.log(`   │ TEST DATA:`);
      tc.testData.forEach(td => console.log(`   │   • ${td}`));
      console.log(`   │`);
      console.log(`   │ EXPECTED RESULT:`);
      console.log(`   │   ${tc.expectedResult}`);
      console.log(`   └─────────────────────────────────────────────────────────`);
    });
    
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('   BREAKDOWN BY TYPE');
    console.log('═══════════════════════════════════════════════════════════════');
    Object.entries(response.summary.byType).forEach(([type, count]) => {
      console.log(`   • ${type}: ${count} test case(s)`);
    });
    
    console.log('\n✅ Test case generation completed successfully!\n');
  });
});

req.on('error', (e) => {
  console.error(`Error: ${e.message}`);
});

console.log('\n🚀 Generating test cases for guest checkout scenario...\n');
req.write(payload);
req.end();
