'use server'

import { createServerClient } from '@/lib/supabase/server' // Import the correct server client
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

  const supabase = await createServerClient() // Await the client
  
  const { data, error } = await supabase
    .from('user_discounts')
    .upsert(
      {
        user_id: userId as string, // Cast userId to string
        discount_type: discountType as string, // Cast discountType to string
        discount_value: value,
        is_active: isActive,
        expires_at: expiresAt || null,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'user_id' }
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
  const supabase = await createServerClient() // Await the client
  
  const { error } = await supabase
    .from('user_discounts')
    .delete()
    .eq('user_id', userId)

  if (error) {
    console.error('Error removing user discount:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/user-discounts')
  return { success: true }
}