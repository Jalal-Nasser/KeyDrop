import { NextResponse } from 'next/server';

// Initialize Vonage client
const { Vonage } = require('@vonage/server-sdk');

const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY || '',
  apiSecret: process.env.VONAGE_API_SECRET || '',
  applicationId: process.env.VONAGE_APPLICATION_ID,
  privateKey: process.env.VONAGE_PRIVATE_KEY?.replace(/\\n/g, '\n')
});

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Incoming WhatsApp message:', JSON.stringify(data, null, 2));
    
    // Process the incoming message
    if (data.message && data.message.content && data.message.content.type === 'text') {
      const message = data.message.content.text;
      const from = data.message.from;
      
      // Here you can add your business logic
      // For example, send an automatic reply
      await vonage.messages.send({
        to: from,
        from: process.env.VONAGE_WHATSAPP_NUMBER,
        channel: 'whatsapp',
        message_type: 'text',
        text: 'Thank you for your message! We will get back to you soon.',
        client_ref: `auto-reply-${Date.now()}`
      });
      
      console.log('Sent auto-reply to:', from);
    }
    
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Error processing inbound message:', error);
    return NextResponse.json(
      { error: 'Error processing message' },
      { status: 500 }
    );
  }
}
