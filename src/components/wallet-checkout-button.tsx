'use client'

import { useState, useEffect } from 'react'
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js'
import { useCart } from '@/context/cart-context'
import { useAuth } from '@/components/auth/AuthProvider'
import { toast } from 'sonner'
import { createWalletOrder } from '@/app/checkout/actions'
import { useRouter } from 'next/navigation'
import { supabase } from "@/integrations/supabase/client";
import { CartItem } from '@/types/cart' // Corrected import

interface WalletCheckoutButtonProps {
  planId?: string // Optional planId for subscription products
  cartTotal: number;
  cartItems: CartItem[];
  targetUserId: string;
  isFormValid: boolean;
}

const WalletCheckoutButton: React.FC<WalletCheckoutButtonProps> = ({ planId, cartTotal, cartItems, targetUserId, isFormValid }) => {
  const { clearCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const [{ isPending }] = usePayPalScriptReducer()
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (isProcessing) {
      // Optionally disable other UI elements while processing
    }
  }, [isProcessing])

  const createOrder = async (data: any, actions: any) => {
    setIsProcessing(true)
    try {
      if (!user) {
        toast.error('You must be logged in to complete this purchase.')
        setIsProcessing(false)
        throw new Error('User not authenticated')
      }

      const { data: { session } } = await supabase.auth.getSession();

      console.log("Wallet checkout: session?.user?.id:", session?.user?.id);
      console.log("Wallet checkout: token present:", !!session?.access_token);

      // Call your API route to create the PayPal order
      const response = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`, // Attach Supabase access token
        },
        body: JSON.stringify({
          cartItems,
          cartTotal,
          targetUserId: targetUserId, // Use the prop targetUserId
          planId, // Pass planId if it's a subscription
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Checkout failed: ${errorData.error || response.statusText}`);
      }

      const order = await response.json();
      return order.id; // Return the PayPal order ID
    } catch (error: any) {
      console.error("Error creating PayPal order:", error);
      toast.error(error.message || "Failed to create PayPal order. Please try again.");
      setIsProcessing(false)
      throw error; // Re-throw to stop PayPal flow
    }
  }

  const onApprove = async (data: any, actions: any) => {
    setIsProcessing(true)
    try {
      if (!user) {
        toast.error('You must be logged in to complete this purchase.')
        setIsProcessing(false)
        throw new Error('User not authenticated')
      }

      // Capture the PayPal payment
      const response = await fetch("/api/checkout/capture-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderID: data.orderID,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Payment capture failed: ${errorData.error || response.statusText}`);
      }

      const captureData = await response.json();

      if (captureData.status === 'COMPLETED') {
        // If payment is successful, create the order in your database
        const { success, orderId, message } = await createWalletOrder({
          cartItems,
          cartTotal,
          targetUserId: targetUserId, // Use the prop targetUserId
        });

        if (success) {
          toast.success('Order placed successfully!')
          clearCart()
          router.push(`/account/orders/${orderId}`)
        } else {
          throw new Error(message || 'Failed to save order to database.')
        }
      } else {
        throw new Error(`PayPal payment not completed: ${captureData.status}`);
      }
    } catch (error: any) {
      console.error("Error in PayPal onApprove:", error);
      toast.error(error.message || "Payment processing failed. Please try again.");
    } finally {
      setIsProcessing(false)
    }
  }

  const onError = (err: Record<string, any>) => {
    console.error("PayPal onError:", err)
    toast.error("An error occurred with PayPal. Please try again.")
    setIsProcessing(false)
  }

  if (!user) {
    return <p className="text-center text-red-500">Please log in to checkout.</p>
  }

  return (
    <div className="w-full">
      {isPending ? (
        <div className="text-center">Loading PayPal...</div>
      ) : (
        <PayPalButtons
          style={{ layout: "vertical", color: "blue", shape: "rect", label: "paypal" }}
          createOrder={createOrder}
          onApprove={onApprove}
          onError={onError}
          disabled={isProcessing || cartItems.length === 0 || !isFormValid}
        />
      )}
      {isProcessing && (
        <div className="mt-4 text-center text-sm text-gray-600">Processing your order...</div>
      )}
    </div>
  )
}

export default WalletCheckoutButton