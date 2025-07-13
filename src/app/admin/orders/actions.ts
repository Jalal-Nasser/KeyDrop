'use server'

import { createSupabaseServerClient } from "@/lib/supabaseServer"
import { revalidatePath } from "next/cache"
import { sendOrderCancellation, sendOrderConfirmation } from "@/lib/email-actions" // Import sendOrderConfirmation
import { createClient } from '@supabase/supabase-js' // Import createClient for service role

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
    // Use a service role client for admin operations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(order.user_id)

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

export async function reSendInvoice(orderId: string) {
  // Use a service role client for admin operations
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // Fetch the user_id associated with the order
    const { data: order, error: orderFetchError } = await supabaseAdmin
      .from('orders')
      .select('user_id')
      .eq('id', orderId)
      .single()

    if (orderFetchError || !order) {
      throw new Error(`Failed to fetch order details for re-sending invoice: ${orderFetchError?.message}`)
    }

    // Get the user's email from auth.users table using the service role client
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(order.user_id)

    if (userError || !user || !user.email) {
      throw new Error(`Failed to fetch user email for user ${order.user_id}: ${userError?.message}`)
    }

    // Send the order confirmation email
    const { success, message } = await sendOrderConfirmation({ orderId, userEmail: user.email })

    if (!success) {
      throw new Error(message || 'Failed to send order confirmation email.')
    }

    revalidatePath('/admin/orders')
    revalidatePath(`/account/orders/${orderId}`)
    revalidatePath(`/account/orders/${orderId}/invoice`)

    return { success: true, message: 'Invoice re-sent successfully.' }
  } catch (error: any) {
    console.error("Error re-sending invoice:", error.message)
    return {
      success: false,
      message: `Failed to re-send invoice: ${error.message}`
    }
  }
}