"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { Product } from "@/types/product"

const getImagePath = (image: string | string[] | undefined): string => {
  if (!image) return "/placeholder.jpg"
  if (Array.isArray(image)) return image[0]
  return image
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()

  return (
    <div
      key={product.id}
      className="bg-white border border-gray-200 rounded-lg overflow-hidden group flex flex-col text-center hover:shadow-xl transition-shadow duration-300"
    >
      <Link href={`/product/${product.id}`} className="block relative">
        <div className="aspect-square bg-gray-50 relative overflow-hidden">
          <Image
            src={getImagePath(product.image)}
            alt={product.name}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold text-gray-800 mb-2 h-12 line-clamp-2">
          <Link href={`/product/${product.id}`} className="hover:text-blue-600 transition-colors">
            {product.name}
          </Link>
        </h3>
        
        <div className="mt-auto">
          <div className="text-lg font-bold text-blue-600 mb-4">
            <span>{product.price}</span>
          </div>
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={() => addToCart(product)}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  )
}