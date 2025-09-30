// Test script for price calculations
// Run with: node test-price-calculations.js

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function testPriceCalculations() {
  console.log('🧪 Testing Price Calculations...\n');
  
  try {
    // Test with sample cart items
    const testCartItems = [
      { id: '1', quantity: 1, price: 70.00 }
    ];
    
    console.log('1. Testing order creation with process fees...');
    console.log('   Cart total: $70.00');
    console.log('   Expected process fees (15%): $10.50');
    console.log('   Expected final total: $80.50');
    
    const response = await fetch(`${BASE_URL}/api/checkout/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // You may need to adjust this
      },
      body: JSON.stringify({
        cartItems: testCartItems
      })
    });
    
    const result = await response.json();
    console.log('   Status:', response.status);
    
    if (response.ok) {
      console.log('   Order created successfully!');
      console.log('   Order ID:', result.orderId);
      console.log('   Amounts:', JSON.stringify(result.amounts, null, 2));
      
      // Verify the calculations
      const amounts = result.amounts;
      const expectedSubtotal = 70.00;
      const expectedProcessFees = 10.50;
      const expectedTotal = 80.50;
      
      console.log('\n2. Verifying calculations...');
      console.log(`   Subtotal: $${amounts.subtotal} (expected: $${expectedSubtotal})`);
      console.log(`   Process Fees: $${amounts.process_fees} (expected: $${expectedProcessFees})`);
      console.log(`   Total: $${amounts.total} (expected: $${expectedTotal})`);
      
      if (Math.abs(amounts.subtotal - expectedSubtotal) < 0.01) {
        console.log('   ✅ Subtotal calculation correct');
      } else {
        console.log('   ❌ Subtotal calculation incorrect');
      }
      
      if (Math.abs(amounts.process_fees - expectedProcessFees) < 0.01) {
        console.log('   ✅ Process fees calculation correct');
      } else {
        console.log('   ❌ Process fees calculation incorrect');
      }
      
      if (Math.abs(amounts.total - expectedTotal) < 0.01) {
        console.log('   ✅ Total calculation correct');
      } else {
        console.log('   ❌ Total calculation incorrect');
      }
      
    } else {
      console.log('   ❌ Order creation failed:', result.error);
    }
    
    console.log('\n🎉 Price calculation test completed!');
    console.log('\nNext steps:');
    console.log('1. Test the checkout page to ensure prices match');
    console.log('2. Test PayPal payment to verify the correct amount is charged');
    console.log('3. Check that process fees are properly displayed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure the development server is running');
    console.log('2. Check if you need to be authenticated');
    console.log('3. Verify the API endpoints are accessible');
  }
}

// Run the test
testPriceCalculations();
