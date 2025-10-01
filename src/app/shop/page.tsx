"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { ProductGrid } from "@/components/product-grid"
import { Product } from "@/types/product"
import { Loader2 } from "lucide-react"
import { useSupabase } from "@/hooks/useSupabase" // Import the client-only hook

// This component contains the logic that uses useSearchParams
function ShopContent() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const supabase = useSupabase() // Get the Supabase client using the client-only hook

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      setError(null)
      
      // Add a null check for supabase here, as it's initialized asynchronously
      if (!supabase) {
        setError("Supabase client not initialized. Please try again.");
        setLoading(false);
        return;
      }

      const searchQuery = searchParams.get("search")

      let query = supabase.from("products").select("*")

      if (searchQuery) {
        query = query.ilike("name", `%${searchQuery}%`)
      }

      const { data, error } = await query.order("id", { ascending: true })

      if (error) {
        console.error("Error fetching products:", error)
        setError(error.message)
      } else {
        setProducts(data as Product[] || []) // Cast to Product[]
      }
      setLoading(false)
    }

    fetchProducts()
  }, [searchParams, supabase]) // `supabase` is now a dependency from the hook

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Our Products</h1>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="ml-4">Loading products...</p>
        </div>
      ) : error ? (
        <p className="text-sm text-red-500 mt-2">
          Error: {error}
        </p>
      ) : products.length === 0 ? (
        <p className="text-center text-muted-foreground">No products found.</p>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  )
}

// The main page component wraps ShopContent in Suspense
export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="ml-4 text-lg text-muted-foreground">Loading shop...</p>
      </div>
    }>
      <ShopContent />
    </Suspense>
  )
}