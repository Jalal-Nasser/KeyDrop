"use client"

import { PayPalButtons } from "@paypal/react-paypal-js"
import { useSession } from "@/context/session-context"
import { useCart } from "@/context/cart-context"
import { toast } from "sonner"
import { CartItem } from "@/types/cart"
import type { CreateOrderActions, OnApproveActions, OnApproveData } from "@paypal/react-paypal-js"

interface PayPalCartButtonProps {
  cartTotal: number
  cartItems: CartItem[]
  billingDetails: any // This should ideally be typed more strictly, e.g., from the checkoutSchema
  isFormValid: boolean
}

// Helper function to parse price string to number
const parsePrice = (price: string): number => {
  return parseFloat(price.replace(/[^0-9.-]+/g, ""))
}

export function PayPalCartButton({ cartTotal, cartItems, billingDetails, isFormValid }: PayPalCartButtonProps) {
  const { session, supabase } = useSession()
  const { clearCart } = useCart()

  // Extracted function for saving order to Supabase
  const saveOrderToSupabase = async (paypalDetails: OnApproveData) => {
    if (!session || !supabase) {
      console.error("Session or Supabase client not available for saving order.")
      return
    }

    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: session.user.id,
        status: "completed",
        total: cartTotal,
        payment_gateway: "paypal",
        payment_id: paypalDetails.orderID, // Use orderID from OnApproveData
      })
      .select()
      .single()

    if (orderError) {
      toast.error(`Failed to save your order: ${orderError.message}`)
      throw new Error(orderError.message) // Propagate error to prevent clearing cart
    }

    const orderItems = cartItems.map(item => ({
      order_id: orderData.id,
      product_id: item.id,
      quantity: item.quantity,
      price_at_purchase: parsePrice(item.price),
    }))

    const { error: itemError } = await supabase
      .from("order_items")
      .insert(orderItems)

    if (itemError) {
      toast.error(`Failed to save order items: ${itemError.message}`)
      throw new Error(itemError.message) // Propagate error
    }

    toast.success("Your order has been successfully saved.")
    clearCart() // Clear cart only if both order and items are saved successfully
  }

  const handleProfileUpdate = async (): Promise<void> => {
    if (!session) return

    const { error } = await supabase
      .from("profiles")
      .update({
        ...billingDetails,
      })
      .eq("id", session.user.id)

    if (error) {
      toast.error(`Failed to update billing details: ${error.message}`)
      throw new Error(error.message)
    }
  }

  const createOrder = async (data: Record<string, unknown>, actions: CreateOrderActions) => {
    if (!session) {
      toast.error("You must be signed in to make a purchase.")
      return Promise.reject(new Error("User not signed in"))
    }
    if (!isFormValid) {
      toast.error("Please fill in all required billing details.")
      return Promise.reject(new Error("Billing form is invalid"))
    }

    try {
      await handleProfileUpdate()
    } catch (error) {
      return Promise.reject(error)
    }

    return actions.order.create({
      purchase_units: [
        {
          description: "Your order from DropsKey",
          amount: {
            currency_code: "USD",
            value: cartTotal.toFixed(2),
          },
        },
      ],
    })
  }

  const onApprove = async (data: OnApproveData, actions: OnApproveActions) => {
    if (!actions.order) {
      toast.error("Something went wrong with the PayPal order. Please try again.")
      return Promise.reject(new Error("Order actions not available"))
    }

    const captureToastId = toast.loading("Capturing payment...")
    try {
      const details = await actions.order.capture()
      toast.dismiss(captureToastId)

      if (details.status === "COMPLETED") {
        toast.success("Payment successful! Your order is being processed.")
        await saveOrderToSupabase(data) // Pass data to saveOrderToSupabase
      } else {
        toast.error("Payment not completed. Please try again.")
      }
    } catch (error: any) {
      toast.dismiss(captureToastId)
      toast.error(`An error occurred during payment capture: ${error.message}`)
      console.error("PayPal Capture Error:", error)
    }
  }

  const onError = (err: Record<string, unknown>) => {
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