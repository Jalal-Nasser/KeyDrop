import { createClient } from '@supabase/supabase-js';
import { toCents, cents, fromCents } from './money';
import { Database } from '@/types/supabase';

interface Promotion {
  id: string;
  code: string;
  type: 'percent' | 'fixed'; // Changed to literal types
  value: number; // Stored as numeric (dollars) in DB, but used as percentage or fixed dollar value
  applies_to: 'all' | 'product_ids' | null;
  product_ids: number[] | null;
  min_subtotal: number | null; // In dollars
  start_at: string | null;
  end_at: string | null;
  usage_limit: number | null;
  per_user_limit: number | null;
  is_active: boolean | null;
}

interface CartItemForPromo {
  productId: number;
  quantity: number;
  unitPriceCents: number;
}

// Helper to get Supabase client for server-side promo fetching
const getSupabaseAdminClient = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase URL or Service Role Key is not set for promo resolution.');
  }
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
};

/**
 * Resolves the discount for a given promo code and cart items.
 * All calculations are done in cents.
 * @param subtotalCents - The total subtotal of the cart items in cents.
 * @param cartItems - Array of cart items with product details needed for product-specific promos.
 * @param promoCode - The promo code string.
 * @returns The calculated discount in cents (>=0, <=subtotalCents).
 * @throws Error if the promo code is invalid, expired, or not applicable.
 */
export async function resolveDiscount(
  subtotalCents: number,
  cartItems: CartItemForPromo[],
  promoCode?: string | null
): Promise<{ discountCents: number; promoSnapshot: Promotion | null }> {
  if (!promoCode) {
    return { discountCents: cents(0), promoSnapshot: null };
  }

  const supabaseAdmin = getSupabaseAdminClient();

  const { data: promotion, error } = await supabaseAdmin
    .from('promotions')
    .select('*')
    .eq('code', promoCode)
    .eq('is_active', true)
    .single();

  if (error || !promotion) {
    console.warn(`Promotion "${promoCode}" not found or inactive:`, error?.message);
    throw new Error('Invalid or inactive promo code.');
  }

  // Type assertion to match the Promotion interface's 'type' field
  const typedPromotion: Promotion = {
    ...promotion,
    type: promotion.type as 'percent' | 'fixed',
  };

  // Validate time window
  const now = new Date();
  if (typedPromotion.start_at && new Date(typedPromotion.start_at) > now) {
    throw new Error('Promo code is not yet active.');
  }
  if (typedPromotion.end_at && new Date(typedPromotion.end_at) < now) {
    throw new Error('Promo code has expired.');
  }

  // Validate minimum subtotal
  if (typedPromotion.min_subtotal !== null && toCents(typedPromotion.min_subtotal) > subtotalCents) {
    throw new Error(`Minimum subtotal of $${typedPromotion.min_subtotal.toFixed(2)} required for this promo.`);
  }

  // Validate product applicability
  if (typedPromotion.applies_to === 'product_ids' && typedPromotion.product_ids && typedPromotion.product_ids.length > 0) {
    const applicableProductIds = new Set(typedPromotion.product_ids);
    const hasApplicableItems = cartItems.some(item => applicableProductIds.has(item.productId));
    if (!hasApplicableItems) {
      throw new Error('This promo code is not applicable to any items in your cart.');
    }
    // If applies_to is product_ids, discount only applies to those products' subtotal
    const applicableSubtotalCents = cartItems
      .filter(item => applicableProductIds.has(item.productId))
      .reduce((sum, item) => sum + item.unitPriceCents * item.quantity, cents(0));
    subtotalCents = applicableSubtotalCents; // Discount is calculated on this reduced subtotal
  }

  let discountCents = cents(0);
  if (typedPromotion.type === 'percent') {
    // typedPromotion.value is a percentage (e.g., 10 for 10%)
    discountCents = Math.round(subtotalCents * (typedPromotion.value / 100));
  } else if (typedPromotion.type === 'fixed') {
    // typedPromotion.value is a fixed dollar amount
    discountCents = toCents(typedPromotion.value);
  }

  // Ensure discount does not exceed subtotal
  discountCents = Math.min(discountCents, subtotalCents);

  // Ensure discount is not negative
  discountCents = Math.max(discountCents, cents(0));

  // TODO: Implement usage_limit and per_user_limit checks (requires tracking usage in DB)
  // For now, we'll assume these are handled externally or not strictly enforced.

  return { discountCents, promoSnapshot: typedPromotion };
}