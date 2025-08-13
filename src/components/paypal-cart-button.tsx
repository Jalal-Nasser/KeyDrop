"use client"

import { PayPalButtons } from "@paypal/react-paypal-js"
import { useSession } from "@/context/session-context"
import { useCart } from "@/context/cart-context"
import { toast } from "sonner"
import { CartItem } from "@/types/cart"
import { sendOrderConfirmation } from "@/lib/email-actions"
import { createClient } from '@supabase/supabase-js' // Import createClient

interface PayPalCartButtonProps {
  cartTotal: number
  cartItems: CartItem[]
  billingDetails: any
  isFormValid: boolean
}

export function PayPalCartButton({ cartTotal, cartItems, billingDetails, isFormValid }: PayPalCartButtonProps) {
  const { session, supabase } = useSession()
  const { clearCart } = useCart()

  const handleProfileUpdate = async () => {
    if (!session) return

    const { agreedToTerms, ...profileDataToUpdate } = billingDetails;

    const { error } = await supabase
      .from("profiles")
      .update({
        ...profileDataToUpdate,
      })
      .eq("id", session.user.id)

    if (error) {
      toast.error(`Failed to update billing details: ${error.message}`)
      throw new Error(error.message)
    }
  }

  const createOrder = async (data: any, actions: any) => {
    if (!session) {
      toast.error("You must be signed in to make a purchase.")
      return Promise.reject(new Error("User not signed in"))
    }
    if (!isFormValid) {
      toast.error("Please fill in all required billing details and agree to the terms.")
      return Promise.reject(new Error("Billing form is invalid"))
    }

    try {
      await handleProfileUpdate()
    } catch (error) {
      return Promise.reject(error)
    }

    const shippingDetails = {
      name: {
        full_name: `${billingDetails.first_name} ${billingDetails.last_name}`,
      },
      address: {
        address_line_1: billingDetails.address_line_1,
        address_line_2: billingDetails.address_line_2,
        admin_area_2: billingDetails.city,
        admin_area_1: billingDetails.state_province_region,
        postal_code: billingDetails.postal_code,
        country_code: billingDetails.country,
      },
    }

    return actions.order.create({
      purchase_units: [
        {
          description: "Your order from DropsKey",
          amount: {
            currency_code: "USD",
            value: cartTotal.toFixed(2),
          },
          shipping: shippingDetails,
        },
      ],
      application_context: {
        shipping_preference: 'SET_PROVIDED_ADDRESS',
      },
    })
  }

  const onApprove = async (data: any, actions: any) => {
    if (!actions.order) {
      toast.error("Something went wrong with the PayPal order. Please try again.")
      return Promise.reject(new Error("Order actions not available"))
    }

    const details = await actions.order.capture()

    if (details.status === "COMPLETED") {
      toast.success("Payment successful! Your order is being processed.")

      if (supabase && session) {
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .insert({
            user_id: session.user.id,
            status: "pending",
            total: cartTotal,
            payment_gateway: "paypal",
            payment_id: details.id,
          })
          .select()
          .single()

        if (orderError) {
          toast.error(`Failed to save your order: ${orderError.message}`)
          return
        }

        const orderItems = cartItems.map(item => ({
          order_id: orderData.id,
          product_id: item.id,
          quantity: item.quantity,
          price_at_purchase: item.price,
        }))

        const { error: itemError } = await supabase
          .from("order_items")
          .insert(orderItems)

        if (itemError) {
          toast.error(`Failed to save order items: ${itemError.message}`)
        } else {
          toast.success("Your order has been successfully saved.")
          clearCart()
          toast.promise(sendOrderConfirmation({ orderId: orderData.id, userEmail: session.user.email! }), {
            loading: 'Sending confirmation email...',
            success: 'Confirmation email sent!',
            error: 'Failed to send confirmation email.',
          });

          // Invoke Discord notification for PayPal orders
          const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          )
          const { data: discordData, error: discordError } = await supabaseAdmin.functions.invoke('discord-order-notification', {
            body: {
              notificationType: 'new_order',
              orderId: orderData.id,
              cartTotal: cartTotal,
              userEmail: session.user.email,
              cartItems: cartItems.map(item => ({ name: item.name, quantity: item.quantity, image: item.image }))
            }
          })

          if (discordError) {
            console.error("Error invoking Discord notification function for PayPal order:", discordError)
          } else {
            console.log("Discord notification function invoked for PayPal order:", discordData)
          }
        }
      }
    } else {
      toast.error("Payment not completed. Please try again.")
    }
  }

  const onError = (err: any) => {
    toast.error("An error occurred during the transaction. Please try again.")
    console.error("PayPal Error:", err)
  }

  return (
    <div className="w-full">
      <PayPalButtons
        style={{ layout: "vertical", color: "blue", shape: "rect", label: "paypal" }}
        createOrder={createOrder}
        onApprove={onApprove}
        onError={onError}
        disabled={!session || !isFormValid}
      />
      {!session && (
        <p className="text-xs text-red-500 text-center mt-2">
          Please sign in to purchase.
        </p>
      )}
    </div>
  )
}