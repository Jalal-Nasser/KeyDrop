import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/context/session-context';
import { AuthDialog } from '@/components/auth-dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client'; // Corrected import
// Removed unused imports for Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Tables

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { session, isLoading: isLoadingSession } = useSession();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [dbOrderId, setDbOrderId] = useState<string | null>(null);
  const [{ isPending }] = usePayPalScriptReducer();
  // Removed client-related state variables: clients, selectedClient, newClientName, isAddingNewClient
  // const supabase = createSupabaseBrowserClient(); // No longer needed, using imported 'supabase' directly

  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  // Removed useEffect for fetching clients

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  const totalAmount = useMemo(() => {
    // For simplicity, assuming no tax/shipping for now
    return subtotal;
  }, [subtotal]);

  // Removed handleAddClient function

  const createOrder = async (data: any, actions: any) => {
    if (!session) {
      setIsAuthDialogOpen(true);
      throw new Error('User not authenticated for PayPal order.');
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty.');
      throw new Error('Cart is empty.');
    }

    setIsProcessingPayment(true);
    try {
      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
          totalAmount: totalAmount,
          // Removed clientId as it's no longer applicable for a user-facing checkout
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create PayPal order');
      }

      const result = await response.json();
      setDbOrderId(result.orderId);
      return result.paypalOrderId;
    } catch (error: any) {
      console.error('Error creating PayPal order:', error);
      toast.error(error.message || 'Failed to create PayPal order. Please try again.');
      setIsProcessingPayment(false);
      throw error;
    }
  };

  const onApprove = async (data: any, actions: any) => {
    setIsProcessingPayment(true);
    try {
      if (!session) {
        toast.error('You must be logged in to complete this purchase.');
        setIsProcessingPayment(false);
        throw new Error('User not authenticated for PayPal order.');
      }

      if (!dbOrderId) {
        toast.error('Order ID not found. Please try creating the order again.');
        throw new Error('Database Order ID is missing.');
      }

      const response = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderID: data.orderID,
          orderId: dbOrderId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to capture PayPal order');
      }

      const orderDetails = await response.json();
      toast.success('Payment successful!');
      localStorage.removeItem('cart'); // Clear cart after successful purchase
      router.push(`/account/orders/${orderDetails.orderId}/invoice`);
    } catch (error: any) {
      console.error('Error capturing PayPal order:', error);
      toast.error(error.message || 'There was an issue processing your PayPal payment.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const onError = (err: any) => {
    console.error('PayPal onError:', err);
    toast.error('An error occurred with PayPal. Please try again.');
    setIsProcessingPayment(false);
  };

  const onCancel = (data: any) => {
    console.log('PayPal payment cancelled:', data);
    toast('You have cancelled the PayPal payment.');
    setIsProcessingPayment(false);
  };

  if (isLoadingSession) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Checkout</h1>
        <p className="mb-4">Please log in to proceed with your checkout.</p>
        <Button onClick={() => setIsAuthDialogOpen(true)}>Login / Sign Up</Button>
        <AuthDialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-12 text-primary">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Order Summary */}
        <div className="bg-card p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-6 text-primary">Order Summary</h2>
          {cartItems.length === 0 ? (
            <p className="text-muted-foreground">Your cart is empty. Please add items to proceed.</p>
          ) : (
            <>
              <ul className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <li key={item.id} className="flex justify-between items-center border-b pb-2 last:border-b-0">
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <img src={item.image} alt={item.name} className="object-contain rounded-md" />
                      </div>
                      <div>
                        <p className="font-medium text-secondary-foreground">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-semibold text-secondary-foreground">${(item.price * item.quantity).toFixed(2)}</p>
                  </li>
                ))}
              </ul>
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center text-xl font-bold text-primary">
                  <span>Total:</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Payment Section */}
        <div className="bg-card p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-6 text-primary">Payment Information</h2>

          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4 text-primary">Pay with PayPal</h3>
            {isPending || isLoadingSession ? (
              <div className="flex items-center justify-center py-3 bg-gray-200 rounded-md">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading PayPal...
              </div>
            ) : (
              <PayPalButtons
                style={{
                  layout: "vertical",
                  color: "gold",
                  shape: "rect",
                  label: "checkout",
                  height: 48,
                }}
                createOrder={createOrder}
                onApprove={onApprove}
                onError={onError}
                onCancel={onCancel}
                disabled={isProcessingPayment || cartItems.length === 0}
              />
            )}
          </div>
        </div>
      </div>
      <AuthDialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen} />
    </div>
  );
}