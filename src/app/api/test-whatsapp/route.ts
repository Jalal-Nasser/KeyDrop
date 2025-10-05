import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing WhatsApp with environment variables:', {
      hasApiKey: !!process.env.VONAGE_API_KEY,
      hasApiSecret: !!process.env.VONAGE_API_SECRET,
      hasFromNumber: !!process.env.VONAGE_WHATSAPP_NUMBER,
      hasToNumber: !!process.env.VONAGE_ADMIN_WHATSAPP,
      apiKey: process.env.VONAGE_API_KEY,
      fromNumber: process.env.VONAGE_WHATSAPP_NUMBER,
      toNumber: process.env.VONAGE_ADMIN_WHATSAPP
    });

    const authString = Buffer.from(
      `${process.env.VONAGE_API_KEY}:${process.env.VONAGE_API_SECRET}` 
    ).toString('base64');

    const message = 'Test WhatsApp notification from Dropskey';

    const response = await fetch('https://api.nexmo.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}` ,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        from: process.env.VONAGE_WHATSAPP_NUMBER,
        to: process.env.VONAGE_ADMIN_WHATSAPP,
        message_type: 'text',
        text: message,
        channel: 'whatsapp'
      })
    });

    const responseText = await response.text();
    
    console.log('Vonage response status:', response.status);
    console.log('Vonage response:', responseText);

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      response: responseText,
      envCheck: {
        hasApiKey: !!process.env.VONAGE_API_KEY,
        hasApiSecret: !!process.env.VONAGE_API_SECRET,
        hasFromNumber: !!process.env.VONAGE_WHATSAPP_NUMBER,
        hasToNumber: !!process.env.VONAGE_ADMIN_WHATSAPP
      }
    });
  } catch (error: any) {
    console.error('Test WhatsApp error:', error);
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}
