"use client"

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { CheckCircle, Shield, Award, Headset, DollarSign, CreditCard, Loader2, ShoppingCart } from 'lucide-react'; // Added ShoppingCart
import { toast } from 'sonner'; // Changed from useToast to toast from sonner
import { useRouter } from 'next/navigation';
import { useSession } from '@/context/session-context';
import { AuthDialog } from '@/components/auth-dialog';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js'; // Import PayPal components
import { cn } from "@/lib/utils"; // Added cn import

// Define a type for the product to ensure type safety
interface KasperskyProduct {
  id: string;
  name: string;
  price: number;
  features: string[];
  image: string;
}

const kasperskyProducts: KasperskyProduct[] = [
  {
    id: 'kaspersky-endpoint-security-cloud',
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
    image: '/kaspersky-cloud.png', // Placeholder image
  },
  {
    id: 'kaspersky-endpoint-security-for-business-select',
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
    image: '/kaspersky-select.png', // Placeholder image
  },
  {
    id: 'kaspersky-endpoint-security-for-business-advanced',
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
    image: '/kaspersky-advanced.png', // Placeholder image
  },
];

export default function KasperskyEndpointPage() {
  const [selectedProduct, setSelectedProduct] = useState<KasperskyProduct | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const router = useRouter();
  const { session, isLoading: isLoadingSession } = useSession();
  const [{ isPending }] = usePayPalScriptReducer(); // PayPal script reducer

  useEffect(() => {
    // Set the first product as selected by default
    if (kasperskyProducts.length > 0) {
      setSelectedProduct(kasperskyProducts[0]);
    }
  }, []);

  const handleProductSelect = (product: KasperskyProduct) => {
    setSelectedProduct(product);
    setQuantity(1); // Reset quantity when product changes
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    } else if (e.target.value === '') {
      setQuantity(0); // Allow empty input temporarily for user to type
    }
  };

  const handleAddToCart = async () => {
    if (!selectedProduct || quantity <= 0) {
      toast.error('Please select a product and a valid quantity.');
      return;
    }

    if (!session) {
      setIsAuthDialogOpen(true);
      return;
    }

    setIsProcessingPayment(true);
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: selectedProduct.id,
          quantity: quantity,
          price: selectedProduct.price,
          name: selectedProduct.name,
          image: selectedProduct.image,
          isKaspersky: true, // Indicate it's a Kaspersky product
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add to cart');
      }

      toast.success(`${quantity} x ${selectedProduct.name} added to your cart.`);
      router.push('/cart'); // Redirect to cart page
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      toast.error(error.message || 'Failed to add product to cart.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // PayPal integration functions
  const createOrder = async (data: any, actions: any) => {
    if (!selectedProduct || quantity <= 0) {
      toast.error('Please select a product and a valid quantity.');
      throw new Error('Invalid product or quantity for PayPal order.');
    }

    if (!session) {
      setIsAuthDialogOpen(true);
      throw new Error('User not authenticated for PayPal order.');
    }

    try {
      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [{
            id: selectedProduct.id,
            name: selectedProduct.name,
            quantity: quantity,
            price: selectedProduct.price,
            isKaspersky: true,
          }],
          totalAmount: (selectedProduct.price * quantity).toFixed(2),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create PayPal order');
      }

      const order = await response.json();
      return order.paypalOrderId; // Return the PayPal order ID
    } catch (error: any) {
      console.error('Error creating PayPal order:', error);
      toast.error(error.message || 'Failed to create PayPal order. Please try again.');
      throw error; // Re-throw to stop PayPal flow
    }
  };

  const onApprove = async (data: any, actions: any) => {
    setIsProcessingPayment(true);
    try {
      const response = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderID: data.orderID,
          items: [{
            id: selectedProduct!.id,
            name: selectedProduct!.name,
            quantity: quantity,
            price: selectedProduct!.price,
            isKaspersky: true,
          }],
          totalAmount: (selectedProduct!.price * quantity).toFixed(2),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to capture PayPal order');
      }

      const orderDetails = await response.json();
      toast.success(`Your order ${orderDetails.orderId} has been placed.`);
      router.push(`/order-confirmation?orderId=${orderDetails.orderId}`);
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
            <ul className="space-y-2 text-sm text-muted-foreground">
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

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={isProcessingPayment || isLoadingSession || quantity <= 0}
                  className="flex-1 py-3 text-lg bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isProcessingPayment ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <ShoppingCart className="mr-2 h-5 w-5" />
                  )}
                  Add to Cart
                </Button>
                {/* PayPal Buttons */}
                <div className="flex-1">
                  {isPending ? (
                    <div className="flex items-center justify-center py-3 bg-gray-200 rounded-md">
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Loading PayPal...
                    </div>
                  ) : (
                    <PayPalButtons
                      style={{ layout: "vertical", color: "blue", shape: "rect", label: "paypal" }}
                      createOrder={createOrder}
                      onApprove={onApprove}
                      onError={onError}
                      onCancel={onCancel}
                      disabled={isProcessingPayment || isLoadingSession || quantity <= 0}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="text-center py-12 bg-secondary rounded-lg shadow-inner">
        <h2 className="text-3xl font-bold mb-6 text-primary">Why Choose Kaspersky Endpoint Security?</h2>
        <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          <div className="flex flex-col items-center p-4">
            <Shield className="w-12 h-12 text-blue-600 mb-3" />
            <h3 className="text-xl font-semibold mb-2">Robust Protection</h3>
            <p className="text-muted-foreground">Multi-layered security against all cyber threats.</p>
          </div>
          <div className="flex flex-col items-center p-4">
            <Award className="w-12 h-12 text-green-600 mb-3" />
            <h3 className="text-xl font-semibold mb-2">Award-Winning</h3>
            <p className="text-muted-foreground">Recognized by industry experts for superior performance.</p>
          </div>
          <div className="flex flex-col items-center p-4">
            <Headset className="w-12 h-12 text-purple-600 mb-3" />
            <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
            <p className="text-muted-foreground">Expert assistance whenever you need it.</p>
          </div>
          <div className="flex flex-col items-center p-4">
            <DollarSign className="w-12 h-12 text-yellow-600 mb-3" />
            <h3 className="text-xl font-semibold mb-2">Cost-Effective</h3>
            <p className="text-muted-foreground">Premium security solutions at competitive prices.</p>
          </div>
        </div>
      </section>

      <AuthDialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen} />
    </div>
  );
}