"use client"

import { useState, useEffect } from "react"
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js"
import { toast } from "sonner"
import { supabase as browserSupabase } from "@/integrations/supabase/client" // Renamed imported supabase
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { CartItem } from "@/types/cart"
import { createWalletOrder } from "@/app/checkout/actions"
import { Tables } from "@/types/supabase"

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
  const [fundAmount, setFundAmount] = useState<string>('') // For adding funds

  const isAdmin = profile?.is_admin || false
  const currentUserId = profile?.id

  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (!currentUserId) {
        setIsLoadingWallet(false);
        return;
      }
      setIsLoadingWallet(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', currentUserId)
        .single();

      if (error) {
        console.error('Error fetching wallet balance:', error);
        toast.error('Failed to load wallet balance.');
        setWalletBalance(0);
      } else {
        setWalletBalance(data?.wallet_balance || 0);
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

      const response = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          orderId, // Pass the pre-created orderId
          amount: totalAmount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`PayPal order creation failed: ${errorData.error || response.statusText}`);
      }

      const order = await response.json();
      onOrderCreated(orderId, new Date().toISOString()); // Notify parent that order is created
      return order.paypalOrderId; // Return the PayPal order ID
    } catch (error: any) {
      console.error("Error creating PayPal order:", error);
      toast.error(error.message || "Failed to create PayPal order. Please try again.");
      setIsProcessingPayment(false)
      throw error;
    }
  }

  const handleOnPayPalApprove = async (data: any) => {
    setIsProcessingPayment(true)
    try {
      if (!profile?.id) {
        toast.error('You must be logged in to complete this purchase.')
        setIsProcessingPayment(false)
        throw new Error('User not authenticated')
      }

      const response = await fetch("/api/paypal/capture", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId, // Pass the pre-created orderId
          paypalOrderId: data.orderID,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Payment capture failed: ${errorData.error || response.statusText}`);
      }

      const result = await response.json();
      if (result.success) {
        toast.success('Payment successful!')
        router.push(`/account/orders/${orderId}/invoice`) // Redirect to invoice page
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

  const handleWalletPayment = async () => {
    if (!isFormValid) {
      toast.error('Please agree to the terms and conditions.')
      return
    }

    if (isAdmin && !selectedClientId) {
      toast.error('Please select a client.')
      return
    }

    if (walletBalance < totalAmount) {
      toast.error('Insufficient wallet balance. Please add funds.')
      return
    }

    setIsProcessingPayment(true)
    try {
      const response = await fetch('/api/admin/wallet-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          clientId: selectedClientId,
          amount: totalAmount,
        }),
      })

      const result = await response.json()
      if (response.ok) {
        toast.success('Payment successful!')
        onOrderCreated(orderId, new Date().toISOString()); // Update order creation time
        router.push(`/account/orders/${orderId}/invoice`)
      } else {
        throw new Error(result.error || 'Payment failed')
      }
    } catch (error: any) {
      console.error('Wallet payment error:', error)
      toast.error(error.message || 'Payment failed. Please try again.')
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const handleAddFunds = async () => {
    if (parseFloat(fundAmount) <= 0 || isNaN(parseFloat(fundAmount))) {
      toast.error("Please enter a valid amount to add.");
      return;
    }
    toast.info("Add Funds functionality is a placeholder.", { description: `Attempting to add $${parseFloat(fundAmount).toFixed(2)}` });
    // In a real application, this would initiate a payment flow to add funds to the wallet.
    // For now, we'll just simulate a balance update.
    // setWalletBalance(prev => prev + parseFloat(fundAmount));
    // setFundAmount('');
  };

  if (!profile) {
    return <p className="text-center text-red-500">User profile not loaded. Cannot proceed with payment.</p>
  }

  return (
    <div className="space-y-6">
      {isAdmin ? (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Admin Wallet</h3>
          <div className="flex items-center justify-between">
            <span className="text-sm">Balance:</span>
            {isLoadingWallet ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span className="font-bold text-lg">${walletBalance.toFixed(2)}</span>
            )}
            <div className="flex items-center gap-2">
              <Input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Amount"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                className="w-24"
              />
              <Button onClick={handleAddFunds} size="sm" disabled={isProcessingPayment}>
                Add Funds
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium block">Purchase for Client</label>
            <Select
              onValueChange={setSelectedClientId}
              value={selectedClientId}
              disabled={isProcessingPayment || users.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={currentUserId || ""}>For Myself</SelectItem>
                {users
                  .filter(user => user.id !== currentUserId)
                  .map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.first_name} {user.last_name} ({user.id.substring(0, 8)}...)
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
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
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>
        </div>
      ) : null}

      {/* PayPal Section (always visible for non-admin, or below admin wallet for admin) */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">PayPal</h3>
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
        <Button
          onClick={() => toast.info("Debit or Credit Card payment via PayPal is a placeholder.")}
          disabled={!isFormValid || isProcessingPayment}
          className="w-full bg-gray-800 text-white py-3 rounded-md hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Debit or Credit Card
        </Button>
        <p className="text-center text-xs text-muted-foreground">Powered by PayPal</p>
      </div>
    </div>
  )
}