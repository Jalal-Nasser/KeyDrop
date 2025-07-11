'use server'

import { createSupabaseServerClient } from "@/lib/supabaseServer"
import { revalidatePath } from "next/cache"

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = createSupabaseServerClient()

  try {
    // The .single() method was removed here as it expects exactly one row,
    // and for an update operation, we don't necessarily need to return the updated row.
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      // .select() is kept to ensure the query is valid, but .single() is removed.
      // If you need to return the updated row, you would use .select().single()
      // but for just updating, it's not necessary and can cause this error.

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