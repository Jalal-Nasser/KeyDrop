import { ProductCard } from "@/components/product-card"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Database } from "@/types/supabase"

export default async function ShopPage() {
  const supabase = createServerComponentClient<Database>({ cookies })
  
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching products:", error)
    return (
      <div className="container mx-auto py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Error Loading Products</h2>
        <p className="text-muted-foreground">
          We're having trouble loading products. Please try again later.
        </p>
      </div>
    )
  }

  return (
    <main className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Shop All Products</h1>
      
      {products?.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products available yet.</p>
        </div>
      )}
    </main>
  )
}