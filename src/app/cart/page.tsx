"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { PromoCodeForm } from "@/components/promo-code-form"
import { Trash2, Minus, Plus, ShieldCheck } from "lucide-react"
import { getImagePath } from "@/lib/utils" // Updated import

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

export default function CartPage() {
  const router = useRouter()
  const { cartItems, cartTotal, cartCount, updateQuantity, removeFromCart, clearCart } = useCart()

  if (cartCount === 0) {
    return (
      <div className="container mx-auto text-center py-20">
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
    <div className="bg-white dark:bg-background">
      <div className="container mx-auto px-4 py-8">
        <Stepper step={1} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2">
            <div className="border rounded-lg p-6">
              <div className="hidden md:grid md:grid-cols-5 gap-4 font-semibold text-muted-foreground uppercase text-sm mb-4">
                <div className="col-span-2">Product</div>
                <div>Price</div>
                <div>Quantity</div>
                <div className="text-right">Subtotal</div>
              </div>
              <Separator className="hidden md:block mb-4" />
              <div className="space-y-6">
                {cartItems.map(item => (
                  <div key={item.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                    <div className="col-span-2 flex items-center gap-4">
                      <div className="relative h-20 w-20 rounded-md overflow-hidden border bg-white flex-shrink-0">
                        <Image src={getImagePath(item.image)} alt={item.name} fill sizes="80px" className="object-contain p-1" />
                      </div>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <Button variant="link" size="sm" className="text-red-500 p-0 h-auto" onClick={() => removeFromCart(item.id)}>
                          Remove
                        </Button>
                      </div>
                    </div>
                    <div className="font-medium">${parseFloat(item.price.replace(/[^0-9.-]+/g, "")).toFixed(2)}</div>
                    <div>
                      <div className="flex items-center border rounded-md w-fit">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value, 10) || 1)}
                          className="w-12 h-8 text-center border-x border-y-0 focus-visible:ring-0"
                        />
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="font-medium text-right">${(parseFloat(item.price.replace(/[^0-9.-]+/g, "")) * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>
              <Separator className="my-6" />
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="w-full md:w-auto">
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
                <div className="flex justify-between"><span>Subtotal</span><span>${cartTotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Process Fees (15%)</span><span>${processingFee.toFixed(2)}</span></div>
                <Separator />
                <div className="flex justify-between font-bold text-lg"><span>Total</span><span>${finalCartTotal.toFixed(2)}</span></div>
                <Button className="w-full bg-gray-800 hover:bg-gray-900 text-white" size="lg" onClick={() => router.push('/checkout')}>
                  Proceed to Checkout
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/shop">Continue Shopping</Link>
                </Button>
              </CardContent>
            </Card>
            <div className="border rounded-lg p-6 text-center">
              <p className="font-semibold text-sm uppercase text-muted-foreground">Guaranteed Safe Checkout</p>
              <div className="flex justify-center items-center gap-4 mt-4 text-muted-foreground">
                <ShieldCheck />
                <p className="text-xs">Your Payment is 100% Secure</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}