import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { getPaypalClient } from '@/lib/paypal';
import paypal from '@paypal/checkout-server-sdk';
import { capturePayPalOrderSchema } from '@/lib/schemas';
import { sendOrderConfirmation } from '@/lib/email-actions';
import { createClient } from '@supabase/supabase-js'; // Import for admin client

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const validation = capturePayPalOrderSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { orderId, paypalOrderId } = validation.data;

  try {
    // Verify the order exists and belongs to the user
    const { data: order, error: orderFetchError } = await supabase
      .from('orders')
      .select('id, user_id, total, order_items(products(image))') // Fetch product image for Discord notification
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single();

    if (orderFetchError || !order) {
      console.error("Error fetching order for capture:", orderFetchError);
      return NextResponse.json({ error: 'Order not found or not accessible.' }, { status: 404 });
    }

    const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
    request.requestBody({} as any);

  const capture = await getPaypalClient().execute(request);
    const captureData = capture.result;

    if (captureData.status === 'COMPLETED') {
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'completed',
          payment_id: captureData.id, // Store PayPal capture ID
          // Consider storing more raw captureData if needed for auditing
        })
        .eq('id', orderId);

      if (updateError) {
        console.error('Failed to update order status after PayPal capture:', updateError);
        // Continue to send email as payment was successful, but log the DB error.
      }

      // Send confirmation email
      await sendOrderConfirmation({ orderId, userEmail: user.email! });

      // Send Discord notification for new order
      const supabaseAdmin = createClient(
        (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL)!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      
      // Determine the product image for the notification (use first available)
      const firstProductImage = order.order_items.find(item => item.products?.[0]?.image)?.products?.[0]?.image || null;

      await supabaseAdmin.functions.invoke('discord-order-notification', {
        body: {
          notificationType: 'new_order',
          orderId: orderId,
          cartTotal: order.total,
          userEmail: user.email,
          productImage: firstProductImage // Pass the image
        }
      }).catch(err => console.error("Discord notification for new order failed:", err));


      return NextResponse.json({ success: true, orderId });
    } else {
      console.error('PayPal payment not completed:', captureData);
      return NextResponse.json({ error: 'Payment not completed by PayPal.' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('PayPal capture failed:', error);
    return NextResponse.json({ error: error.message || 'Failed to capture payment.' }, { status: 500 });
  }
}