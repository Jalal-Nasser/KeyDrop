'use server'

import { createSupabaseServerClient } from "@/lib/supabaseServer"
import { sendOrderConfirmation } from "@/lib/email-actions"
import { CartItem } from "@/types/cart"
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from "next/cache"

interface CreateWalletOrderPayload {
  cartItems: CartItem[]
  cartTotal: number
  targetUserId: string
}

export async function createWalletOrder({ cartItems, cartTotal, targetUserId }: CreateWalletOrderPayload) {
  const supabase = createSupabaseServerClient()

  try {
    // Calculate process fees (15%)
    const processingFee = cartTotal * 0.15
    const finalTotal = cartTotal + processingFee

    // 1. Create the order for the target user with 'pending' status
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: targetUserId,
        total: finalTotal, // Use total with process fees
        status: "pending", // Changed from "completed"
        payment_gateway: "wallet",
        payment_id: `wallet_${new Date().getTime()}`,
      })
      .select()
      .single()

    if (orderError) throw orderError
    const orderId = orderData.id

    // 2. Create order items
    const orderItemsToInsert = cartItems.map(item => ({
      order_id: orderId,
      product_id: item.id,
      quantity: item.quantity,
      price_at_purchase: item.price,
    }))

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItemsToInsert)

    if (itemsError) throw itemsError

    // 3. Get the target user's email for the confirmation using an admin client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(targetUserId)

    if (userError || !user || !user.email) {
      throw new Error(`Failed to fetch user email for user ${targetUserId}: ${userError?.message}`)
    }

    // 4. Send confirmation email to the client
    await sendOrderConfirmation({ orderId: orderId, userEmail: user.email })
    
    // 5. Send Discord notification via Edge Function
    const { data: discordData, error: discordError } = await supabaseAdmin.functions.invoke('discord-order-notification', {
      body: {
        notificationType: 'new_order',
        orderId: orderId,
        cartTotal: cartTotal,
        userEmail: user.email,
        cartItems: cartItems.map(item => ({ name: item.name, quantity: item.quantity, image: item.image })) // Include product image
      }
    })

    if (discordError) {
      console.error("Error invoking Discord notification function:", discordError)
      // This error will not prevent the order from being created, but it will be logged.
    } else {
      console.log("Discord notification function invoked:", discordData)
    }

    revalidatePath('/admin/orders')
    revalidatePath(`/account/orders/${orderId}`)

    return { success: true, orderId }

  } catch (error: any) {
    console.error("Server-side wallet checkout error:", error)
    return { success: false, message: error.message || "Could not complete the order." }
  }
}