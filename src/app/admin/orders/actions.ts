'use server'

import { createSupabaseServerClient } from "@/lib/supabaseServer"
import { revalidatePath } from "next/cache"
import { sendOrderCancellation } from "@/lib/email-actions" // Import the new function

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = createSupabaseServerClient()

  try {
    // First, get the current order details to retrieve the user's email
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select(`user_id`)
      .eq('id', orderId)
      .single()

    if (fetchError || !order) {
      throw new Error(`Failed to fetch order for status update: ${fetchError?.message}`)
    }

    // Get the user's email from their profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id') // We only need the ID to get the email from auth.users
      .eq('id', order.user_id)
      .single()

    if (profileError || !profile) {
      throw new Error(`Failed to fetch profile for user ${order.user_id}: ${profileError?.message}`)
    }

    // Get the user's email from auth.users table
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(order.user_id)

    if (userError || !user || !user.email) {
      throw new Error(`Failed to fetch user email for user ${order.user_id}: ${userError?.message}`)
    }

    // Update the order status
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)

    if (updateError) {
      throw new Error(updateError.message)
    }

    // If the status is 'cancelled', send the cancellation email
    if (status === 'cancelled') {
      const { success, message } = await sendOrderCancellation({ orderId, userEmail: user.email });
      if (!success) {
        console.error(`Failed to send cancellation email: ${message}`);
        // Optionally, you might want to throw an error here or handle it differently
        // depending on whether email sending failure should block the status update.
        // For now, we'll just log it and let the status update succeed.
      }
    }

    revalidatePath('/admin/orders')
    revalidatePath(`/account/orders/${orderId}`)
    revalidatePath(`/account/orders/${orderId}/invoice`)

    return { success: true, message: 'Order status updated successfully.' }
  } catch (error: any) {
    return { 
      success: false, 
      message: `Failed to update order status: ${error.message}` 
    }
  }
}