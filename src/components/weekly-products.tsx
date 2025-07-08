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
        .order("id", { ascending: true })
        .limit(9) // Fetch 9 products for the weekly section

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"> {/* Changed lg:grid-cols-4 to lg:grid-cols-3 */}
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
                  <Button className="w-full" onClick={() => addToCart(product)} style={{ backgroundColor: "#805da8" }}>
                    <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}