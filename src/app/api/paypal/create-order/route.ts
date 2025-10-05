import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClientComponent } from '@/lib/supabase/server';
import { getPaypalClient } from '@/lib/paypal';
import paypal from '@paypal/checkout-server-sdk';
import { TablesInsert } from '@/types/supabase';

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClientComponent();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { items, totalAmount } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items provided for PayPal order' }, { status: 400 });
    }
    if (typeof totalAmount !== 'string' || parseFloat(totalAmount) <= 0) {
      return NextResponse.json({ error: 'Invalid total amount for PayPal order' }, { status: 400 });
    }

    // Create a pending order in your database first
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        total: parseFloat(totalAmount),
        status: "pending",
        payment_gateway: "paypal",
        payment_id: null, // Will be updated with PayPal's order ID later
      } as TablesInsert<'orders'>)
      .select()
      .single();

    if (orderError) {
      console.error("Error creating pending order in DB:", orderError);
      throw new Error(`Failed to create pending order: ${orderError.message}`);
    }

    const orderId = orderData.id;

    // Insert order items
    const orderItemsToInsert = items.map((item: any) => ({
      order_id: orderId,
      product_id: item.id, // Assuming item.id is the product_id
      quantity: item.quantity,
      price_at_purchase: item.price,
      product_name: item.name,
      unit_price: item.price,
      line_total: item.price * item.quantity,
      sku: item.sku || null,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItemsToInsert);

    if (itemsError) {
      console.error("Error inserting order items:", itemsError);
      throw new Error(`Failed to insert order items: ${itemsError.message}`);
    }

    // Now create PayPal order
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: parseFloat(totalAmount).toFixed(2),
        },
        items: items.map((item: any) => ({
          name: item.name,
          quantity: item.quantity.toString(),
          unit_amount: {
            currency_code: 'USD',
            value: item.price.toFixed(2),
          },
        })),
      }],
      application_context: {
        shipping_preference: 'NO_SHIPPING',
      },
    });

    const payPalOrder = await getPaypalClient().execute(request);
    
    // Update the pending order with PayPal's order ID
    const { error: updateError } = await supabase
      .from('orders')
      .update({ payment_id: payPalOrder.result.id })
      .eq('id', orderId);

    if (updateError) {
      console.error("Error updating order with PayPal ID:", updateError);
      // Don't throw, as PayPal order was created successfully. Log and continue.
    }

    return NextResponse.json({ paypalOrderId: payPalOrder.result.id, orderId: orderId });

  } catch (error: any) {
    console.error('PayPal order creation failed:', error);
    return NextResponse.json({ error: error.message || 'Failed to create PayPal order' }, { status: 500 });
  }
}