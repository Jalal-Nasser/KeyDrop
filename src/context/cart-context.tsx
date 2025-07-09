"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { toast } from "sonner"
import { Product } from "@/types/product"
import { CartItem } from "@/types/cart"
import { useRouter } from "next/navigation" // Import useRouter

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  cartCount: number
  cartTotal: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const router = useRouter() // Initialize useRouter

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("cart")
      if (storedCart) {
        setCartItems(JSON.parse(storedCart))
      }
    } catch (error) {
      console.error("Failed to parse cart from localStorage", error)
      setCartItems([])
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems))
  }, [cartItems])

  // Removed parsePrice as price is now consistently a number

  const addToCart = (product: Product, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id)
      let newQuantityInCart = quantity; // This will be the quantity after this operation
      const toastId = `cart-add-${product.id}`; // Unique ID for this product's toast

      if (existingItem) {
        newQuantityInCart = existingItem.quantity + quantity;
        toast.success(`${product.name} quantity updated`, {
          id: toastId,
          description: `Your cart now has ${newQuantityInCart} item(s) of ${product.name}.`,
          action: {
            label: "View Cart",
            onClick: () => router.push("/cart"),
          },
          duration: 3000,
        });
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: newQuantityInCart }
            : item
        )
      } else {
        toast.success(`${product.name} added to cart`, {
          id: toastId,
          description: `Your cart now has ${newQuantityInCart} item(s) of ${product.name}.`,
          action: {
            label: "View Cart",
            onClick: () => router.push("/cart"),
          },
          duration: 3000,
        });
        // Ensure price is stored as a number
        return [...prevItems, { ...product, quantity, price: product.price }]
      }
    })
  }

  const removeFromCart = (productId: number) => {
    setCartItems(prevItems => {
      const itemToRemove = prevItems.find(item => item.id === productId)
      if (itemToRemove) {
        toast.info(`${itemToRemove.name} removed from cart.`, {
          duration: 2000, // Shorter duration for removal
        });
      }
      return prevItems.filter(item => item.id !== productId)
    })
  }

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCartItems(prevItems => {
      const updatedItems = prevItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      );
      // No toast here, as addToCart handles updates and this is for direct quantity changes
      return updatedItems;
    });
  }

  const clearCart = () => {
    setCartItems([])
    toast.info("Your cart has been cleared.", {
      duration: 2000,
    })
  }

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0)
  const cartTotal = cartItems.reduce((total, item) => {
    // Price is now directly a number
    return total + item.price * item.quantity
  }, 0)

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}