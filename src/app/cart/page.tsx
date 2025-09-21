"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Minus, Plus, ShoppingCart, Trash2, ArrowLeft, CheckCircle, Shield, Truck, RefreshCw, Tag, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { getImagePath } from "@/lib/utils"
// Using CSS transitions instead of framer-motion
const AnimatedDiv = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`transition-all duration-300 ${className}`}>{children}</div>
);

const Stepper = ({ step }: { step: number }) => {
  const steps = ["Shopping Cart", "Checkout", "Order Status"]
  return (
    <div className="flex items-center justify-center w-full py-8">
      <div className="flex items-center justify-between w-full max-w-2xl">
        {steps.map((name, index) => (
          <React.Fragment key={name}>
            <div className="flex flex-col items-center text-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full text-lg font-bold ${
                  index + 1 === step
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {index + 1}
              </div>
              <p
                className={`mt-2 text-sm font-semibold uppercase tracking-wider ${
                  index + 1 === step ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {name}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 bg-border mx-4" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

// Simple promo code form component
const PromoCodeForm = () => {
  const [promoCode, setPromoCode] = React.useState('')
  const [isValid, setIsValid] = React.useState<boolean | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simple validation - in a real app, you would validate with your backend
    if (promoCode.trim()) {
      setIsValid(true)
      toast.success('Promo code applied successfully!')
    } else {
      setIsValid(false)
      toast.error('Please enter a valid promo code')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Promo code"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <Button type="submit" variant="outline">
          Apply
        </Button>
      </div>
      {isValid === false && (
        <p className="mt-1 text-xs text-red-500">Invalid promo code</p>
      )}
    </form>
  )
}

const CartItem = ({ item, onUpdateQuantity, onRemove }: { item: any; onUpdateQuantity: (id: number, quantity: number) => void; onRemove: (id: number) => void }) => {
  const isOnSale = item.is_on_sale && item.sale_price !== null && item.sale_price !== undefined;
  const itemTotal = isOnSale ? item.sale_price! * item.quantity : item.price * item.quantity;
  
  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
    >
      <div className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative h-24 w-24 md:h-28 md:w-28 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-700 flex-shrink-0">
            <Image 
              src={getImagePath(item.image)} 
              alt={item.name} 
              fill 
              sizes="(max-width: 768px) 100vw, 280px"
              className="object-contain p-2 hover:scale-105 transition-transform duration-300"
            />
            {isOnSale && (
              <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                SALE
              </span>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg line-clamp-2">
                {item.name}
              </h3>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={(e) => {
                  e.preventDefault();
                  onRemove(item.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Remove</span>
              </Button>
            </div>
            
            <div className="mt-2 flex items-center">
              <div className="flex items-center space-x-4">
                <div className="flex items-center border rounded-lg overflow-hidden">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 rounded-none" 
                    onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <div className="w-10 text-center text-sm font-medium">
                    {item.quantity}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 rounded-none"
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="flex flex-col items-end ml-auto">
                  <div className="text-right">
                    {isOnSale ? (
                      <div className="flex flex-col items-end">
                        <span className="text-gray-500 dark:text-gray-400 line-through text-sm">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                        <span className="text-red-600 dark:text-red-400 font-bold text-lg">
                          ${itemTotal.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span className="font-bold text-lg">${itemTotal.toFixed(2)}</span>
                    )}
                  </div>
                  {isOnSale && (
                    <span className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Save ${((item.price - item.sale_price!) * item.quantity).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CartPage() {
  const router = useRouter()
  const { 
    cartItems, 
    cartTotal, 
    cartCount, 
    cartSubtotal,
    discountAmount,
    updateQuantity, 
    removeFromCart, 
    clearCart 
  } = useCart()

  if (cartCount === 0) {
    return (
      <div className="container mx-auto text-center py-20 bg-background">
        <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Button asChild>
          <Link href="/shop">Continue Shopping</Link>
        </Button>
      </div>
    )
  }

  const processingFee = cartTotal * 0.15
  const finalCartTotal = cartTotal + processingFee

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-8">
        <Stepper step={1} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2">
            <div className="border rounded-lg p-6 bg-card">
              <div className="hidden md:grid md:grid-cols-5 gap-4 font-semibold text-muted-foreground uppercase text-sm mb-4">
                <div className="col-span-2">Product</div>
                <div>Price</div>
                <div>Quantity</div>
                <div className="text-right">Subtotal</div>
              </div>
              <Separator className="hidden md:block mb-4" />
              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="transition-all duration-300">
                    <CartItem 
                      item={item} 
                      onUpdateQuantity={updateQuantity} 
                      onRemove={removeFromCart} 
                    />
                  </div>
                ))}
              </div>
              <Separator className="my-6" />
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="w-full md:w-80">
                  <PromoCodeForm />
                </div>
                <Button variant="outline" onClick={clearCart}>
                  <Trash2 className="mr-2 h-4 w-4" /> Clear Shopping Cart
                </Button>
              </div>
            </div>
          </div>
          <div className="space-y-8">
            <Card>
              <CardHeader><CardTitle className="text-center">Cart Totals</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${cartSubtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Process Fees (15%)</span>
                  <span>${processingFee.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${finalCartTotal.toFixed(2)}</span>
                </div>
                <Button className="w-full bg-gray-800 hover:bg-gray-900 text-white" size="lg" onClick={() => router.push('/checkout')}>
                  Proceed to Checkout
                </Button>
                <Button variant="outline" className="w-full bg-purple-600 hover:bg-purple-700 text-white border-purple-600" asChild>
                  <Link href="/shop">Continue Shopping</Link>
                </Button>
              </CardContent>
            </Card>
            <div className="border border-green-200 rounded-lg p-6 text-center bg-green-50">
              <p className="font-semibold text-sm uppercase text-green-700">Guaranteed Safe Checkout</p>
              <div className="flex justify-center items-center gap-4 mt-4 text-muted-foreground">
                <ShieldCheck className="h-5 w-5" />
                <p className="text-xs">Your Payment is 100% Secure</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}