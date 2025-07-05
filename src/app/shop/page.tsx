import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { Product } from "@/types/product"
import { createSupabaseServerClient } from "@/lib/supabaseServer"

const getImagePath = (image: string | string[] | undefined): string => {
  if (!image) return "/placeholder.jpg"
  if (Array.isArray(image)) return image[0]
  return image
}

export default async function ShopPage() {
  const supabase = createSupabaseServerClient()
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("id", { ascending: true })

  if (error) {
    console.error("Error fetching products:", error)
    // You might want to display an error message to the user or a fallback UI
    return (
      <main className="container mx-auto text-center py-20">
        <h1 className="text-2xl font-bold mb-4">Error Loading Products</h1>
        <p className="text-muted-foreground">Failed to fetch products. Please try again later.</p>
      </main>
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

          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {(products as Product[]).map((product) => (
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
                      {product.is_on_sale && (
                        <div className="absolute top-2 left-2 z-10">
                          <span className="text-white text-xs px-2 py-1 rounded" style={{ backgroundColor: "#dc3545" }}>
                            SALE {product.sale_percent ? `${product.sale_percent.toFixed(0)}%` : ""}
                          </span>
                        </div>
                      )}
                    </div>
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
                            <span className="text-gray-500 line-through mr-2">{product.price}</span>
                            <span>{product.sale_price}</span>
                          </>
                        ) : (
                          <span>{product.price}</span>
                        )}
                      </div>
                      {/* Add to Cart button is a client component, so it needs to be wrapped or passed as a prop */}
                      <AddToCartButton product={product} />
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

// Client component for Add to Cart button
function AddToCartButton({ product }: { product: Product }) {
  const { addToCart } = useCart();
  return (
    <Button 
      className="w-full bg-blue-600 hover:bg-blue-700"
      onClick={() => addToCart(product)}
    >
      <ShoppingCart className="w-4 h-4 mr-2" />
      Add to Cart
    </Button>
  );
}