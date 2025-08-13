"use client"

import { PayPalButtons } from "@paypal/react-paypal-js"
import { useSession } from "@/context/session-context"
import { useCart } from "@/context/cart-context"
import { toast } from "sonner"
import { CartItem } from "@/types/cart"
import { useRouter } from "next/navigation"

interface PayPalCartButtonProps {
  cartTotal: number // This will now be for display only
  cartItems: CartItem[]
  billingDetails: any
  isFormValid: boolean
}

export function PayPalCartButton({ cartItems, billingDetails, isFormValid }: PayPalCartButtonProps) {
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

    const toastId = toast.loading("Creating secure order...")

    try {
      // Step 1: Create our internal order to get a trusted total and orderId
      const createOrderResponse = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartItems: cartItems.map(item => ({ id: item.id, quantity: item.quantity })),
          // promoCode: "...", // Pass promo code here if applicable
        }),
      });

      const ourOrder = await createOrderResponse.json();
      if (!createOrderResponse.ok) {
        throw new Error(ourOrder.error || "Failed to create order.");
      }
      
      toast.loading("Preparing PayPal payment...", { id: toastId });

      // Step 2: Create the PayPal order using our trusted orderId
      const createPayPalOrderResponse = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: ourOrder.orderId }),
      });

      const payPalOrder = await createPayPalOrderResponse.json();
      if (payPalOrder.paypalOrderId) {
        toast.dismiss(toastId);
        // Attach our internal orderId to the context for onApprove
        return JSON.stringify({ paypalOrderId: payPalOrder.paypalOrderId, ourOrderId: ourOrder.orderId });
      } else {
        throw new Error(payPalOrder.error || "Failed to prepare PayPal payment.");
      }
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
      return Promise.reject(err);
    }
  }

  const onApprove = async (data: any, actions: any) => {
    const toastId = toast.loading("Processing your payment...")
    try {
      // The createOrder function now returns a JSON string with both IDs
      const context = JSON.parse(data.orderID);
      const { paypalOrderId, ourOrderId } = context;

      const response = await fetch("/api/paypal/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: ourOrderId,
          paypalOrderId: paypalOrderId,
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