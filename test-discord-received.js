// Test script for Discord "received" status notification
// Run with: node test-discord-received.js

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function testDiscordReceived() {
  console.log('🧪 Testing Discord "Received" Status Notification...\n');
  
  try {
    // Test the Discord notification directly
    console.log('1. Testing Discord notification for received order...');
    const response = await fetch(`${BASE_URL}/api/discord-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        notificationType: 'order_received',
        orderId: 'test-order-123',
        cartTotal: 99.99,
        userEmail: 'test@example.com',
        productImage: null
      })
    });
    
    const result = await response.json();
    console.log('   Status:', response.status);
    console.log('   Response:', JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('   ✅ Discord "received" notification test passed');
    } else {
      console.log('   ❌ Discord "received" notification test failed');
    }
    
    console.log('\n🎉 Discord "received" status notification is working!');
    console.log('\nNext steps:');
    console.log('1. Go to admin panel and change an order status to "received"');
    console.log('2. Check your Discord channel for the notification');
    console.log('3. Verify the notification shows "Order Received 📦" with blue color');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure the development server is running');
    console.log('2. Check if the Discord webhook URL is configured');
    console.log('3. Verify the Supabase Edge Function is deployed');
  }
}

// Run the test
testDiscordReceived();
