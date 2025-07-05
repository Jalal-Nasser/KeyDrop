"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { Product } from "@/types/product"
import { useEffect, useState } from "react"
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser" // Import client-side Supabase client

const getImagePath = (image: string | string[] | undefined): string => {
  if (!image) return "/placeholder.jpg"
  if (Array.isArray(image)) return image[0]
  return image
}

export default function ShopPage() {
  const { addToCart } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createSupabaseBrowserClient()

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("id", { ascending: true })

      if (error) {
        console.error("Error fetching products:", error)
        setError(error.message)
      } else {
        setProducts(data as Product[])
      }
      setLoading(false)
    }
    fetchProducts()
  }, [supabase])

  if (loading) {
    return (
      <div className="container mx-auto text-center py-20">
        <p>Loading products...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto text-center py-20">
        <p className="text-red-500">Error: {error}</p>
      </div>
    )
  }

  return (
    <main>
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Shop</h1>
            <p className="text-lg text-gray-600">
              Browse our complete collection of digital solutions and software.
            </p>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map((product) => (
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
                    {product.is_on_sale && product.sale_percent && (
                      <div className="absolute top-2 left-2 z-10">
                        <span className="text-white text-xs px-2 py-1 rounded" style={{ backgroundColor: "#dc3545" }}>
                          SALE {product.sale_percent}%
                        </span>
                      </div>
                    )}
                  </Link>

                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-semibold text-gray-800 mb-2 h-12 line-clamp-2">
                      <Link href={`/product/${product.id}`} className="hover:text-blue-600 transition-colors">
                        {product.name}
                      </Link>
                    </h3>
                    
                    <div className="mt-auto">
                      <div className="text-lg font-bold text-blue-600 mb-4">
                        {product.is_on_sale && product.sale_price ? (
                          <>
                            <span className="line-through text-gray-500 mr-2">${parseFloat(product.price).toFixed(2)}</span>
                            <span>${parseFloat(product.sale_price).toFixed(2)}</span>
                          </>
                        ) : (
                          <span>${parseFloat(product.price).toFixed(2)}</span>
                        )}
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
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No products available at the moment.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}