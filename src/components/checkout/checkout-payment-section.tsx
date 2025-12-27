"use client"

import { useState, useEffect } from "react"
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js"
import { toast } from "sonner"
import { supabase as browserSupabase } from "@/integrations/supabase/client" // Renamed imported supabase
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { CartItem } from "@/types/cart"
import { Tables } from "@/types/supabase"
import { useCart } from "@/context/cart-context"

import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"

interface CheckoutPaymentSectionProps {
  orderId: string // This is the ID of the order created in the DB
  totalAmount: number
  profile: Tables<'profiles'> | null // Full profile to check is_admin and wallet_balance
  users: Pick<Tables<'profiles'>, 'id' | 'first_name' | 'last_name'>[] // For admin to select client
  selectedClientId: string
  setSelectedClientId: (id: string) => void
  isFormValid: boolean // Represents agreedToTerms from parent
  onOrderCreated: (orderId: string, orderCreatedAt: string) => void // Callback to update parent's order creation time
}

export function CheckoutPaymentSection({
  orderId,
  totalAmount,
  profile,
  users,
  selectedClientId,
  setSelectedClientId,
  isFormValid,
  onOrderCreated,
}: CheckoutPaymentSectionProps) {
  const router = useRouter()
  const supabase = browserSupabase // Use the imported and renamed supabase instance
  const [{ isPending: isPayPalScriptPending }] = usePayPalScriptReducer()
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [walletBalance, setWalletBalance] = useState<number>(0)
  const [isLoadingWallet, setIsLoadingWallet] = useState(true)
  const { cartItems } = useCart() // Get cart items from context
  const [paypalOrderId, setPaypalOrderId] = useState<string>("") // Store PayPal order ID

  const isAdmin = profile?.is_admin || false
  const currentUserId = profile?.id

  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (!currentUserId) {
        setIsLoadingWallet(false);
        return;
      }
      setIsLoadingWallet(true);

      // For admin users, ensure they have at least $150 balance
      if (isAdmin) {
        const { data, error } = await supabase
          .from('profiles')
          .select('wallet_balance')
          .eq('id', currentUserId)
          .single();

        if (error) {
          console.error('Error fetching wallet balance:', error);
          toast.error('Failed to load wallet balance.');
          setWalletBalance(150); // Default admin balance
        } else {
          const currentBalance = data?.wallet_balance || 0;
          // If balance is less than $150, update it to $150
          if (currentBalance < 150) {
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ wallet_balance: 150 })
              .eq('id', currentUserId);

            if (updateError) {
              console.error('Error updating admin wallet balance:', updateError);
              setWalletBalance(150); // Use default even if update fails
            } else {
              setWalletBalance(150);
            }
          } else {
            setWalletBalance(currentBalance);
          }
        }
      } else {
        setWalletBalance(0);
      }
      setIsLoadingWallet(false);
    };

    if (isAdmin) {
      fetchWalletBalance();
    }
  }, [isAdmin, currentUserId, supabase]);

  const handleCreatePayPalOrder = async () => {
    setIsProcessingPayment(true)
    try {
      if (!profile?.id) {
        toast.error('You must be logged in to complete this purchase.')
        setIsProcessingPayment(false)
        throw new Error('User not authenticated')
      }

      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch("/api/paypal/create-order-with-cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          cartItems: cartItems,
          cartTotal: totalAmount,
          targetUserId: selectedClientId || profile.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`PayPal order creation failed: ${errorData.error || response.statusText}`);
      }

      const result = await response.json();

      // Store the PayPal order ID for later use
      setPaypalOrderId(result.paypalOrderId);

      // Update the parent component with the new order ID
      onOrderCreated(result.orderId, new Date().toISOString());

      return result.paypalOrderId; // Return the PayPal order ID
    } catch (error: any) {
      console.error("Error creating PayPal order:", error);
      toast.error(error.message || "Failed to create PayPal order. Please try again.");
      setIsProcessingPayment(false)
      throw error;
    }
  }

  const clearUserCart = async () => {
    try {
      // Clear cart from localStorage
      localStorage.removeItem('cart');

      // Clear cart from context if available
      const { clearCart } = useCart();
      if (clearCart) {
        clearCart();
      }

      // Also call the API to clear server-side cart
      await fetch('/api/cart/clear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false;
    }
  };

  const handleOnPayPalApprove = async (data: any) => {
    setIsProcessingPayment(true)
    try {
      if (!profile?.id) {
        toast.error('You must be logged in to complete this purchase.')
        setIsProcessingPayment(false)
        throw new Error('User not authenticated')
      }

      // Use the order ID from the parent component (set during order creation)
      const orderIdToUse = orderId;

      const response = await fetch("/api/paypal/capture", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: orderIdToUse,
          paypalOrderId: data.orderID,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Payment capture failed: ${errorData.error || response.statusText}`);
      }

      const result = await response.json();
      if (result.success) {
        // Clear cart after successful payment
        await clearUserCart();
        toast.success('Payment successful!');
        router.push(`/account/orders/${orderIdToUse}/invoice`); // Redirect to invoice page
      } else {
        throw new Error(result.error || 'Payment not completed by PayPal.')
      }
    } catch (error: any) {
      console.error("Error in PayPal onApprove:", error);
      toast.error(error.message || "Payment processing failed. Please try again.");
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const handlePayPalError = (err: Record<string, any>) => {
    console.error("PayPal onError:", err)
    toast.error("An error occurred with PayPal. Please try again.")
    setIsProcessingPayment(false)
  }

  const clearCart = async () => {
    try {
      const response = await fetch('/api/cart/clear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to clear cart');
      }

      // Clear cart from local storage
      localStorage.removeItem('cart');

      // Clear cart from context
      const { clearCart } = useCart();
      if (clearCart) {
        clearCart();
      }

      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false;
    }
  };

  const handleWalletPayment = async () => {
    if (!isFormValid) {
      toast.error('Please agree to the terms and conditions.')
      return
    }

    setIsProcessingPayment(true);

    if (isAdmin && !selectedClientId) {
      toast.error('Please select a client.')
      return
    }

    if (walletBalance < totalAmount) {
      toast.error('Insufficient wallet balance. Please add funds.')
      return
    }

    try {
      // First create the order in our database
      const { data: { session } } = await supabase.auth.getSession();

      const createOrderResponse = await fetch("/api/paypal/create-order-with-cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          cartItems: cartItems,
          cartTotal: totalAmount,
          targetUserId: selectedClientId || profile?.id,
        }),
      });

      if (!createOrderResponse.ok) {
        const errorData = await createOrderResponse.json();
        throw new Error(`Order creation failed: ${errorData.error || createOrderResponse.statusText}`);
      }

      const orderResult = await createOrderResponse.json();
      const newOrderId = orderResult.orderId;

      // Update the parent component with the new order ID
      onOrderCreated(newOrderId, new Date().toISOString());

      // Now process the wallet payment
      const response = await fetch('/api/admin/wallet-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: newOrderId,
          clientId: selectedClientId,
          amount: totalAmount,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        // Clear the cart after successful payment
        await clearUserCart();

        toast.success('Payment successful!');
        router.push(`/account/orders/${newOrderId}/invoice`);
      } else {
        throw new Error(result.error || 'Payment failed');
      }
    } catch (error: any) {
      console.error('Wallet payment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  }


  if (!profile) {
    return <p className="text-center text-red-500">User profile not loaded. Cannot proceed with payment.</p>
  }

  return (
    <div className="space-y-6">
      {isAdmin ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Admin Wallet</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm">Balance:</span>
              {isLoadingWallet ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span className="font-bold text-lg text-blue-600">${walletBalance.toFixed(2)}</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium block">Purchase for Client</label>
            <Select
              onValueChange={setSelectedClientId}
              value={selectedClientId}
              disabled={isProcessingPayment || users.length === 0}
            >
              <SelectTrigger className="w-full border border-gray-300 rounded-lg p-2.5 bg-white">
                <SelectValue placeholder="For Myself" />
              </SelectTrigger>
              <SelectContent className="z-[9999] bg-white">
                <SelectItem value={currentUserId || ""}>For Myself</SelectItem>
                {users
                  .filter(user => user.id !== currentUserId)
                  .map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.first_name} {user.last_name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              Select a client to make a purchase on their behalf.
            </p>
          </div>

          <Button
            onClick={handleWalletPayment}
            disabled={!isFormValid || isProcessingPayment || walletBalance < totalAmount}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessingPayment ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Pay ${totalAmount.toFixed(2)} from Wallet
          </Button>
          {walletBalance < totalAmount && (
            <p className="text-sm text-red-600 text-center">
              Insufficient balance. Please add funds to your wallet.
            </p>
          )}
        </div>
      ) : null}

      {/* PayPal Section */}
      <div className="space-y-4">
        {isPayPalScriptPending ? (
          <div className="text-center">Loading PayPal...</div>
        ) : (
          <PayPalButtons
            disabled={!isFormValid || isProcessingPayment}
            createOrder={(data, actions) => handleCreatePayPalOrder()}
            onApprove={(data, actions) => handleOnPayPalApprove(data)}
            onError={handlePayPalError}
            style={{
              layout: 'vertical',
              color: 'blue',
              shape: 'rect',
              label: 'paypal',
            }}
          />
        )}
        <p className="text-center text-xs text-gray-500 mt-2">Powered by PayPal</p>
      </div>
    </div>
  )
}