"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Loader2, Wallet } from "lucide-react"
import { CartItem } from "@/types/cart"
import { createWalletOrder } from "@/app/checkout/actions"

interface WalletCheckoutButtonProps {
  cartItems: CartItem[]
  cartTotal: number
  targetUserId: string
  isFormValid: boolean
}

export function WalletCheckoutButton({ cartItems, cartTotal, targetUserId, isFormValid }: WalletCheckoutButtonProps) {
  const router = useRouter()
  const { clearCart } = useCart()
  const [isLoading, setIsLoading] = useState(false)

  const handleWalletCheckout = async () => {
    if (!isFormValid) {
      toast.error("You must agree to the terms and conditions to proceed.");
      return;
    }
    
    if (!targetUserId) {
      toast.error("A target user must be selected for this transaction.")
      return
    }

    setIsLoading(true)
    const toastId = toast.loading("Processing wallet order...")

    try {
      const result = await createWalletOrder({
        cartItems,
        cartTotal,
        targetUserId,
      })

      if (!result.success || !result.orderId) {
        throw new Error(result.message || "Failed to create order.")
      }

      toast.success("Order created successfully!", { id: toastId })
      clearCart()
      
      router.push(`/account/orders/${result.orderId}`)

    } catch (error: any) {
      console.error("Wallet checkout error:", error)
      toast.error(`Error: ${error.message}`, { id: toastId })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleWalletCheckout}
      disabled={isLoading || !isFormValid}
      className="w-full bg-green-600 hover:bg-green-700"
      type="button"
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Wallet className="mr-2 h-4 w-4" />
      )}
      Complete with Wallet
    </Button>
  )
}