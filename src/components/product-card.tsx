"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card"
import { ShoppingCart, Minus, Plus, Heart } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { getImagePath } from "@/lib/utils"
import { Product } from "@/types/product"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useCart()

  const handleAddToCart = () => {
    addToCart(product, quantity)
  }

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(Math.max(1, newQuantity)) // Ensure quantity is at least 1
  }

  const displayPrice = product.is_on_sale && product.sale_price !== null && product.sale_price !== undefined
    ? product.sale_price.toFixed(2)
    : parseFloat(product.price).toFixed(2);

  const originalPrice = parseFloat(product.price).toFixed(2);

  return (
    <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 relative">
      {product.is_on_sale && product.sale_percent !== null && product.sale_percent !== undefined && (
        <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-sm z-10">
          SALE {product.sale_percent}%
        </div>
      )}
      <Link href={`/product/${product.id}`} className="relative block h-48 w-full overflow-hidden flex items-center justify-center bg-white p-4">
        <Image
          src={getImagePath(product.image)}
          alt={product.name}
          fill
          style={{ objectFit: "contain" }}
        />
      </Link>
      <CardContent className="flex-grow p-4 text-center">
        <CardTitle className="text-sm font-semibold mb-2 line-clamp-2">
          <Link href={`/product/${product.id}`} className="hover:text-blue-600 transition-colors">
            {product.name}
          </Link>
        </CardTitle>
        <div className="text-gray-700 font-bold text-xl">
          {product.is_on_sale && product.sale_price !== null && product.sale_price !== undefined ? (
            <>
              <span className="line-through text-gray-400 text-base mr-2">${originalPrice}</span>
              <span className="text-blue-600">${displayPrice}</span>
            </>
          ) : (
            `$${displayPrice}`
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col items-center space-y-4">
        <Button variant="outline" className="w-full">
          QUICK VIEW
        </Button>
        <div className="flex items-center justify-between w-full">
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
          <Button
            className="bg-[#1e73be] hover:bg-[#28a645] text-white p-2 rounded-md"
            size="icon"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-5 w-5" />
          </Button>
          {/* Optional: Wishlist icon - uncomment and add functionality if needed */}
          {/* <Button variant="ghost" size="icon" className="ml-2">
            <Heart className="h-5 w-5 text-gray-500 hover:text-red-500" />
          </Button> */}
        </div>
      </CardFooter>
    </Card>
  )
}