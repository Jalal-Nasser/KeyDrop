"use client"

import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { Product } from "@/types/product"
import { useCart } from "@/context/cart-context"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardTitle } from "./ui/card"
import { getImagePath } from "@/lib/utils"
import { ProductCard } from "./product-card" // New import

export function ProductGrid({ products }: { products: Product[] }) {
  const { addToCart } = useCart()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}