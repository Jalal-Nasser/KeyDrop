'use server'

import { createClient } from '@/lib/supabase/actions'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function generateCouponCode(formData: FormData) {
  const discount = formData.get('discount')
  const userId = formData.get('userId')
  
  if (!discount) {
    return { error: 'Discount is required' }
  }

  const discountPercent = Number(discount)
  if (isNaN(discountPercent) || discountPercent < 1 || discountPercent > 100) {
    return { error: 'Discount must be between 1 and 100' }
  }

  const supabase = createClient()
  
  // Generate a random coupon code
  const code = generateRandomCode(8)
  
  const { data, error } = await supabase
    .from('coupons')
    .insert([
      { 
        code,
        discount_percent: discountPercent,
        assigned_user_id: userId || null,
        is_applied: false
      },
    ])
    .select()

  if (error) {
    console.error('Error generating coupon:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/coupons')
  return { success: true, code }
}

function generateRandomCode(length: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Removed similar looking characters
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
