'use server'

import { createSupabaseServerClientComponent } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { TablesInsert, TablesUpdate } from '@/types/supabase' // Import TablesInsert and TablesUpdate
import { v4 as uuidv4 } from 'uuid'; // Import uuid for generating codes

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

  const supabase = await createSupabaseServerClientComponent()
  
  // Generate a unique code for user-specific discounts if not already present
  // This is a simplified approach; in a real app, you might check for existing codes
  const generatedCode = `USER-${uuidv4().substring(0, 8).toUpperCase()}`;

  const upsertData: TablesInsert<'coupons'> = {
    assigned_user_id: userId as string,
    discount_percent: value,
    is_applied: isActive,
    code: generatedCode, // Provide a code for the upsert
    // expires_at is not in the coupons table, so it's omitted
  };

  const { data, error } = await supabase
    .from('coupons')
    .upsert(upsertData, { onConflict: 'assigned_user_id' })
    .select()

  if (error) {
    console.error('Error applying user discount:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/user-discounts')
  return { success: true, data }
}

export async function removeUserDiscount(userId: string) {
  const supabase = await createSupabaseServerClientComponent()
  
  const { error } = await supabase
    .from('coupons')
    .delete()
    .eq('assigned_user_id', userId)

  if (error) {
    console.error('Error removing user discount:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/user-discounts')
  return { success: true }
}