"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useSession } from "@/context/session-context"
import { Product } from "@/types/product"
import { toast } from "sonner"

interface WishlistItem {
  id: string // wishlist_item ID
  product_id: number
  products: Product // Joined product data
}

interface WishlistContextType {
  wishlistItems: WishlistItem[]
  wishlistCount: number
  addToWishlist: (product: Product) => Promise<void>
  removeFromWishlist: (productId: number) => Promise<void>
  isProductInWishlist: (productId: number) => boolean
  isLoadingWishlist: boolean
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { session, supabase, isLoading: isLoadingSession } = useSession()
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(true)

  useEffect(() => {
    const fetchWishlist = async () => {
      if (isLoadingSession) return // Wait for session to load

      if (!session) {
        setWishlistItems([]) // Clear wishlist if no session
        setIsLoadingWishlist(false)
        return
      }

      setIsLoadingWishlist(true)
      const { data, error } = await supabase
        .from("wishlist_items")
        .select(`
          id,
          product_id,
          products (
            id, name, description, price, image, is_digital, download_url,
            sale_price, is_on_sale, sale_percent, sku, tag, category, is_most_sold
          )
        `)
        .eq("user_id", session.user.id)

      if (error) {
        console.error("Error fetching wishlist:", error)
        toast.error("Failed to load your wishlist.")
        setWishlistItems([])
      } else {
        // Filter out items where product data might be null (e.g., if product was deleted)
        const validItems = data.filter(item => item.products !== null) as WishlistItem[]
        setWishlistItems(validItems)
      }
      setIsLoadingWishlist(false)
    }

    fetchWishlist()
  }, [session, supabase, isLoadingSession])

  const addToWishlist = async (product: Product) => {
    if (!session) {
      toast.info("Please sign in to add items to your wishlist.")
      return
    }
    if (isProductInWishlist(product.id)) {
      toast.info(`${product.name} is already in your wishlist.`)
      return
    }

    const toastId = toast.loading(`Adding ${product.name} to wishlist...`)
    try {
      const { error } = await supabase.from("wishlist_items").insert({
        user_id: session.user.id,
        product_id: product.id,
      })

      if (error) {
        if (error.code === '23505') { // Unique violation code
          toast.info(`${product.name} is already in your wishlist.`, { id: toastId })
        } else {
          throw error
        }
      } else {
        // Re-fetch or optimistically update
        const { data: newItem, error: fetchError } = await supabase
          .from("wishlist_items")
          .select(`
            id,
            product_id,
            products (
              id, name, description, price, image, is_digital, download_url,
              sale_price, is_on_sale, sale_percent, sku, tag, category, is_most_sold
            )
          `)
          .eq("user_id", session.user.id)
          .eq("product_id", product.id)
          .single()

        if (fetchError || !newItem?.products) {
          console.error("Error fetching new wishlist item:", fetchError)
          toast.error(`Added ${product.name} to wishlist, but failed to update list. Please refresh.`, { id: toastId })
        } else {
          setWishlistItems(prev => [...prev, newItem as WishlistItem])
          toast.success(`${product.name} added to wishlist!`, { id: toastId })
        }
      }
    } catch (error: any) {
      console.error("Error adding to wishlist:", error)
      toast.error(`Failed to add ${product.name} to wishlist: ${error.message}`, { id: toastId })
    }
  }

  const removeFromWishlist = async (productId: number) => {
    if (!session) {
      toast.error("You must be signed in to manage your wishlist.")
      return
    }

    const itemToRemove = wishlistItems.find(item => item.product_id === productId)
    if (!itemToRemove) {
      toast.info("Product not found in your wishlist.")
      return
    }

    const toastId = toast.loading(`Removing ${itemToRemove.products.name} from wishlist...`)
    try {
      const { error } = await supabase
        .from("wishlist_items")
        .delete()
        .eq("user_id", session.user.id)
        .eq("product_id", productId)

      if (error) {
        throw error
      } else {
        setWishlistItems(prev => prev.filter(item => item.product_id !== productId))
        toast.success(`${itemToRemove.products.name} removed from wishlist.`, { id: toastId })
      }
    } catch (error: any) {
      console.error("Error removing from wishlist:", error)
      toast.error(`Failed to remove product from wishlist: ${error.message}`, { id: toastId })
    }
  }

  const isProductInWishlist = (productId: number) => {
    return wishlistItems.some(item => item.product_id === productId)
  }

  const wishlistCount = wishlistItems.length

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount,
        addToWishlist,
        removeFromWishlist,
        isProductInWishlist,
        isLoadingWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}