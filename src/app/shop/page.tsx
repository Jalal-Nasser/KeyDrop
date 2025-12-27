import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { getProducts } from "@/app/actions/products"
import { ProductGrid } from "@/components/product-grid"

// Keep this component as Server Component to fetch data
export default async function ShopPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const allProducts = await getProducts()

  // Simple server-side search filtering
  const search = typeof searchParams.search === 'string' ? searchParams.search.toLowerCase() : null

  const products = search
    ? allProducts.filter(p => p.name.toLowerCase().includes(search))
    : allProducts

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Our Products</h1>
      <Suspense fallback={
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="ml-4">Loading products...</p>
        </div>
      }>
        {products.length === 0 ? (
          <p className="text-center text-muted-foreground">No products found.</p>
        ) : (
          <ProductGrid products={products} />
        )}
      </Suspense>
    </div>
  )
}