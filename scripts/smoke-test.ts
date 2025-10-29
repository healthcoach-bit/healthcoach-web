/**
 * ⚠️ CRITICAL: Smoke Tests for Timestamp Handling
 * 
 * Run these tests after ANY changes to:
 * - Backend: foodLogs.ts timestamp handling
 * - Frontend: dateUtils.ts, new-log page, display components
 * - Deployment: After CDK deploy
 * 
 * Usage: npm run smoke-test
 * Or: npx tsx scripts/smoke-test.ts
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
const TEST_USER_TOKEN = process.env.TEST_USER_TOKEN;

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: string;
}

const results: TestResult[] = [];

function logTest(name: string, passed: boolean, details?: string, error?: string) {
  const result: TestResult = { name, passed, details, error };
  results.push(result);
  
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${name}`);
  if (details) console.log(`   ${details}`);
  if (error) console.error(`   Error: ${error}`);
}

async function testCreateWithTimestamp() {
  try {
    console.log('\n🧪 Test 1: CREATE food log with timestamp');
    
    const testTimestamp = '2025-10-29T09:00:00.000Z';
    const response = await fetch(`${API_URL}/food-logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_USER_TOKEN}`,
      },
      body: JSON.stringify({
        mealType: 'breakfast',
        timestamp: testTimestamp,
        totalCalories: 500,
        notes: 'Smoke test meal',
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    const data = await response.json();
    const returnedTimestamp = data.foodLog?.timestamp || data.timestamp;
    
    // CRITICAL: Timestamp should be stored as-is (display time)
    if (returnedTimestamp === testTimestamp) {
      logTest('CREATE stores timestamp correctly', true, `Stored: ${returnedTimestamp}`);
      return data.foodLog?.id || data.id;
    } else {
      logTest('CREATE stores timestamp correctly', false, 
        `Expected: ${testTimestamp}, Got: ${returnedTimestamp}`);
      return null;
    }
  } catch (error: any) {
    logTest('CREATE food log', false, undefined, error.message);
    return null;
  }
}

async function testGetTimestamp(foodLogId: string) {
  try {
    console.log('\n🧪 Test 2: GET food log and verify timestamp');
    
    const response = await fetch(`${API_URL}/food-logs/${foodLogId}`, {
      headers: {
        'Authorization': `Bearer ${TEST_USER_TOKEN}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    const timestamp = data.foodLog?.timestamp || data.timestamp;
    
    // CRITICAL: Should return "2025-10-29T09:00:00.000Z" (9 AM, not converted)
    if (timestamp.includes('09:00')) {
      logTest('GET returns correct timestamp', true, `Timestamp: ${timestamp}`);
      return true;
    } else {
      logTest('GET returns correct timestamp', false, 
        `Expected time around 09:00, Got: ${timestamp}`);
      return false;
    }
  } catch (error: any) {
    logTest('GET food log', false, undefined, error.message);
    return false;
  }
}

async function testUpdateTimestamp(foodLogId: string) {
  try {
    console.log('\n🧪 Test 3: UPDATE timestamp to 2:00 PM');
    
    const newTimestamp = '2025-10-29T14:00:00.000Z';
    const response = await fetch(`${API_URL}/food-logs/${foodLogId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_USER_TOKEN}`,
      },
      body: JSON.stringify({
        timestamp: newTimestamp,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    // Verify update
    const getResponse = await fetch(`${API_URL}/food-logs/${foodLogId}`, {
      headers: { 'Authorization': `Bearer ${TEST_USER_TOKEN}` },
    });
    
    const data = await getResponse.json();
    const timestamp = data.foodLog?.timestamp || data.timestamp;
    
    // CRITICAL: Should be updated to 14:00 (2 PM)
    if (timestamp.includes('14:00')) {
      logTest('UPDATE timestamp works correctly', true, `Updated to: ${timestamp}`);
      return true;
    } else {
      logTest('UPDATE timestamp works correctly', false, 
        `Expected time around 14:00, Got: ${timestamp}`);
      return false;
    }
  } catch (error: any) {
    logTest('UPDATE timestamp', false, undefined, error.message);
    return false;
  }
}

async function testDelete(foodLogId: string) {
  try {
    console.log('\n🧪 Test 4: DELETE food log');
    
    const response = await fetch(`${API_URL}/food-logs/${foodLogId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${TEST_USER_TOKEN}`,
      },
    });
    
    if (response.ok) {
      logTest('DELETE food log', true);
      return true;
    } else {
      logTest('DELETE food log', false, `HTTP ${response.status}`);
      return false;
    }
  } catch (error: any) {
    logTest('DELETE food log', false, undefined, error.message);
    return false;
  }
}

async function runSmokeTests() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🚨 CRITICAL SMOKE TESTS: Timestamp Handling');
  console.log('═══════════════════════════════════════════════════════');
  
  if (!TEST_USER_TOKEN) {
    console.error('\n❌ ERROR: TEST_USER_TOKEN environment variable not set');
    console.log('Please set a valid user token for testing:');
    console.log('export TEST_USER_TOKEN="your-test-token"');
    process.exit(1);
  }
  
  console.log(`API URL: ${API_URL}`);
  console.log('Starting tests...\n');
  
  // Test 1: Create
  const foodLogId = await testCreateWithTimestamp();
  if (!foodLogId) {
    console.log('\n❌ Cannot continue tests without a valid food log ID');
    printSummary();
    process.exit(1);
  }
  
  // Test 2: Get
  await testGetTimestamp(foodLogId);
  
  // Test 3: Update
  await testUpdateTimestamp(foodLogId);
  
  // Test 4: Delete
  await testDelete(foodLogId);
  
  // Summary
  printSummary();
}

function printSummary() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📊 TEST SUMMARY');
  console.log('═══════════════════════════════════════════════════════');
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;
  
  console.log(`Total: ${total} | Passed: ${passed} | Failed: ${failed}\n`);
  
  if (failed > 0) {
    console.log('❌ FAILED TESTS:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`   - ${r.name}`);
      if (r.error) console.log(`     ${r.error}`);
    });
    console.log('\n⚠️  DO NOT DEPLOY - Fix failures first!\n');
    process.exit(1);
  } else {
    console.log('🎉 All tests passed! Safe to deploy.\n');
    process.exit(0);
  }
}

// Run tests
runSmokeTests().catch(error => {
  console.error('\n💥 Smoke tests crashed:', error);
  process.exit(1);
});
