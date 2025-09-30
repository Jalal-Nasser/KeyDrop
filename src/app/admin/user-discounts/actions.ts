'use server'

import { createClient } from '@/lib/supabase/actions'
import { revalidatePath } from 'next/cache'

export async function applyUserDiscount(formData: FormData) {
  const userId = formData.get('userId')
  const discountType = formData.get('discountType')
  const discountValue = formData.get('discountValue')
  const expiresAt = formData.get('expiresAt')
  const isActive = formData.get('isActive') === 'on'

  if (!userId || !discountType || !discountValue) {
    return { error: 'Missing required fields' }
  }

  const value = Number(discountValue)
  if (isNaN(value) || value <= 0) {
    return { error: 'Invalid discount value' }
  }

  // For percentage discounts, ensure the value is between 0 and 100
  if (discountType === 'percentage' && (value < 0 || value > 100)) {
    return { error: 'Percentage discount must be between 0 and 100' }
  }

  const supabase = await createClient() // Await the client
  
  const { data, error } = await supabase
    .from('coupons') // Assuming 'user_discounts' is now 'coupons'
    .upsert(
      {
        assigned_user_id: userId as string, // Assuming userId is a string
        discount_percent: value, // Assuming discount_value maps to discount_percent
        is_active: isActive,
        expires_at: expiresAt || null, // coupons table doesn't have expires_at, this will be ignored
        // updated_at: new Date().toISOString() // coupons table doesn't have updated_at
      },
      { onConflict: 'assigned_user_id' } // Assuming unique constraint on assigned_user_id
    )
    .select()

  if (error) {
    console.error('Error applying user discount:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/user-discounts')
  return { success: true, data }
}

export async function removeUserDiscount(userId: string) {
  const supabase = await createClient() // Await the client
  
  const { error } = await supabase
    .from('coupons') // Assuming 'user_discounts' is now 'coupons'
    .delete()
    .eq('assigned_user_id', userId) // Assuming assigned_user_id is the key

  if (error) {
    console.error('Error removing user discount:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/user-discounts')
  return { success: true }
}