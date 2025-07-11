'use server'

import { createSupabaseServerClient } from "@/lib/supabaseServer"
import { revalidatePath } from "next/cache"

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = createSupabaseServerClient()

  try {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single() // Remove this line to avoid the single row requirement

    if (error) {
      throw new Error(error.message)
    }

    revalidatePath('/admin/orders')
    revalidatePath(`/account/orders/${orderId}`)

    return { success: true, message: 'Order status updated successfully.' }
  } catch (error: any) {
    return { 
      success: false, 
      message: `Failed to update order status: ${error.message}` 
    }
  }
}