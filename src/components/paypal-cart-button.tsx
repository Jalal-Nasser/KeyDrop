"use client"

import { PayPalButtons } from "@paypal/react-paypal-js"
import { useSession } from "@/context/session-context"
import { useCart } from "@/context/cart-context"
import { toast } from "sonner"
import { CartItem } from "@/types/cart"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { z } from "zod"

const checkoutSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required"),
  last_name: z.string().trim().min(1, "Last name is required"),
  company_name: z.string().optional().nullable(),
  vat_number: z.string().optional().nullable(),
  address_line_1: z.string().trim().min(1, "Address is required"),
  address_line_2: z.string().optional().nullable(),
  city: z.string().trim().min(1, "City is required"),
  state_province_region: z.string().trim().min(1, "State/Province/Region is required"),
  postal_code: z.string().trim().min(1, "Postal code is required"),
  country: z.string().trim().length(2, "Country is required"),
  agreedToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions.",
  }),
});

interface PayPalCartButtonProps {
  cartTotal: number // This will now be for display only
  cartItems: CartItem[]
  billingDetails: any
  isFormValid: boolean
  onOrderCreated?: (orderCreatedTime: string) => void
}

export function PayPalCartButton({ cartItems, billingDetails, isFormValid, onOrderCreated }: PayPalCartButtonProps) {
  const { session } = useSession()
  const { clearCart } = useCart()
  const router = useRouter()
  const [internalOrderId, setInternalOrderId] = useState<number | null>(null)

  const createOrder = async () => {
    if (!session) {
      toast.error("You must be signed in to make a purchase.")
      return Promise.reject(new Error("User not signed in"))
    }

    // Validate billing details
    const validation = checkoutSchema.safeParse(billingDetails);
    if (!validation.success) {
      const errors = validation.error.issues.map(issue => issue.message).join('\n');
      toast.error(`Please fix the following errors:\n${errors}`);
      return Promise.reject(new Error("Billing form is invalid"));
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
        credentials: 'include', // Ensure cookies are sent
      });

      const ourOrder = await createOrderResponse.json();
      if (!createOrderResponse.ok) {
        throw new Error(ourOrder.error || "Failed to create order.");
      }
      
      setInternalOrderId(ourOrder.orderId); // Store our internal order ID in state
      
      // Notify parent component that order was created
      onOrderCreated?.(new Date().toISOString());

      toast.loading("Preparing PayPal payment...", { id: toastId });

      // Step 2: Create the PayPal order using our trusted orderId and total
      const createPayPalOrderResponse = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          orderId: ourOrder.orderId,
          // The order total from the API already includes process fees
        }),
        credentials: 'include', // Ensure cookies are sent
      });

      const payPalOrder = await createPayPalOrderResponse.json();
      if (payPalOrder.paypalOrderId) {
        toast.dismiss(toastId);
        // Return ONLY the PayPal order ID to the PayPal script
        return payPalOrder.paypalOrderId;
      } else {
        throw new Error(payPalOrder.error || "Failed to prepare PayPal payment.");
      }
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
      setInternalOrderId(null); // Reset state on error
      return Promise.reject(err);
    }
  }

  const onApprove = async (data: any, actions: any) => {
    if (!internalOrderId) {
      toast.error("Internal order reference not found. Please try again.");
      return;
    }
    const toastId = toast.loading("Processing your payment...")
    try {
      const response = await fetch("/api/paypal/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: internalOrderId, // Use the ID from state
          paypalOrderId: data.orderID, // Use the ID from PayPal
        }),
        credentials: 'include', // Ensure cookies are sent
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
    } finally {
      setInternalOrderId(null); // Reset state after completion
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