"use client"

import { PayPalButtons } from "@paypal/react-paypal-js"
import { useSession } from "@/context/session-context"
import { useCart } from "@/context/cart-context"
import { toast } from "sonner"
import { CartItem } from "@/types/cart"
import { useRouter } from "next/navigation"

interface PayPalCartButtonProps {
  cartTotal: number
  cartItems: CartItem[]
  billingDetails: any
  isFormValid: boolean
}

export function PayPalCartButton({ cartTotal, cartItems, billingDetails, isFormValid }: PayPalCartButtonProps) {
  const { session } = useSession()
  const { clearCart } = useCart()
  const router = useRouter()

  const createOrder = async () => {
    if (!session) {
      toast.error("You must be signed in to make a purchase.")
      return Promise.reject(new Error("User not signed in"))
    }
    if (!isFormValid) {
      toast.error("Please fill in all required billing details and agree to the terms.")
      return Promise.reject(new Error("Billing form is invalid"))
    }

    try {
      const response = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_price: cartTotal,
          currency_code: "USD",
        }),
      })
      const order = await response.json()
      if (order.id) {
        return order.id
      } else {
        throw new Error(order.error || "Failed to create order.")
      }
    } catch (err: any) {
      toast.error(err.message)
      return Promise.reject(err)
    }
  }

  const onApprove = async (data: any) => {
    const toastId = toast.loading("Processing your payment...")
    try {
      const response = await fetch("/api/paypal/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderID: data.orderID,
          cartItems,
          cartTotal,
          billingDetails,
        }),
      })
      const result = await response.json()

      if (result.success) {
        toast.success("Payment successful! Your order has been placed.", { id: toastId })
        clearCart()
        router.push(`/account/orders/${result.orderId}`)
      } else {
        throw new Error(result.error || "Payment capture failed.")
      }
    } catch (err: any) {
      toast.error(err.message, { id: toastId })
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