import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { createOrderSchema } from '@/lib/schemas';
import { toCents, fromCents } from '@/lib/money';

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const validation = createOrderSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid request body', issues: validation.error.issues }, { status: 400 });
  }

  const { cartItems, promoCode } = validation.data;

  try {
    // 1. Fetch product data from DB (source of truth)
    const productIds = cartItems.map(item => item.id);
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id, name, sku, price, is_on_sale, sale_price')
      .in('id', productIds);

    if (productError) throw new Error(`Database error: ${productError.message}`);
    if (products.length !== productIds.length) {
      return NextResponse.json({ error: 'One or more products not found.' }, { status: 409 });
    }

    // 2. Calculate subtotal from DB prices
    let subtotal = 0;
    const orderItemsData = cartItems.map(cartItem => {
      const product = products.find(p => p.id === cartItem.id);
      if (!product) throw new Error('Mismatch in product validation'); // Should not happen
      
      const unitPrice = product.is_on_sale && product.sale_price ? product.sale_price : product.price;
      subtotal += toCents(unitPrice) * cartItem.quantity;

      return {
        product_id: product.id,
        product_name: product.name,
        sku: product.sku,
        unit_price: unitPrice,
        quantity: cartItem.quantity,
      };
    });

    // 3. Validate and apply promotion (if any)
    let discount = 0;
    let promoSnapshot = null;
    // (Promotion logic would be implemented here)

    // 4. Calculate final totals
    const tax = 0; // Placeholder for tax calculation
    const total = subtotal - discount + tax;

    const amounts = {
      subtotal: fromCents(subtotal),
      discount: fromCents(discount),
      tax: fromCents(tax),
      total: fromCents(total),
      currency: 'USD',
    };

    // 5. Create Order and OrderItems in DB
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: session.user.id,
        status: 'pending',
        total: amounts.total,
        amounts: amounts,
        promo_code: promoCode,
        promo_snapshot: promoSnapshot,
      })
      .select()
      .single();

    if (orderError) throw new Error(`Failed to create order: ${orderError.message}`);

    const itemsToInsert = orderItemsData.map(item => ({
      order_id: order.id,
      ...item,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert);
    if (itemsError) throw new Error(`Failed to save order items: ${itemsError.message}`);

    return NextResponse.json({ orderId: order.id, amounts });

  } catch (error: any) {
    console.error('Order creation failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}