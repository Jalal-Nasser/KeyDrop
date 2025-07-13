'use server'

import { createSupabaseServerClient } from "@/lib/supabaseServer"
import { revalidatePath } from "next/cache"
import { sendOrderStatusUpdate, sendOrderConfirmation } from "@/lib/email-actions"
import { createClient } from '@supabase/supabase-js'

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = createSupabaseServerClient()

  try {
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select(`user_id`)
      .eq('id', orderId)
      .single()

    if (fetchError || !order) {
      throw new Error(`Failed to fetch order for status update: ${fetchError?.message}`)
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(order.user_id)

    if (userError || !user || !user.email) {
      throw new Error(`Failed to fetch user email for user ${order.user_id}: ${userError?.message}`)
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name')
      .eq('id', order.user_id)
      .single();

    const { error: updateError } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)

    if (updateError) {
      throw new Error(updateError.message)
    }

    await sendOrderStatusUpdate({ 
      orderId, 
      userEmail: user.email, 
      status, 
      firstName: profile?.first_name || 'Valued Customer' 
    });

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
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const { data: order, error: orderFetchError } = await supabaseAdmin
      .from('orders')
      .select('user_id')
      .eq('id', orderId)
      .single()

    if (orderFetchError || !order) {
      throw new Error(`Failed to fetch order details for re-sending invoice: ${orderFetchError?.message}`)
    }

    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(order.user_id)

    if (userError || !user || !user.email) {
      throw new Error(`Failed to fetch user email for user ${order.user_id}: ${userError?.message}`)
    }

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