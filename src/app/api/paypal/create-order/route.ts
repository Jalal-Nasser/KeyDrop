import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { paypalClient } from '@/lib/paypal';
import paypal from '@paypal/checkout-server-sdk';
import { createPayPalOrderSchema } from '@/lib/schemas';

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
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
      .select('total, amounts, order_items(product_name, sku, unit_price, quantity)')
      .eq('id', orderId)
      .eq('user_id', session.user.id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: (order.amounts as any).currency || 'USD',
          value: order.total.toString(),
          breakdown: {
            item_total: {
              currency_code: (order.amounts as any).currency || 'USD',
              value: (order.amounts as any).subtotal.toString(),
            }
          }
        },
        items: order.order_items.map((item: any) => ({
          name: item.product_name,
          sku: item.sku || item.product_id.toString(),
          quantity: item.quantity.toString(),
          unit_amount: {
            currency_code: (order.amounts as any).currency || 'USD',
            value: item.unit_price.toString(),
          },
        })),
      }],
      application_context: {
        shipping_preference: 'NO_SHIPPING',
      },
    });

    const payPalOrder = await paypalClient.execute(request);
    return NextResponse.json({ paypalOrderId: payPalOrder.result.id });

  } catch (error: any) {
    console.error('PayPal order creation failed:', error);
    return NextResponse.json({ error: 'Failed to create PayPal order' }, { status: 500 });
  }
}