"use client"

import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { Product } from "@/types/product"
import { useCart } from "@/context/cart-context"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardTitle } from "./ui/card"
import { getImagePath } from "@/lib/utils"

export function ProductGrid({ products }: { products: Product[] }) {
  const { addToCart } = useCart()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
      {products.map((product) => (
        <Card key={product.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
          <Link href={`/product/${product.id}`} className="relative block h-48 w-full overflow-hidden">
            <Image
              src={getImagePath(product.image)}
              alt={product.name}
              fill
              className="object-contain p-4"
            />
          </Link>
          <CardContent className="flex-grow p-4">
            <CardTitle className="text-lg font-semibold mb-2 line-clamp-2">
              <Link href={`/product/${product.id}`} className="hover:text-blue-600 transition-colors">
                {product.name}
              </Link>
            </CardTitle>
            <p className="text-gray-700 font-bold text-xl">${parseFloat(product.price).toFixed(2)}</p>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Button
              className="w-full text-white bg-[#805da8] hover:bg-[#6a4a8a]" // Applied custom color and a darker hover state using Tailwind classes
              onClick={() => addToCart(product)}
            >
              <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}