"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/context/cart-context"
import { useSession } from "@/context/session-context"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Loader2, Banknote } from "lucide-react"
import { CartItem } from "@/types/cart"

interface CashCheckoutButtonProps {
  cartItems: CartItem[]
  cartTotal: number
}

export function CashCheckoutButton({ cartItems, cartTotal }: CashCheckoutButtonProps) {
  const router = useRouter()
  const { clearCart } = useCart()
  const { session, supabase } = useSession()
  const [isLoading, setIsLoading] = useState(false)

  const handleCashCheckout = async () => {
    if (!session) {
      toast.error("You must be logged in to perform this action.")
      return
    }

    setIsLoading(true)
    const toastId = toast.loading("Processing cash order...")

    try {
      // 1. Create the order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: session.user.id,
          total: cartTotal,
          status: "completed",
          payment_gateway: "cash",
          payment_id: `cash_${new Date().getTime()}`,
        })
        .select()
        .single()

      if (orderError) throw orderError

      const orderId = orderData.id

      // 2. Create order items
      const orderItemsToInsert = cartItems.map(item => ({
        order_id: orderId,
        product_id: item.id,
        quantity: item.quantity,
        price_at_purchase: item.price,
      }))

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItemsToInsert)

      if (itemsError) throw itemsError

      toast.success("Order created successfully!", { id: toastId })
      clearCart()
      router.push(`/account/orders/${orderId}`)

    } catch (error: any) {
      console.error("Cash checkout error:", error)
      toast.error(`Error: ${error.message || "Could not complete the order."}`, { id: toastId })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleCashCheckout}
      disabled={isLoading}
      className="w-full bg-green-600 hover:bg-green-700"
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Banknote className="mr-2 h-4 w-4" />
      )}
      Complete Order (Cash)
    </Button>
  )
}