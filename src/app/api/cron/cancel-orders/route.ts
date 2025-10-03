import { cancelExpiredOrders } from '@/app/actions/order-actions';
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClientComponent } from '@/lib/supabase/server'; // Updated import

export async function GET(request: NextRequest) {
  try {
    // Verify the request is coming from the cron job
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const result = await cancelExpiredOrders();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in cancel-orders cron job:', error);
    return NextResponse.json(
      { error: 'Failed to process expired orders' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';