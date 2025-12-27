import React, { useState } from 'react';

interface CartItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

interface PaymentSectionProps {
  orderId: string;
  totalAmount: number;
  cartItems?: CartItem[];
}

export default function PaymentSection({ orderId, totalAmount, cartItems = [] }: PaymentSectionProps) {
  const [showFundWallet, setShowFundWallet] = useState(false);
  const [fundAmount, setFundAmount] = useState(0);
  const [selectedClientId, setSelectedClientId] = useState('myself');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const walletBalance = 100; // Example value
  const clients: { id: string; full_name?: string; email?: string }[] = [];
  const isAdmin = false;
  const handleFundWallet = () => {};
  const handleWalletPayment = async () => {
    if (!agreedToTerms) {
      // Show toast error
      return;
    }

    if (walletBalance < totalAmount) {
      // Show toast error
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/wallet-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          clientId: selectedClientId === 'myself' ? null : selectedClientId,
          amount: totalAmount
        })
      });

      const result = await response.json();

      if (response.ok) {
        // Clear the cart after successful payment
        await fetch('/api/cart/clear', { method: 'POST' });
        // Show success toast
        // router.push(`/order-confirmation/${orderId}`);
      } else {
        // Show error toast
      }
    } catch (error) {
      console.error('Wallet payment error:', error);
      // Show error toast
    } finally {
      setLoading(false);
    }
  };
  const handlePayPalPayment = async () => {
    if (!agreedToTerms) {
      // Show toast error
      return;
    }

    // This would typically be handled by the PayPal button component
    // For now, we'll just show a success message
    try {
      // Simulate PayPal payment success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clear the cart after successful payment
      await fetch('/api/cart/clear', { method: 'POST' });
      // Show success toast
      // router.push(`/order-confirmation/${orderId}`);
    } catch (error) {
      console.error('Payment error:', error);
      // Show error toast
    }
  };

  return (
    <div className="rounded-lg border p-6">
      <h2 className="text-2xl font-bold mb-6">Payment</h2>
      
      <div className="mb-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="terms"
            checked={agreedToTerms}
            onChange={e => setAgreedToTerms(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          <label htmlFor="terms" className="text-sm">
            I agree to the <a href="/terms" className="text-blue-600 hover:underline">Terms and Conditions</a>
          </label>
        </div>
      </div>
      {isAdmin && <div className="text-center text-xs text-gray-500">Admin Only</div>}

      {isAdmin ? (
        <div className="space-y-2 mb-4 relative z-50">
          <label className="text-sm font-medium block">Purchase for Client</label>
          <select
            value={selectedClientId}
            onChange={e => setSelectedClientId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2.5 bg-white"
          >
            <option value="myself">For Myself</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.full_name || client.email}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500">
            Select a client to make a purchase on their behalf.
          </p>
          <div className="space-y-4 mt-4">
            <button
              onClick={handleWalletPayment}
              disabled={!agreedToTerms || loading || walletBalance < totalAmount}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Processing...' : `Pay $${totalAmount.toFixed(3)} from Wallet`}
            </button>
            {walletBalance < totalAmount && (
              <p className="text-sm text-red-600 text-center">
                Insufficient balance. Please add funds to your wallet.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div className="text-right text-xl mb-4">PayPal</div>
          <button
            onClick={handlePayPalPayment}
            disabled={!agreedToTerms || loading}
            className="w-full bg-[#00a1e4] text-white py-3 rounded-md mb-2"
          >
            Pay ${totalAmount.toFixed(3)} with PayPal
          </button>
          <button
            className="w-full bg-[#f5f7f8] text-gray-700 py-3 rounded-md mb-4"
          >
            Debit or Credit Card
          </button>
          <div className="text-center text-xs text-gray-500">
            Powered by PayPal
          </div>
        </div>
      )}
    </div>
  );
}