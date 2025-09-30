'use server'

import { createClient } from '@/lib/supabase/actions'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { toast } from 'sonner' // Import toast for client-side feedback

export async function generateCouponCode(formData: FormData) {
  const discount = formData.get('discount')
  const userId = formData.get('userId')
  
  if (!discount) {
    // Use toast for client-side error feedback
    // This won't directly show up on the client from a server action,
    // but it's good practice for potential future client-side calls or logging.
    console.error('Discount is required');
    return; // Return void
  }

  const discountPercent = Number(discount)
  if (isNaN(discountPercent) || discountPercent < 1 || discountPercent > 100) {
    console.error('Discount must be between 1 and 100');
    return; // Return void
  }

  const supabase = await createClient() // Await the client
  
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
    // You might want to add a client-side toast here if this action is called from a client component
    return; // Return void
  }

  revalidatePath('/admin/coupons')
  // For successful generation, you might want to redirect or show a success message
  // Since this is a server action, direct toast.success won't work on the client.
  // You'd typically handle success feedback on the client component that calls this action.
  // For now, we'll just log and revalidate.
  console.log(`Coupon code ${code} generated successfully!`);
  return; // Return void
}

function generateRandomCode(length: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Removed similar looking characters
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}