'use client'

import { useState, useEffect } from 'react'
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js'
import { useCart } from '@/context/cart-context' // Corrected import path
import { useAuth } from '@/components/auth/AuthProvider' // Corrected import path
import { toast } from 'sonner'
import { createWalletOrder } from '@/app/checkout/actions'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client';

interface WalletCheckoutButtonProps {
  planId?: string // Optional planId for subscription products
  cartTotal?: number // Total amount for the cart
  cartItems?: any[] // Array of cart items
  targetUserId?: string // ID of the user making the purchase
  isFormValid?: boolean // Whether the form is valid for checkout
}

const WalletCheckoutButton: React.FC<WalletCheckoutButtonProps> = ({ planId, cartTotal: propCartTotal, cartItems: propCartItems, targetUserId: propTargetUserId, isFormValid }) => {
  const { cartItems: contextCartItems, cartTotal: contextCartTotal, clearCart } = useCart()
  const cartItems = propCartItems || contextCartItems
  const cartTotal = propCartTotal || contextCartTotal
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
    setIsProcessing(true);
    try {
      if (!user) {
        const errorMsg = 'You must be logged in to complete this purchase.';
        console.error('Wallet checkout: User not authenticated');
        toast.error(errorMsg);
        setIsProcessing(false);
        throw new Error(errorMsg);
      }

      // Get the current session and access token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        const errorMsg = 'Failed to get authentication session. Please sign in again.';
        console.error('Wallet checkout: Session error:', sessionError);
        toast.error(errorMsg);
        setIsProcessing(false);
        throw new Error(errorMsg);
      }

      console.log('Wallet checkout: User ID:', user.id);
      console.log('Wallet checkout: Session user ID:', session.user?.id);
      console.log('Wallet checkout: Access token present:', !!session.access_token);

      // Prepare the request body
      const requestBody = {
        cartItems,
        cartTotal,
        targetUserId: propTargetUserId || user.id,
        planId,
      };

      console.log('Wallet checkout: Sending request to create order:', {
        url: '/api/checkout/create-order',
        method: 'POST',
        hasToken: !!session.access_token,
        body: { ...requestBody, cartItems: cartItems.map((item: any) => ({ id: item.id, quantity: item.quantity })) },
      });

      // Call the API route to create the order
      const response = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        const errorMsg = responseData?.error || `Request failed with status ${response.status}`;
        console.error('Wallet checkout: API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorMsg,
        });
        throw new Error(`Checkout failed: ${errorMsg}`);
      }

      console.log('Wallet checkout: Order created successfully:', responseData);
      return responseData.id;
    } catch (error: any) {
      console.error('Wallet checkout: Error in createOrder:', error);
      toast.error(error.message || 'Failed to create order. Please try again.');
      setIsProcessing(false);
      throw error; // Re-throw to stop the PayPal flow
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
          targetUserId: propTargetUserId || user.id,
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
          disabled={isProcessing || cartItems.length === 0}
        />
      )}
      {isProcessing && (
        <div className="mt-4 text-center text-sm text-gray-600">Processing your order...</div>
      )}
    </div>
  )
}

export default WalletCheckoutButton