"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react"
import { toast } from "sonner"

// Define the types for our products and cart items
interface Product {
  id: number // Changed to number
  name: string
  price: string // e.g., "$25.00"
  image?: string | string[]
}

interface CartItem extends Product {
  quantity: number
}

// Define the shape of our cart context
interface CartContextType {
  cartItems: CartItem[]
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: number) => void // Changed to number
  updateQuantity: (productId: number, quantity: number) => void // Changed to number
  cartCount: number
  cartTotal: number
  clearCart: () => void
}

// Create the context
const CartContext = createContext<CartContextType | undefined>(undefined)

// Helper function to parse price strings like "$25.00" into numbers
const parsePrice = (price: string): number => {
  if (!price) return 0
  return parseFloat(price.replace(/[^0-9.-]+/g, ""))
}

// Create the provider component that will wrap our application
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  // Load cart from localStorage on initial render to persist it between sessions
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

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems))
  }, [cartItems])

  // Function to add a product to the cart
  const addToCart = (product: Product, quantity: number = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id)
      if (existingItem) {
        // If item already exists, just update its quantity
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        // Otherwise, add the new item to the cart
        return [...prevItems, { ...product, quantity }]
      }
    })
    toast.success(`${product.name} added to cart!`)
  }

  // Function to remove a product from the cart
  const removeFromCart = (productId: number) => { // Changed to number
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId))
    toast.info("Item removed from cart.")
  }

  // Function to update the quantity of an item already in the cart
  const updateQuantity = (productId: number, quantity: number) => { // Changed to number
    if (quantity <= 0) {
      removeFromCart(productId)
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      )
    }
  }
  
  // Function to clear the entire cart
  const clearCart = () => {
    setCartItems([])
    toast.info("Cart cleared.")
  }

  // Calculate the total number of items in the cart
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0)
  
  // Calculate the total price of all items in the cart
  const cartTotal = cartItems.reduce((total, item) => {
    const price = parsePrice(item.price)
    return total + price * item.quantity
  }, 0)

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        cartCount,
        cartTotal,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

// Create a custom hook for easy access to the cart context
export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}