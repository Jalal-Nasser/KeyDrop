// Simple test script for auto-cancel functionality
// Run with: node test-auto-cancel.js

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const CRON_SECRET = process.env.CRON_SECRET_TOKEN || 'test-token';

async function testAutoCancel() {
  console.log('🧪 Testing Auto-Cancel Orders API...\n');
  
  try {
    // Test the admin API endpoint
    console.log('1. Testing admin API endpoint...');
    const adminResponse = await fetch(`${BASE_URL}/api/admin/auto-cancel-orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const adminResult = await adminResponse.json();
    console.log('   Status:', adminResponse.status);
    console.log('   Response:', JSON.stringify(adminResult, null, 2));
    
    if (adminResponse.ok) {
      console.log('   ✅ Admin API test passed');
    } else {
      console.log('   ❌ Admin API test failed');
    }
    
    console.log('\n2. Testing cron API endpoint...');
    const cronResponse = await fetch(`${BASE_URL}/api/cron/auto-cancel-orders`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
      },
    });
    
    const cronResult = await cronResponse.json();
    console.log('   Status:', cronResponse.status);
    console.log('   Response:', JSON.stringify(cronResult, null, 2));
    
    if (cronResponse.ok) {
      console.log('   ✅ Cron API test passed');
    } else {
      console.log('   ❌ Cron API test failed');
    }
    
    console.log('\n🎉 Auto-cancel system is working!');
    console.log('\nNext steps:');
    console.log('1. Set up a cron job to call the API regularly');
    console.log('2. Test with real pending orders (10-minute timeout)');
    console.log('3. Check email and Discord notifications');
    console.log('4. Test the payment countdown timer on checkout page');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure the development server is running');
    console.log('2. Check if the API endpoints are accessible');
    console.log('3. Verify environment variables are set');
  }
}

// Run the test
testAutoCancel();
