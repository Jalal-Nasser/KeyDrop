import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server'; // Updated import
import { getPaypalClient } from '@/lib/paypal';
import paypal from '@paypal/checkout-server-sdk';
import { createPayPalOrderSchema } from '@/lib/schemas';
import { Tables, TablesUpdate } from '@/types/supabase'; // Import Tables and TablesUpdate

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const supabase = await createServerClient(); // Await the client
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const validation = createPayPalOrderSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { orderId } = validation.data;

  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('total, amounts, status, order_items(product_name, sku, unit_price, quantity, products(name))')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single() as { data: (Tables<'orders'> & { order_items: (Tables<'order_items'> & { products: Tables<'products'>[] | null })[] }) | null, error: any }; // Explicitly type order

    if (orderError || !order) {
      console.error("Error fetching order for PayPal creation:", orderError);
      return NextResponse.json({ error: 'Order not found or not accessible.' }, { status: 404 });
    }

    if (order.status !== 'pending') {
      return NextResponse.json({ error: `Order status is "${order.status}", cannot create PayPal order.` }, { status: 409 });
    }

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: (order.amounts as any)?.currency || 'USD',
          value: order.total.toFixed(2), // Use the trusted total from DB
          breakdown: {
            item_total: {
              currency_code: (order.amounts as any)?.currency || 'USD',
              value: (order.amounts as any)?.subtotal || order.total.toFixed(2), // Use subtotal from amounts, fallback to total
            },
            discount: {
              currency_code: (order.amounts as any)?.currency || 'USD',
              value: (order.amounts as any)?.discount || '0.00', // Use discount from amounts
            },
            tax_total: {
              currency_code: (order.amounts as any)?.currency || 'USD',
              value: (order.amounts as any)?.tax || '0.00', // Use tax from amounts
            },
            handling: {
              currency_code: (order.amounts as any)?.currency || 'USD',
              value: (order.amounts as any)?.process_fees || '0.00', // Use process fees from amounts
            },
          }
        },
        items: order.order_items.map((item: any) => ({
          name: item.product_name || (item.products?.[0]?.name ?? 'Unknown Product'),
          sku: item.sku || undefined,
          quantity: item.quantity.toString(),
          unit_amount: {
            currency_code: (order.amounts as any)?.currency || 'USD',
            value: item.unit_price.toFixed(2), // Use unit_price from DB
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
      .update({ payment_id: payPalOrder.result.id } as TablesUpdate<'orders'>) // Cast to TablesUpdate<'orders'>
      .eq('id', orderId);

    if (updateError) {
      console.error("Error updating order with PayPal ID:", updateError);
      // Don't throw, as PayPal order was created successfully. Log and continue.
    }

    return NextResponse.json({ paypalOrderId: payPalOrder.result.id });

  } catch (error: any) {
    console.error('PayPal order creation failed:', error);
    return NextResponse.json({ error: error.message || 'Failed to create PayPal order' }, { status: 500 });
  }
}