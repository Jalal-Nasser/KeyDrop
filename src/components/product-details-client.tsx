"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { PayPalButton } from "@/components/paypal-button"
import { Product } from "@/types/product"
import { useCart } from "@/context/cart-context"

const getImagePath = (image: string | string[] | undefined): string => {
  if (!image) return "/placeholder.jpg"
  if (Array.isArray(image)) return image[0]
  return image
}

interface ProductDetailsClientProps {
  product: Product;
}

export function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useCart()

  const handleQuantityChange = (amount: number) => {
    setQuantity((prev) => Math.max(1, prev + amount))
  }

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity)
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 lg:gap-12 bg-white p-6 rounded-lg shadow-md">
      {/* Product Image */}
      <div className="md:w-1/2 flex items-center justify-center bg-gray-50 rounded-lg p-4">
        <Image
          src={getImagePath(product.image)}
          alt={product.name}
          width={500}
          height={500}
          className="object-contain max-h-[500px] w-full"
        />
      </div>

      {/* Product Details */}
      <div className="md:w-1/2 flex flex-col">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {product.name}
        </h1>

        <p className="text-3xl font-semibold text-blue-600 mb-6">
          {product.price}
        </p>

        <div
          className="text-base text-gray-700 mb-8 prose prose-lg max-h-60 overflow-y-auto"
          dangerouslySetInnerHTML={{ __html: product.description || "" }}
        />

        <div className="mt-auto pt-6 border-t border-gray-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center border border-gray-300 rounded-md">
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 text-lg"
                onClick={() => handleQuantityChange(-1)}
              >
                -
              </Button>
              <span className="w-16 text-center font-medium text-lg">
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 text-lg"
                onClick={() => handleQuantityChange(1)}
              >
                +
              </Button>
            </div>
            <Button
              size="lg"
              className="flex-1 h-12 text-base"
              style={{ backgroundColor: "#1e73be" }}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
          </div>
          <PayPalButton product={product} quantity={quantity} />
        </div>
      </div>
    </div>
  )
}