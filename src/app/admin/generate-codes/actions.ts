'use server'

import { createSupabaseServerClientComponent } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { toast } from 'sonner' // Import toast for client-side feedback
import { TablesInsert } from '@/types/supabase' // Import TablesInsert

export async function generateCouponCode(formData: FormData) {
  const discount = formData.get('discount')
  const userId = formData.get('userId')
  
  if (!discount) {
    console.error('Discount is required');
    return;
  }

  const discountPercent = Number(discount)
  if (isNaN(discountPercent) || discountPercent < 1 || discountPercent > 100) {
    console.error('Discount must be between 1 and 100');
    return;
  }

  const supabase = await createSupabaseServerClientComponent()
  
  // Generate a random coupon code
  const code = generateRandomCode(8)
  
  const couponToInsert: TablesInsert<'coupons'> = {
    code,
    discount_percent: discountPercent,
    assigned_user_id: (userId as string) || null, // Ensure userId is string or null
    is_applied: false
  };

  const { data, error } = await supabase
    .from('coupons')
    .insert([couponToInsert])
    .select()

  if (error) {
    console.error('Error generating coupon:', error)
    return;
  }

  revalidatePath('/admin/coupons')
  console.log(`Coupon code ${code} generated successfully!`);
  return;
}

function generateRandomCode(length: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}