"use client"

import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { Product } from "@/types/product"
import { useCart } from "@/context/cart-context"
import Image from "next/image"
import { getImagePath } from "@/lib/utils"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Database } from "@/types/supabase"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { ProductCard } from "./product-card" // New import

export default function WeeklyProducts({ title }: { title: string }) {
  const { addToCart } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_most_sold", true) // Filter by the new column
        .order("id", { ascending: true })
        .limit(8) // Changed limit to 8 to fit 4-column layout

      if (error) {
        console.error("Error fetching weekly products:", error)
        setError(error.message)
      } else {
        setProducts(data || [])
      }
      setLoading(false)
    }

    fetchProducts()
  }, [supabase])

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">{title}</h2>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="ml-4">Loading products...</p>
          </div>
        ) : error ? (
          <p className="text-sm text-red-500 text-center mt-2">
            Error: {error}
          </p>
        ) : products.length === 0 ? (
          <p className="text-center text-muted-foreground">No products found for this section.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"> {/* Changed lg:grid-cols-3 to lg:grid-cols-4 */}
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}