import { Vonage } from '@vonage/server-sdk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Vonage client
const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY || '',
  apiSecret: process.env.VONAGE_API_SECRET || '',
  applicationId: process.env.VONAGE_APPLICATION_ID,
  privateKey: process.env.VONAGE_PRIVATE_KEY?.replace(/\\n/g, '\n')
});

async function testVonageConnection() {
  try {
    console.log('Testing Vonage connection...');
    
    // Test getting account balance
    const balance = await vonage.accounts.getBalance();
    console.log('✅ Vonage connection successful!');
    console.log('Account balance:', balance.value, balance.currency);
    
    // Test getting application details if applicationId is provided
    if (process.env.VONAGE_APPLICATION_ID) {
      console.log('\nTesting application details...');
      const app = await vonage.applications.getApplication(process.env.VONAGE_APPLICATION_ID);
      console.log('✅ Application details retrieved successfully!');
      console.log('Application name:', app.name);
      console.log('Capabilities:', JSON.stringify(app.capabilities, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error testing Vonage connection:');
    if (error instanceof Error) {
      console.error('Message:', error.message);
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

testVonageConnection();
