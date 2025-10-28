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
import { Checkbox } from '@/components/ui/checkbox';

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
    image: '/images/kaspersky-cloud.png',
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
    image: '/images/kaspersky-select.png',
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
    image: '/images/kaspersky-advanced.png',
  },
];

export default function KasperskyEndpointPage() {
  const [selectedProduct, setSelectedProduct] = useState<KasperskyProduct | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [dbOrderId, setDbOrderId] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
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

  // Calculate price with 1.5% discount for each additional user
  const calculateDiscountedPrice = (basePrice: number, users: number) => {
    if (users <= 1) return basePrice;
    const discountPercentage = (users - 1) * 1.5; // 1.5% for each additional user
    const maxDiscount = 50; // Cap at 50% discount
    const finalDiscountPercentage = Math.min(discountPercentage, maxDiscount);
    return basePrice * (1 - finalDiscountPercentage / 100);
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

    if (!acceptedTerms) {
      toast.error('Please accept the terms and conditions to proceed.');
      throw new Error('Terms and conditions not accepted.');
    }

    setIsProcessingPayment(true);
    try {
      // Calculate discounted price
      const discountedPrice = calculateDiscountedPrice(selectedProduct.price, quantity);
      const totalAmount = discountedPrice * quantity;
      const items = [{
        id: selectedProduct.id, // Keep as string for product_id in DB
        name: selectedProduct.name,
        price: discountedPrice,
        quantity: quantity,
        image: selectedProduct.image,
      }];

      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items,
          totalAmount: totalAmount, // Now sending as a number
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

  const displayTotalAmount = selectedProduct ? (calculateDiscountedPrice(selectedProduct.price, quantity) * quantity).toFixed(2) : '0.00';

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-12 text-primary">Kaspersky Endpoint Solutions</h1>
      
      <section className="grid md:grid-cols-3 gap-8 mb-12">
        {kasperskyProducts.map((product, index) => (
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
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={index === 0} // Add priority to the first image
                style={{ objectFit: 'contain' }}
                className="rounded-md"
              />
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-center text-secondary-foreground">{product.name}</h2>
            <p className="text-3xl font-bold text-center text-green-600 mb-4">${product.price.toFixed(2)}</p>
            <ul className="space-y-2 text-sm text-muted-foreground mb-4">
              {product.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-start">
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
                sizes="(max-width: 768px) 100vw, 20vw" // Adjust sizes for the selected product image
                style={{ objectFit: 'contain' }}
                className="rounded-md"
              />
            </div>
            <div className="flex-grow">
              <p className="text-lg text-muted-foreground mb-4">{selectedProduct.features[0]} and more.</p>
              <div className="flex items-center gap-4 mb-6">
                <label htmlFor="quantity" className="text-lg font-medium">Users:</label>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="w-24 p-2 border rounded-md text-center bg-background"
                />
                {quantity > 1 && (
                  <span className="text-sm text-green-600 font-medium">
                    {Math.min((quantity - 1) * 1.5, 50)}% discount applied!
                  </span>
                )}
              </div>
              {selectedProduct && quantity > 1 && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-700">
                    <span className="font-medium">Original price per user:</span> ${selectedProduct.price.toFixed(2)}
                  </p>
                  <p className="text-sm text-green-700">
                    <span className="font-medium">Discounted price per user:</span> ${calculateDiscountedPrice(selectedProduct.price, quantity).toFixed(2)}
                  </p>
                  <p className="text-sm text-green-700">
                    <span className="font-medium">You save:</span> ${((selectedProduct.price - calculateDiscountedPrice(selectedProduct.price, quantity)) * quantity).toFixed(2)}
                  </p>
                </div>
              )}
              <p className="text-2xl font-bold mb-6">Total: <span className="text-green-600">${displayTotalAmount}</span></p>

              <div className="max-w-md mx-auto">
                {/* Terms and Conditions Checkbox */}
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox
                    id="terms"
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I accept the{' '}
                    <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Terms and Conditions
                    </a>
                  </label>
                </div>

                {!session ? (
                  <Button
                    onClick={() => setIsAuthDialogOpen(true)}
                    className="w-full"
                    size="lg"
                  >
                    Sign In to Purchase
                  </Button>
                ) : !acceptedTerms ? (
                  <Button
                    disabled
                    className="w-full"
                    size="lg"
                  >
                    Accept Terms to Continue
                  </Button>
                ) : isPending || isLoadingSession ? (
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
                    disabled={isProcessingPayment || quantity <= 0}
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