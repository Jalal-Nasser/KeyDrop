import { NextRequest, NextResponse } from 'next/server';
export const runtime = "edge";
export const dynamic = 'force-dynamic';
import { createSupabaseServerClientComponent } from '@/lib/supabase/server';
import { callPaypalApi } from '@/lib/paypal';
import { capturePayPalOrderSchema } from '@/lib/schemas';
import { sendOrderConfirmation } from '@/lib/email-actions';
import { createClient } from '@supabase/supabase-js';
import { notifyAdminNewOrder } from '@/lib/whatsapp';
import { TablesUpdate, Tables } from '@/types/supabase';

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClientComponent();
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
      .select('id, user_id, total, order_items(product_name, products(image, name))') // Fetch product info for notifications
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single() as { data: (Tables<'orders'> & { order_items: (Tables<'order_items'> & { products: Tables<'products'>[] | null })[] }) | null, error: any }; // Explicitly type order

    if (orderFetchError || !order) {
      console.error("Error fetching order for capture:", orderFetchError);
      return NextResponse.json({ error: 'Order not found or not accessible.' }, { status: 404 });
    }

    const captureData = await callPaypalApi(`/v2/checkout/orders/${paypalOrderId}/capture`, {
      method: 'POST',
      body: JSON.stringify({}),
    });

    if (captureData.status === 'COMPLETED') {
      // Mark payment captured and set order status to completed
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'completed',
          payment_id: captureData.id, // Store PayPal capture ID
        } as TablesUpdate<'orders'>) // Cast to TablesUpdate<'orders'>
        .eq('id', orderId);

      if (updateError) {
        console.error('Failed to update order status after PayPal capture:', updateError);
        // Continue to send email as payment was successful, but log the DB error.
      }

      // Optional: send order confirmation (receipt). This does NOT deliver product keys.
      await sendOrderConfirmation({ orderId, userEmail: user.email! });

      // Send Discord notification for new order
      const supabaseAdmin = createClient(
        (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL)!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Determine the product image/name for the notification (use first available)
      const firstProductImage = order.order_items.find(item => item.products?.[0]?.image)?.products?.[0]?.image || null;
      const firstProductName = (order.order_items.find(item => item.product_name)?.product_name)
        || (order.order_items.find(item => item.products?.[0]?.name)?.products?.[0]?.name)
        || null;

      await supabaseAdmin.functions.invoke('discord-order-notification', {
        body: {
          notificationType: 'new_order',
          orderId: orderId,
          cartTotal: order.total,
          userEmail: user.email,
          productImage: firstProductImage // Pass the image
        }
      }).catch(err => console.error("Discord notification for new order failed:", err));

      // WhatsApp admin notification (best-effort; won't block response)
      // Try to obtain a friendly customer name from profiles; fallback to user metadata or email
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

      notifyAdminNewOrder({
        orderId: orderId,
        total: order.total,
        userEmail: user.email,
        channel: 'paypal',
        customerName: customerName ?? ((user as any)?.user_metadata?.full_name as string | undefined) ?? user.email ?? undefined,
        productName: firstProductName || undefined,
        productImage: firstProductImage || undefined
      }).catch(err => console.error('Admin WhatsApp notification failed:', err));


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