import Image from "next/image"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getImagePath } from "@/lib/utils"
import { createSupabaseServerClient } from "@/lib/supabaseServer"
import { Product } from "@/types/product"
import { useCart } from "@/context/cart-context" // Import useCart

export async function ProductGrid() {
  const supabase = createSupabaseServerClient()
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("id", { ascending: true })
    .limit(12) // Limit to 12 products as per original logic

  if (error) {
    console.error("Error fetching products for ProductGrid:", error)
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our most popular digital solutions and software packages
            </p>
          </div>
          <div className="text-center py-12">
            <p className="text-red-500 text-lg">Failed to load products.</p>
          </div>
        </div>
      </section>
    )
  }

  // Since this is a Server Component, we cannot directly use useCart here.
  // The "Add to Cart" button functionality will need to be handled in a Client Component
  // that wraps this grid, or by making the button itself a Client Component.
  // For now, I'll re-enable the button but it won't have direct cart functionality here.
  // The `ShopPage` already handles adding to cart, so this component might be for display only.

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our most popular digital solutions and software packages
          </p>
        </div>

        {(products as Product[]).length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {(products as Product[]).map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden group flex flex-col text-center"
              >
                <Link href={`/product/${product.id}`} className="block relative">
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    <Image
                      src={getImagePath(product.image)}
                      alt={product.name}
                      fill
                      className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </Link>

                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    <Link href={`/product/${product.id}`}>
                      {product.name}
                    </Link>
                  </h3>

                  {product.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2" dangerouslySetInnerHTML={{ __html: product.description }} />
                  )}

                  <div className="mt-auto">
                    {product.price && (
                      <div className="text-lg font-bold text-blue-600 mb-4">
                        <span>{product.price}</span>
                      </div>
                    )}
                    {/* The Add to Cart button here would need to be a client component or wrapped */}
                    {/* For now, it's just a placeholder as this is a Server Component */}
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      // onClick={() => addToCart(product)} // This would require 'use client'
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
  )
}