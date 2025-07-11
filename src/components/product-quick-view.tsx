"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ShoppingCart, Minus, Plus, Heart } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { useWishlist } from "@/context/wishlist-context"
import { getImagePath } from "@/lib/utils"
import { Product } from "@/types/product"
import { Separator } from "./ui/separator"

interface ProductQuickViewProps {
  product: Product
}

export function ProductQuickView({ product }: ProductQuickViewProps) {
  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isProductInWishlist } = useWishlist()

  const handleAddToCart = () => {
    addToCart(product, quantity)
  }

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(Math.max(1, newQuantity)) // Ensure quantity is at least 1
  }

  const handleWishlistToggle = () => {
    if (isProductInWishlist(product.id)) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(product)
    }
  }

  const displayPrice = product.is_on_sale && product.sale_price !== null && product.sale_price !== undefined
    ? product.sale_price.toFixed(2)
    : product.price.toFixed(2);

  const originalPrice = product.price.toFixed(2);

  const imagePath = getImagePath(product.image);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
      <div className="relative h-64 w-full bg-white rounded-lg overflow-hidden flex items-center justify-center border">
        <Image
          src={imagePath}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain"
        />
      </div>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
        <div className="text-gray-700 font-bold text-2xl">
          {product.is_on_sale && product.sale_price !== null && product.sale_price !== undefined ? (
            <>
              <span className="line-through text-gray-400 text-lg mr-2">${originalPrice}</span>
              <span className="text-blue-600">${displayPrice}</span>
            </>
          ) : (
            `$${displayPrice}`
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-3" dangerouslySetInnerHTML={{ __html: product.description || "No description available." }} />

        <Separator />

        <div className="flex items-center space-x-4">
          <label htmlFor="quick-view-quantity" className="font-medium">Quantity:</label>
          <div className="flex items-center border rounded-md">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleQuantityChange(quantity - 1)}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              type="number"
              id="quick-view-quantity"
              min="1"
              value={quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
              className="w-12 h-8 text-center border-x border-y-0 focus-visible:ring-0"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleQuantityChange(quantity + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button className="flex-1" onClick={handleAddToCart}>
            <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleWishlistToggle}
          >
            <Heart className={isProductInWishlist(product.id) ? "mr-2 h-4 w-4 text-red-500 fill-red-500" : "mr-2 h-4 w-4 text-gray-500"} />
            {isProductInWishlist(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
          </Button>
        </div>
        <Button asChild variant="link" className="w-full">
          <Link href={`/product/${product.id}`}>View Full Details</Link>
        </Button>
      </div>
    </div>
  )
}