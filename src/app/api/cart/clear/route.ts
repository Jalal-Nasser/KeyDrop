import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Since we're using client-side cart with localStorage,
    // we'll return a success response and handle the actual clearing on the client side
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Clear cart error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to clear cart' },
      { status: 500 }
    );
  }
}
