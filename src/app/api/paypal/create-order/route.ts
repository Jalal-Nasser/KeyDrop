import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClientComponent } from '@/lib/supabase/server'; // Corrected import for Supabase server client
import { getPaypalClient } from '@/lib/paypal'; // Corrected import for PayPal client
import paypal from '@paypal/checkout-server-sdk';
import { TablesInsert } from '@/types/supabase'; // Import TablesInsert for type safety

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClientComponent();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { items, totalAmount } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0 || typeof totalAmount !== 'number' || totalAmount <= 0) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    // Calculate item_total for PayPal breakdown and prepare order items for DB
    let item_total_value = 0;
    const orderItemsToInsert = items.map((item: any) => {
      const itemPrice = parseFloat(item.price.toFixed(2));
      const lineTotal = itemPrice * item.quantity;
      item_total_value += lineTotal;
      return {
        // Don't use product_id for now to avoid foreign key constraint
        product_name: item.name,
        quantity: item.quantity,
        price_at_purchase: itemPrice,
        unit_price: itemPrice,
        line_total: lineTotal,
        sku: item.sku || `KASPERSKY-${item.id}`, // Generate SKU for Kaspersky products
      };
    });

    // Create an order in your Supabase database
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        total: totalAmount, // Use the totalAmount passed from client
        status: 'pending',
        payment_gateway: 'paypal',
        // payment_id will be updated after PayPal order creation
      } as TablesInsert<'orders'>) // Cast to TablesInsert for type safety
      .select()
      .single();

    if (orderError || !orderData) {
      console.error('Supabase order creation failed:', orderError);
      return NextResponse.json({ error: `Failed to create order in database: ${orderError?.message}` }, { status: 500 });
    }

    // Link order items to the newly created order
    const orderItemsWithOrderId = orderItemsToInsert.map(item => ({
      ...item,
      order_id: orderData.id,
    }));

    // Ensure referenced products exist in the products table.
    // For items with SKU, upsert a minimal product record so we have a valid product_id to reference.
    try {
      const uniqueSkus = Array.from(new Set(orderItemsWithOrderId.map(i => i.sku).filter(Boolean)));

      if (uniqueSkus.length > 0) {
        const productsToUpsert = uniqueSkus.map(sku => {
          const matchingItem = orderItemsWithOrderId.find(it => it.sku === sku);
          return {
            sku,
            name: matchingItem?.product_name || `Product ${sku}`,
            price: matchingItem ? matchingItem.unit_price : 0,
            description: matchingItem?.product_name || null,
            category: 'Uncategorized',
            is_digital: true,
            image: null,
          };
        });

        // Upsert by SKU so we get an ID for each SKU (will insert if missing, update otherwise)
        const { data: upsertedProducts, error: upsertError } = await supabase
          .from('products')
          .upsert(productsToUpsert, { onConflict: 'sku' })
          .select('id,sku');

        if (upsertError) {
          console.error('Failed to upsert products for order items:', upsertError);
          // Not fatal — we'll try to insert order_items but may fallback to null product_id
        }

        // Create a map sku -> id
        const skuToId: Record<string, number> = {};
        (upsertedProducts || []).forEach((p: any) => {
          if (p?.sku && p?.id) skuToId[p.sku] = p.id;
        });

        // Prepare final payload for order_items insert using found product IDs when available
        const payloadForInsert = orderItemsWithOrderId.map(item => ({
          order_id: item.order_id,
          product_id: skuToId[item.sku] ?? null,
          product_name: item.product_name,
          quantity: item.quantity,
          price_at_purchase: item.price_at_purchase,
          unit_price: item.unit_price,
          line_total: item.line_total,
          sku: item.sku,
        }));

        const { error: orderItemsError } = await supabase
          .from('order_items')
          .insert(payloadForInsert as any);

        if (orderItemsError) {
          console.error('Supabase order items creation failed:', orderItemsError);
          // If order items fail, roll back the main order
          await supabase.from('orders').delete().eq('id', orderData.id);
          return NextResponse.json({ error: `Failed to create order items in database: ${orderItemsError.message}` }, { status: 500 });
        }
      } else {
        // No SKUs — insert order items without product references
        const { error: orderItemsError } = await supabase
          .from('order_items')
          .insert(orderItemsWithOrderId.map(item => ({
            order_id: item.order_id,
            product_name: item.product_name,
            quantity: item.quantity,
            price_at_purchase: item.price_at_purchase,
            unit_price: item.unit_price,
            line_total: item.line_total,
            sku: item.sku,
          })) as any);

        if (orderItemsError) {
          console.error('Supabase order items creation failed:', orderItemsError);
          await supabase.from('orders').delete().eq('id', orderData.id);
          return NextResponse.json({ error: `Failed to create order items in database: ${orderItemsError.message}` }, { status: 500 });
        }
      }
    } catch (err) {
      console.error('Unexpected error while preparing order items:', err);
      await supabase.from('orders').delete().eq('id', orderData.id);
      return NextResponse.json({ error: 'Failed to prepare order items' }, { status: 500 });
    }

    // Create a PayPal order
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: orderData.id.toString(), // Use your internal order ID as reference
          amount: {
            currency_code: 'USD',
            value: totalAmount.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: 'USD',
                value: item_total_value.toFixed(2),
              },
            },
          },
          items: orderItemsToInsert.map(item => ({
            name: item.product_name || 'Unknown Product',
            unit_amount: {
              currency_code: 'USD',
              value: item.unit_price.toFixed(2),
            },
            quantity: item.quantity.toString(),
          })),
          description: `Order #${orderData.id} - ${items.length} item(s)`,
        },
      ],
      application_context: {
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/account/orders/${orderData.id}/invoice`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/kaspersky`,
        brand_name: 'Dropskey',
        locale: 'en-US',
        landing_page: 'BILLING',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
      },
    });

    const paypalResponse = await getPaypalClient().execute(request);

    if (paypalResponse.statusCode !== 201) {
      console.error('PayPal order creation failed:', paypalResponse.result);
      // If PayPal order creation fails, delete the order from your DB
      await supabase.from('orders').delete().eq('id', orderData.id);
      return NextResponse.json({ error: 'Failed to create PayPal order' }, { status: 500 });
    }

    // Update the Supabase order with the PayPal Order ID
    const { error: updatePaymentIdError } = await supabase
      .from('orders')
      .update({ payment_id: paypalResponse.result.id })
      .eq('id', orderData.id);

    if (updatePaymentIdError) {
      console.error('Failed to update Supabase order with PayPal ID:', updatePaymentIdError);
      // Log the error but don't fail the entire process as PayPal order is created
    }

    return NextResponse.json({
      orderId: orderData.id, // Your internal DB order ID
      paypalOrderId: paypalResponse.result.id, // PayPal's order ID
    });

  } catch (error: any) {
    console.error('Error in create-order API:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}