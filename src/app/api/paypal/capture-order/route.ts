import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClientComponent } from '@/lib/supabase/server';
import { getPaypalClient } from '@/lib/paypal';
import paypal from '@paypal/checkout-server-sdk';
import { sendOrderConfirmation } from '@/lib/email-actions';
import { createAdminClient } from '@/lib/supabase/server';
import { notifyAdminNewOrder } from '@/lib/whatsapp';
import { TablesUpdate, Tables } from '@/types/supabase';

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClientComponent();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { orderID, items, totalAmount } = body; // orderID is PayPal's order ID

  if (!orderID) {
    return NextResponse.json({ error: 'PayPal Order ID is missing' }, { status: 400 });
  }

  try {
    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({} as any); // Empty body is fine for capture

    const capture = await getPaypalClient().execute(request);
    const captureData = capture.result;

    if (captureData.status === 'COMPLETED') {
      // Find the order in your DB using the PayPal order ID
      const { data: dbOrder, error: dbOrderError } = await supabase
        .from('orders')
        .select('id, user_id, total, order_items(product_name, products(image, name))')
        .eq('payment_id', orderID) // Match by PayPal's order ID
        .eq('user_id', user.id)
        .single() as { data: (Tables<'orders'> & { order_items: (Tables<'order_items'> & { products: Tables<'products'>[] | null })[] }) | null, error: any };

      if (dbOrderError || !dbOrder) {
        console.error("Error fetching DB order for capture:", dbOrderError);
        return NextResponse.json({ error: 'Order not found in database or not accessible.' }, { status: 404 });
      }

      // Update order status to completed
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'completed',
          payment_id: captureData.id, // Store PayPal capture ID
        } as TablesUpdate<'orders'>)
        .eq('id', dbOrder.id); // Update using your internal order ID

      if (updateError) {
        console.error('Failed to update order status after PayPal capture:', updateError);
        // Continue to send email as payment was successful, but log the DB error.
      }

      // Send order confirmation email
      await sendOrderConfirmation({ orderId: dbOrder.id, userEmail: user.email! });

      // Send Discord notification for new order
      const supabaseAdmin = await createAdminClient(); // Await the admin client
      
      const firstProductImage = dbOrder.order_items.find(item => item.products?.[0]?.image)?.products?.[0]?.image || null;
      const firstProductName = (dbOrder.order_items.find(item => item.product_name)?.product_name)
        || (dbOrder.order_items.find(item => item.products?.[0]?.name)?.products?.[0]?.name)
        || null;

      await supabaseAdmin.functions.invoke('discord-order-notification', {
        body: {
          notificationType: 'new_order',
          orderId: dbOrder.id,
          cartTotal: dbOrder.total,
          userEmail: user.email,
          productImage: firstProductImage
        }
      }).catch((err: any) => console.error("Discord notification for new order failed:", err)); // Typed err

      // WhatsApp admin notification
      let customerName: string | undefined;
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .maybeSingle();
        if (profile) {
          const fn = [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim();
          if (fn) customerName = fn;
        }
      } catch (_) { /* ignore */ }

      await notifyAdminNewOrder({
        orderId: dbOrder.id,
        total: dbOrder.total,
        userEmail: user.email,
        channel: 'paypal',
        customerName: customerName ?? ((user as any)?.user_metadata?.full_name as string | undefined) ?? user.email ?? undefined,
        productName: firstProductName || undefined,
        productImage: firstProductImage || undefined
      }).catch((err: any) => console.error('Admin WhatsApp notification failed:', err)); // Typed err

      return NextResponse.json({ success: true, orderId: dbOrder.id, status: captureData.status });
    } else {
      console.error('PayPal payment not completed:', captureData);
      return NextResponse.json({ error: 'Payment not completed by PayPal.', status: captureData.status }, { status: 400 });
    }
  } catch (error: any) {
    console.error('PayPal capture failed:', error);
    return NextResponse.json({ error: error.message || 'Failed to capture payment.' }, { status: 500 });
  }
}