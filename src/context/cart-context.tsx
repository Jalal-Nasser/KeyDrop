"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

export type CartItem = {
    id: string
    name: string
    price: number
    image: string | null
    quantity: number
}

type CartContextType = {
    items: CartItem[]
    addToCart: (product: { id: string; name: string; price: number; image: string | null }) => void
    removeFromCart: (id: string) => void
    clearCart: () => void
    cartCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])

    // Load cart from local storage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem("cart")
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart))
            } catch (e) {
                console.error("Failed to parse cart from local storage")
            }
        }
    }, [])

    // Save cart to local storage whenever it changes
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(items))
    }, [items])

    const addToCart = (product: { id: string; name: string; price: number; image: string | null }) => {
        setItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.id === product.id)
            if (existingItem) {
                return prevItems.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                )
            }
            return [...prevItems, { ...product, quantity: 1 }]
        })
    }

    const removeFromCart = (id: string) => {
        setItems((prevItems) => prevItems.filter((item) => item.id !== id))
    }

    const clearCart = () => {
        setItems([])
    }

    const cartCount = items.reduce((total, item) => total + item.quantity, 0)

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, cartCount }}>
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
