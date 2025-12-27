'use server'

import { cookies } from "next/headers" // Import cookies
import { createSupabaseServerClientComponent } from "@/lib/supabase/server" // Import createSupabaseServerClientComponent
import { createAdminClient } from "@/lib/supabase/server" // Keep for admin client
import { sendOrderConfirmation } from "@/lib/email-actions"
import { CartItem } from "@/types/cart"
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from "next/cache"
import { notifyAdminNewOrder } from "@/lib/whatsapp"
import { TablesInsert } from "@/types/supabase" // Import TablesInsert

interface CreateWalletOrderPayload {
  cartItems: CartItem[]
  cartTotal: number
  targetUserId: string
}

export async function createWalletOrder({ cartItems, cartTotal, targetUserId }: CreateWalletOrderPayload) {
  // Directly initialize Supabase client for this server action
  const supabase = await createSupabaseServerClientComponent();

  // Debug cookies
  console.log("=== Incoming cookies ===", cookies().getAll());

  console.log('createWalletOrder: Attempting to create order for targetUserId:', targetUserId); // Added log

  // Get current user from the session
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  console.log("Supabase getUser:", { user, userError });

  console.log("=== Supabase auth.getUser debug ===");
  console.log("userError:", userError);
  console.log("user:", user);

  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id) // Use the authenticated user's ID to check admin status
    .single()

  const isAdmin = profile?.is_admin || false
  
  // If admin, use admin client for potentially creating orders for other users
  // Otherwise, use the regular authenticated user's client
  const dbClient = isAdmin ? await createAdminClient() : supabase;

  try {
    // Recalculate totals from DB to ensure sale pricing and integrity
    const productIds = cartItems.map(i => i.id)
    const { data: products, error: productsError } = await dbClient
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
      const product = products.find((p: any) => p.id === item.id)!
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
    const { data: orderData, error: orderError } = await dbClient
      .from("orders")
      .insert({
        user_id: targetUserId, // Use targetUserId as specified
        total: finalTotal, // server-calculated total with fees
        status: "pending",
        payment_gateway: "wallet",
        payment_id: `wallet_${new Date().getTime()}`,
      } as TablesInsert<'orders'>)
      .select()
      .single()

    if (orderError) {
      console.error("Insert order error:", orderError);
      throw orderError;
    }
    console.log("Order created successfully for user:", user.id);
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

    const { error: itemsError } = await dbClient
      .from("order_items")
      .insert(orderItemsPrepared)

    if (itemsError) throw itemsError

    // 3. Get the target user's email for the confirmation using an admin client
    // Note: If dbClient is already an admin client, this createClient call is redundant but harmless.
    const supabaseAdminForEmail = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data: { user: targetUser }, error: targetUserError } = await supabaseAdminForEmail.auth.admin.getUserById(targetUserId)

    if (targetUserError || !targetUser || !targetUser.email) {
      throw new Error(`Failed to fetch user email for user ${targetUserId}: ${targetUserError?.message}`)
    }

    // 4. Send confirmation email to the client
    await sendOrderConfirmation({ orderId: orderId, userEmail: targetUser.email })
    
    // 5. Send Discord notification via Edge Function
    const { data: discordData, error: discordError } = await supabaseAdminForEmail.functions.invoke('discord-order-notification', {
      body: {
        notificationType: 'new_order',
        orderId: orderId,
        cartTotal: finalTotal, // Use server-calculated total
        userEmail: targetUser.email,
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
    const { data: targetProfile } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', targetUserId)
      .maybeSingle()

    const customerName = targetProfile ? [targetProfile.first_name, targetProfile.last_name].filter(Boolean).join(' ').trim() || null : null

    // 7. Notify admin on WhatsApp (best-effort; non-blocking)
    const firstItem = cartItems[0];
    notifyAdminNewOrder({
      orderId,
      total: finalTotal, // Use server-calculated total
      userEmail: targetUser.email,
      channel: 'wallet',
      customerName: customerName ?? ((targetUser as any)?.user_metadata?.full_name as string | undefined) ?? targetUser.email ?? undefined,
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