import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { createOrderSchema } from '@/lib/schemas';
import { toCents, fromCents, cents, roundMoney } from '@/lib/money'; // Import roundMoney
import { resolveDiscount } from '@/lib/promo';

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // Ensure this route is always dynamic

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const validation = createOrderSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid request body', issues: validation.error.issues }, { status: 400 });
  }

  const { cartItems, promoCode } = validation.data;

  if (cartItems.length === 0) {
    return NextResponse.json({ error: 'Cart is empty.' }, { status: 400 });
  }

  try {
    // 1. Fetch product data from DB (source of truth)
    const productIds = cartItems.map(item => item.id);
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id, name, sku, price, is_on_sale, sale_price')
      .in('id', productIds);

    if (productError) {
      console.error("Error fetching products:", productError);
      throw new Error(`Database error fetching products: ${productError.message}`);
    }
    if (products.length !== productIds.length) {
      // Identify missing products
      const foundProductIds = new Set(products.map(p => p.id));
      const missingProductIds = productIds.filter(id => !foundProductIds.has(id));
      return NextResponse.json({ error: `One or more products not found: ${missingProductIds.join(', ')}` }, { status: 409 });
    }

    // 2. Calculate subtotal and prepare order items data (all in cents for calculation)
    let subtotalCents = cents(0);
    const orderItemsData = cartItems.map(cartItem => {
      const product = products.find(p => p.id === cartItem.id);
      if (!product) {
        // This case should ideally be caught by the products.length check above
        throw new Error(`Internal error: Product ${cartItem.id} not found after initial fetch.`);
      }
      
      const unitPriceDollars = product.is_on_sale && product.sale_price !== null && product.sale_price !== undefined
        ? product.sale_price
        : product.price;

      if (unitPriceDollars === null || unitPriceDollars === undefined || unitPriceDollars <= 0) {
        throw new Error(`Product ${product.id} (${product.name}) has no valid price.`);
      }

      const unitPriceCents = toCents(unitPriceDollars);
      const lineTotalCents = unitPriceCents * cartItem.quantity;
      subtotalCents += lineTotalCents;

      return {
        product_id: product.id,
        product_name: product.name,
        sku: product.sku,
        unit_price: roundMoney(unitPriceDollars), // Store in dollars for DB
        quantity: cartItem.quantity,
        price_at_purchase: roundMoney(unitPriceDollars), // Store in dollars for DB
        line_total: roundMoney(lineTotalCents / 100), // Store in dollars for DB
      };
    });

    // 3. Resolve discount
    const { discountCents, promoSnapshot } = await resolveDiscount(subtotalCents, orderItemsData.map(item => ({
      productId: item.product_id,
      quantity: item.quantity,
      unitPriceCents: toCents(item.unit_price), // Pass cents for promo calculation
    })), promoCode);

    // 4. Calculate final totals (in cents, then convert to dollars for storage)
    const taxCents = cents(0); // Placeholder for tax calculation
    const processFeesCents = Math.round(subtotalCents * 0.15); // 15% process fees
    const totalCents = subtotalCents - discountCents + taxCents + processFeesCents;

    const amounts = {
      subtotal: fromCents(subtotalCents),
      discount: fromCents(discountCents),
      tax: fromCents(taxCents),
      process_fees: fromCents(processFeesCents),
      total: fromCents(totalCents),
      currency: 'USD',
    };

    // 5. Create Order and OrderItems in DB
    // Use a transaction for atomicity
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        status: 'pending',
        total: roundMoney(totalCents / 100), // Store total in dollars
        amounts: amounts,
        promo_code: promoCode || null,
        promo_snapshot: promoSnapshot,
      })
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    const itemsToInsert = orderItemsData.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_purchase: item.price_at_purchase,
      product_name: item.product_name,
      sku: item.sku,
      unit_price: item.unit_price,
      line_total: item.line_total,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert);
    if (itemsError) {
      console.error("Error saving order items:", itemsError);
      throw new Error(`Failed to save order items: ${itemsError.message}`);
    }

    return NextResponse.json({ orderId: order.id, amounts });

  } catch (error: any) {
    console.error('Order creation failed:', error);
    // Return specific status codes for known errors
    if (error.message.includes('Product') && error.message.includes('price')) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    if (error.message.includes('promo code')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'An unexpected error occurred during order creation.' }, { status: 500 });
  }
}