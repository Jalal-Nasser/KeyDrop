import { paypalClient } from "@/lib/paypal"
import paypal from "@paypal/checkout-server-sdk"
import { NextRequest, NextResponse } from "next/server"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { sendOrderConfirmation } from "@/lib/email-actions"
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const { orderID, cartItems, cartTotal, billingDetails } = await req.json()
  const supabase = createServerActionClient({ cookies })

  const request = new paypal.orders.OrdersCaptureRequest(orderID)
  request.requestBody({} as any) // Empty body for capture

  try {
    const capture = await paypalClient.execute(request)
    const captureData = capture.result

    if (captureData.status === "COMPLETED") {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        return NextResponse.json({ error: "User not authenticated." }, { status: 401 })
      }

      // Update profile with billing details
      const { agreedToTerms, ...profileData } = billingDetails
      const { error: profileError } = await supabase
        .from("profiles")
        .update(profileData)
        .eq("id", session.user.id)

      if (profileError) {
        console.error("Error updating profile:", profileError)
        // Non-fatal, so we continue
      }

      // Create order in DB
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: session.user.id,
          status: "pending",
          total: cartTotal,
          payment_gateway: "paypal",
          payment_id: captureData.id,
        })
        .select()
        .single()

      if (orderError) throw new Error(`DB Order Error: ${orderError.message}`)

      // Create order items in DB
      const orderItemsToInsert = cartItems.map((item: any) => ({
        order_id: orderData.id,
        product_id: item.id,
        quantity: item.quantity,
        price_at_purchase: item.price,
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItemsToInsert)
      if (itemsError) throw new Error(`DB Items Error: ${itemsError.message}`)

      // Send confirmation email
      await sendOrderConfirmation({ orderId: orderData.id, userEmail: session.user.email! })

      // Send Discord notification
      const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
      await supabaseAdmin.functions.invoke('discord-order-notification', {
        body: {
          notificationType: 'new_order',
          orderId: orderData.id,
          cartTotal: cartTotal,
          userEmail: session.user.email,
          cartItems: cartItems.map((item: any) => ({ name: item.name, quantity: item.quantity, image: item.image }))
        }
      }).catch(err => console.error("Discord notification failed:", err));

      return NextResponse.json({ success: true, orderId: orderData.id })
    } else {
      return NextResponse.json({ error: "Payment not completed." }, { status: 400 })
    }
  } catch (e: any) {
    console.error("PayPal Capture Error:", e.message)
    return NextResponse.json({ error: "Failed to capture order." }, { status: 500 })
  }
}