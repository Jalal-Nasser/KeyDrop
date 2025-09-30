import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const statusUpdate = await request.json();
    console.log('Message status update:', JSON.stringify(statusUpdate, null, 2));
    
    // Here you can update your database with the message status
    // For example, update the delivery status of a message in your database
    
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Error processing status update:', error);
    return NextResponse.json(
      { error: 'Error processing status update' },
      { status: 500 }
    );
  }
}
