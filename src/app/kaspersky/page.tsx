"use client"

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useSession } from '@/context/session-context';
import { AuthDialog } from '@/components/auth-dialog';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { cn } from "@/lib/utils";

interface KasperskyProduct {
  id: string;
  name: string;
  price: number;
  features: string[];
  image: string;
}

const kasperskyProducts: KasperskyProduct[] = [
  {
    id: '23',
    name: 'Kaspersky Endpoint Security Cloud',
    price: 199.99,
    features: [
      'Cloud-managed security',
      'Protects Windows, macOS, iOS, Android',
      'Ransomware and cryptolocker protection',
      'Vulnerability and patch management',
      'Web and device control',
      'Easy to deploy and manage',
    ],
    image: '/images/kaspersky-cloud.png', // Updated image path
  },
  {
    id: '24',
    name: 'Kaspersky Endpoint Security for Business Select',
    price: 299.99,
    features: [
      'Advanced endpoint protection',
      'File server security',
      'Application, web, and device controls',
      'Mobile device management (MDM)',
      'Centralized management console',
      'Anti-malware for workstations and file servers',
    ],
    image: '/images/kaspersky-select.png', // Updated image path
  },
  {
    id: '25',
    name: 'Kaspersky Endpoint Security for Business Advanced',
    price: 499.99,
    features: [
      'Includes all Select features',
      'Patch management',
      'Vulnerability management',
      'Encryption for data protection',
      'System management tools',
      'Advanced anomaly control',
    ],
    image: '/images/kaspersky-advanced.png', // Updated image path
  },
];

export default function KasperskyEndpointPage() {
  const [selectedProduct, setSelectedProduct] = useState<KasperskyProduct | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [dbOrderId, setDbOrderId] = useState<string | null>(null); // State to store our DB order ID
  const router = useRouter();
  const { session, isLoading: isLoadingSession } = useSession();
  const [{ isPending }] = usePayPalScriptReducer();

  useEffect(() => {
    if (kasperskyProducts.length > 0) {
      setSelectedProduct(kasperskyProducts[0]);
    }
  }, []);

  const handleProductSelect = (product: KasperskyProduct) => {
    setSelectedProduct(product);
    setQuantity(1);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    } else if (e.target.value === '') {
      setQuantity(0);
    }
  };

  const createOrder = async (data: any, actions: any) => {
    if (!selectedProduct || quantity <= 0) {
      toast.error('Please select a product and a valid quantity.');
      throw new Error('Invalid product or quantity for PayPal order.');
    }

    if (!session) {
      setIsAuthDialogOpen(true);
      throw new Error('User not authenticated for PayPal order.');
    }

    setIsProcessingPayment(true);
    try {
      const totalAmount = (selectedProduct.price * quantity).toFixed(2);
      const items = [{
        id: parseInt(selectedProduct.id),
        name: selectedProduct.name,
        price: selectedProduct.price,
        quantity: quantity,
        image: selectedProduct.image, // Include image for potential notifications
      }];

      // Call the API route that creates the DB order and then the PayPal order
      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items,
          totalAmount: totalAmount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create PayPal order');
      }

      const result = await response.json();
      setDbOrderId(result.orderId); // Store our DB order ID
      return result.paypalOrderId; // Return PayPal's order ID
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

      // Call the API route to capture the PayPal payment
      const response = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderID: data.orderID, // PayPal's order ID
          orderId: dbOrderId, // Our DB order ID
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to capture PayPal order');
      }

      const orderDetails = await response.json();
      toast.success('Payment successful!');
      router.push(`/account/orders/${orderDetails.orderId}/invoice`); // Redirect to invoice page
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

  const totalAmount = selectedProduct ? (selectedProduct.price * quantity).toFixed(2) : '0.00';

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-12 text-primary">Kaspersky Endpoint Solutions</h1>
      
      <section className="grid md:grid-cols-3 gap-8 mb-12">
        {kasperskyProducts.map((product) => (
          <div
            key={product.id}
            className={cn(
              "border rounded-lg p-6 shadow-lg transition-all duration-300 cursor-pointer",
              selectedProduct?.id === product.id ? "border-blue-600 ring-2 ring-blue-600 scale-105" : "hover:shadow-xl hover:scale-105"
            )}
            onClick={() => handleProductSelect(product)}
          >
            <div className="relative h-32 w-full mb-4">
              <Image
                src={product.image}
                alt={product.name}
                fill
                style={{ objectFit: 'contain' }}
                className="rounded-md"
              />
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-center text-secondary-foreground">{product.name}</h2>
            <p className="text-3xl font-bold text-center text-green-600 mb-4">${product.price.toFixed(2)}</p>
            <ul className="space-y-2 text-sm text-muted-foreground mb-4">
              {product.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-1" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {selectedProduct && (
        <section className="bg-card p-8 rounded-lg shadow-xl mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center text-primary">Your Selection: {selectedProduct.name}</h2>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="relative w-48 h-48 flex-shrink-0">
              <Image
                src={selectedProduct.image}
                alt={selectedProduct.name}
                fill
                style={{ objectFit: 'contain' }}
                className="rounded-md"
              />
            </div>
            <div className="flex-grow">
              <p className="text-lg text-muted-foreground mb-4">{selectedProduct.features[0]} and more.</p>
              <div className="flex items-center gap-4 mb-6">
                <label htmlFor="quantity" className="text-lg font-medium">Quantity:</label>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="w-24 p-2 border rounded-md text-center bg-background"
                />
              </div>
              <p className="text-2xl font-bold mb-6">Total: <span className="text-green-600">${totalAmount}</span></p>

              <div className="max-w-md mx-auto">
                {isPending || isLoadingSession ? (
                  <div className="flex items-center justify-center py-3 bg-gray-200 rounded-md">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Loading...
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
                    disabled={isProcessingPayment || quantity <= 0 || !session}
                  />
                )}
              </div>
            </div>
          </div>
        </section>
      )}
      
      <AuthDialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen} />
    </div>
  );
}