import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClientComponent } from '@/lib/supabase/server';
import { getPaypalClient } from '@/lib/paypal';
import paypal from '@paypal/checkout-server-sdk';
import { Tables, TablesInsert } from '@/types/supabase';
import { createAdminClient } from '@/lib/supabase/server';

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClientComponent();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { cartItems, cartTotal, targetUserId } = body;

    // Validate required fields
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
    }

    if (typeof cartTotal !== 'number' || cartTotal <= 0) {
      return NextResponse.json({ error: 'Invalid cart total' }, { status: 400 });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json({ error: 'Failed to verify user profile' }, { status: 500 });
    }

    const isAdmin = profile?.is_admin || false;
    const dbClient = isAdmin ? await createAdminClient() : supabase;

    // Recalculate totals from DB to ensure sale pricing and integrity
    const productIds = cartItems.map((i: any) => i.id);
    const { data: products, error: productsError } = await dbClient
      .from('products')
      .select('id, name, price, is_on_sale, sale_price, image')
      .in('id', productIds);

    if (productsError) throw productsError;
    if (!products || products.length !== productIds.length) {
      throw new Error('One or more products not found while recalculating order.');
    }

    // Compute subtotal using sale pricing when applicable
    let recalculatedSubtotal = 0;
    const orderItemsToInsert = cartItems.map((item: any) => {
      const product = products.find((p: any) => p.id === item.id)!;
      const unitPrice = product.is_on_sale && product.sale_price != null ? product.sale_price : product.price;
      const lineTotal = unitPrice * item.quantity;
      recalculatedSubtotal += lineTotal;
      return {
        order_id: undefined as unknown as string, // filled after order insert
        product_id: item.id,
        quantity: item.quantity,
        price_at_purchase: unitPrice,
        product_name: product.name,
        sku: undefined as unknown as string | undefined,
        unit_price: unitPrice,
        line_total: lineTotal,
      };
    });

    // Process fees (15%)
    const processingFee = recalculatedSubtotal * 0.15;
    const finalTotal = recalculatedSubtotal + processingFee;

    // Create the order for the target user with 'pending' status
    const { data: orderData, error: orderError } = await dbClient
      .from("orders")
      .insert({
        user_id: targetUserId || user.id,
        total: finalTotal,
        status: "pending",
        payment_gateway: "paypal",
        payment_id: `paypal_${new Date().getTime()}`,
      } as TablesInsert<'orders'>)
      .select()
      .single();

    if (orderError) {
      console.error("Insert order error:", orderError);
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    // Insert order items
    const orderItemsWithOrderId = orderItemsToInsert.map(item => ({
      ...item,
      order_id: orderData.id,
    }));

    const { error: itemsError } = await dbClient
      .from("order_items")
      .insert(orderItemsWithOrderId);

    if (itemsError) {
      console.error("Insert order items error:", itemsError);
      throw new Error(`Failed to create order items: ${itemsError.message}`);
    }

    // Now create PayPal order
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: finalTotal.toFixed(2),
          breakdown: {
            item_total: {
              currency_code: 'USD',
              value: recalculatedSubtotal.toFixed(2),
            },
            handling: {
              currency_code: 'USD',
              value: processingFee.toFixed(2),
            },
          }
        },
        items: orderItemsToInsert.map((item: any) => ({
          name: item.product_name,
          quantity: item.quantity.toString(),
          unit_amount: {
            currency_code: 'USD',
            value: item.unit_price.toFixed(2),
          },
        })),
      }],
      application_context: {
        shipping_preference: 'NO_SHIPPING',
      },
    });

    const payPalOrder = await getPaypalClient().execute(request);
    
    // Store the PayPal Order ID in our database
    const { error: updateError } = await supabase
      .from('orders')
      .update({ payment_id: payPalOrder.result.id })
      .eq('id', orderData.id);

    if (updateError) {
      console.error("Error updating order with PayPal ID:", updateError);
      // Don't throw, as PayPal order was created successfully. Log and continue.
    }

    return NextResponse.json({ 
      paypalOrderId: payPalOrder.result.id,
      orderId: orderData.id 
    });

  } catch (error: any) {
    console.error('PayPal order creation failed:', error);
    return NextResponse.json({ error: error.message || 'Failed to create PayPal order' }, { status: 500 });
  }
}


