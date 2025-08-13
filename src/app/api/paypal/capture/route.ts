import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { paypalClient } from '@/lib/paypal';
import paypal from '@paypal/checkout-server-sdk';
import { capturePayPalOrderSchema } from '@/lib/schemas';
import { sendOrderConfirmation } from '@/lib/email-actions';

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const validation = capturePayPalOrderSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { orderId, paypalOrderId } = validation.data;

  try {
    const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
    request.requestBody({} as any);

    const capture = await paypalClient.execute(request);
    const captureData = capture.result;

    if (captureData.status === 'COMPLETED') {
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'completed', // Or 'paid'
          payment_id: captureData.id,
          // payment: captureData, // Store raw capture data
        })
        .eq('id', orderId)
        .eq('user_id', session.user.id);

      if (updateError) {
        console.error('Failed to update order status:', updateError);
        // Continue to send email as payment was successful
      }

      // Send confirmation email
      await sendOrderConfirmation({ orderId, userEmail: session.user.email! });

      return NextResponse.json({ success: true, orderId });
    } else {
      return NextResponse.json({ error: 'Payment not completed by PayPal.' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('PayPal capture failed:', error);
    return NextResponse.json({ error: 'Failed to capture payment.' }, { status: 500 });
  }
}