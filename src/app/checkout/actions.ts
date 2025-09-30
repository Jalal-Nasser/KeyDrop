'use server'

import { createSupabaseServerClient } from "@/lib/supabaseServer"
import { sendOrderConfirmation } from "@/lib/email-actions"
import { CartItem } from "@/types/cart"
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from "next/cache"
import { notifyAdminNewOrder } from "@/lib/whatsapp"

interface CreateWalletOrderPayload {
  cartItems: CartItem[]
  cartTotal: number
  targetUserId: string
}

export async function createWalletOrder({ cartItems, cartTotal, targetUserId }: CreateWalletOrderPayload) {
  const supabase = createSupabaseServerClient()

  try {
    // Recalculate totals from DB to ensure sale pricing and integrity
    const productIds = cartItems.map(i => i.id)
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, is_on_sale, sale_price, image')
      .in('id', productIds)

    if (productsError) throw productsError
    if (!products || products.length !== productIds.length) {
      throw new Error('One or more products not found while recalculating wallet order.')
    }

    // Compute subtotal using sale pricing when applicable
    let recalculatedSubtotal = 0
    const orderItemsToInsert = cartItems.map(item => {
      const product = products.find(p => p.id === item.id)!
      const unitPrice = product.is_on_sale && product.sale_price != null ? product.sale_price : product.price
      const lineTotal = unitPrice * item.quantity
      recalculatedSubtotal += lineTotal
      return {
        order_id: undefined as unknown as string, // filled after order insert
        product_id: item.id,
        quantity: item.quantity,
        price_at_purchase: unitPrice,
        product_name: product.name,
        sku: undefined as unknown as string | undefined,
        unit_price: unitPrice,
        line_total: lineTotal,
      }
    })

    // Process fees (15%)
    const processingFee = recalculatedSubtotal * 0.15
    const finalTotal = recalculatedSubtotal + processingFee

    // 1. Create the order for the target user with 'pending' status
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: targetUserId,
        total: finalTotal, // server-calculated total with fees
        status: "pending", // Changed from "completed"
        payment_gateway: "wallet",
        payment_id: `wallet_${new Date().getTime()}`,
      })
      .select()
      .single()

    if (orderError) throw orderError
    const orderId = orderData.id

    // 2. Create order items using recalculated pricing
    const orderItemsPrepared = orderItemsToInsert.map(oi => ({
      order_id: orderId,
      product_id: oi.product_id,
      quantity: oi.quantity,
      price_at_purchase: oi.price_at_purchase,
      product_name: oi.product_name,
      unit_price: oi.unit_price,
      line_total: oi.line_total,
    }))

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItemsPrepared)

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

    // 6. Fetch profile for customer's real name (if available)
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', targetUserId)
      .maybeSingle()

    const customerName = profile ? [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim() || null : null

    // 7. Notify admin on WhatsApp (best-effort; non-blocking)
    const firstItem = cartItems[0];
    notifyAdminNewOrder({
      orderId,
      total: finalTotal,
      userEmail: user.email,
      channel: 'wallet',
      customerName: customerName ?? ((user as any)?.user_metadata?.full_name as string | undefined) ?? user.email ?? undefined,
      productName: firstItem?.name ?? undefined,
      productImage: firstItem?.image ?? undefined
    }).catch(err => console.error('Admin WhatsApp notification failed:', err))

    revalidatePath('/admin/orders')
    revalidatePath(`/account/orders/${orderId}`)

    return { success: true, orderId }

  } catch (error: any) {
    console.error("Server-side wallet checkout error:", error)
    return { success: false, message: error.message || "Could not complete the order." }
  }
}