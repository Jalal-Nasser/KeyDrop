import { NextResponse } from 'next/server';
import { Vonage } from '@vonage/server-sdk';

// Initialize Vonage client using environment variables
const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY || '',
  apiSecret: process.env.VONAGE_API_SECRET || '',
  applicationId: process.env.VONAGE_APPLICATION_ID,
  privateKey: process.env.VONAGE_PRIVATE_KEY?.replace(/\\n/g, '\n')
});

export async function GET() {
  try {
    // Test getting account balance
    const balance = await vonage.accounts.getBalance();
    
    let appDetails = {};
    // Test getting application details if applicationId is provided
    if (process.env.VONAGE_APPLICATION_ID) {
      try {
        const app = await vonage.applications.getApplication(process.env.VONAGE_APPLICATION_ID);
        appDetails = {
          name: app.name,
          capabilities: app.capabilities
        };
      } catch (error) {
        console.error('Error getting application details:', error);
        appDetails = { error: 'Failed to get application details' };
      }
    }

    return NextResponse.json({
      success: true,
      balance: {
        value: balance.value,
      },
      balanceRaw: balance,
      application: appDetails,
      environment: {
        hasApiKey: !!process.env.VONAGE_API_KEY,
        hasApiSecret: !!process.env.VONAGE_API_SECRET,
        hasApplicationId: !!process.env.VONAGE_APPLICATION_ID,
        hasPrivateKey: !!process.env.VONAGE_PRIVATE_KEY,
        nodeEnv: process.env.NODE_ENV
      }
    });
    
  } catch (error) {
    console.error('Vonage test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: {
        hasApiKey: !!process.env.VONAGE_API_KEY,
        hasApiSecret: !!process.env.VONAGE_API_SECRET,
        hasApplicationId: !!process.env.VONAGE_APPLICATION_ID,
        hasPrivateKey: !!process.env.VONAGE_PRIVATE_KEY,
        nodeEnv: process.env.NODE_ENV
      }
    }, { status: 500 });
  }
}
