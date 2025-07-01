"use client"

import React, { useState } from "react"
import Image from "next/image"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { Minus, Plus, Trash2, ShoppingCart, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart()
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  // Helper function to ensure image paths are correct
  const getCorrectedImagePath = (path: string | undefined) => {
    if (!path) {
      return "/placeholder.jpg";
    }
    if (path.startsWith('/images/') || path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    return `/images/${path}`;
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: cartItems }),
      });

      const data = await response.json();

      if (response.ok && data.checkoutUrl) {
        // Redirect to the WordPress checkout page
        window.location.href = data.checkoutUrl;
      } else {
        toast.error(data.error || 'Failed to create checkout session.');
        setIsCheckingOut(false);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error('An error occurred while trying to check out.');
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingCart className="mx-auto h-24 w-24 text-gray-400 mb-6" />
          <p className="text-xl text-gray-600 mb-4">Your cart is empty.</p>
          <Link href="/shop">
            <Button className="bg-[#1e73be] hover:bg-[#1a63a3] text-white">
              Start Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white shadow-sm rounded-lg p-6">
            <div className="hidden md:grid grid-cols-5 text-xs font-semibold text-gray-500 uppercase border-b pb-4 mb-4">
              <div className="col-span-2">Product</div>
              <div>Price</div>
              <div>Quantity</div>
              <div>Total</div>
            </div>
            {cartItems.map(item => (
              <div key={item.id} className="grid grid-cols-1 md:grid-cols-5 items-center gap-4 py-4 border-b last:border-b-0">
                <div className="col-span-2 flex items-center">
                  <Image
                    src={getCorrectedImagePath(Array.isArray(item.image) ? item.image[0] : item.image)}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="rounded-md object-cover mr-4"
                  />
                  <div>
                    <h2 className="font-medium text-gray-900">{item.name}</h2>
                  </div>
                </div>
                <div className="text-gray-700">{item.price}</div>
                <div className="flex items-center border border-gray-300 rounded w-fit">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-2 h-auto"
                  >
                    <Minus size={16} />
                  </Button>
                  <span className="px-3 text-sm">{item.quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-2 h-auto"
                  >
                    <Plus size={16} />
                  </Button>
                </div>
                <div className="font-semibold text-gray-900">
                  ${(parseFloat(item.price.replace(/[^0-9.-]+/g, "")) * item.quantity).toFixed(2)}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 hover:text-red-700 p-2 h-auto justify-self-end md:justify-self-auto"
                >
                  <Trash2 size={18} />
                </Button>
              </div>
            ))}
            <div className="flex justify-end mt-6">
              <Button
                variant="outline"
                onClick={clearCart}
                className="text-gray-600 hover:bg-gray-100"
              >
                Clear Cart
              </Button>
            </div>
          </div>

          <div className="lg:col-span-1 bg-white shadow-sm rounded-lg p-6 h-fit">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Cart Summary</h2>
            <div className="flex justify-between items-center text-lg font-medium text-gray-800 mb-4">
              <span>Subtotal:</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="text-sm text-gray-600 mb-6">
              Shipping and taxes calculated at checkout.
            </div>
            <Button 
              size="lg" 
              className="w-full bg-[#1e73be] hover:bg-[#1a63a3] text-white"
              onClick={handleCheckout}
              disabled={isCheckingOut}
            >
              {isCheckingOut ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirecting...
                </>
              ) : (
                'Proceed to Checkout'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}