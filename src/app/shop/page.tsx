import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { Product } from "@/types/product"
import { createSupabaseServerClient } from "@/lib/supabaseServer"
import { ProductCard } from "@/components/product-card"

export default async function ShopPage() {
  const supabase = createSupabaseServerClient()
  let products: Product[] | null = null;
  let fetchError: string | null = null;

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Error fetching products for shop page:", error);
      fetchError = error.message;
    } else {
      products = data as Product[];
    }
  } catch (e: any) {
    console.error("Unexpected error during product fetch:", e);
    fetchError = e.message || "An unexpected error occurred.";
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

          {fetchError ? (
            <div className="text-center py-12">
              <p className="text-red-500 text-lg">Error loading products: {fetchError}</p>
              <p className="text-gray-600 text-md mt-2">Please ensure your Supabase environment variables are correctly configured and your database is accessible.</p>
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
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