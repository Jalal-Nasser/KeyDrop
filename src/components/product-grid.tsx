import products from "@/data/products.json"
import Image from "next/image" // New import
import Link from "next/link" // New import for product links
import { ShoppingCart, Heart } from "lucide-react" // New imports for icons
import { Button } from "@/components/ui/button" // New import for Button
import { getImagePath } from "@/lib/utils" // New import

export function ProductGrid() {
  // Using local product data instead of fetching from WordPress
  const displayProducts = products.slice(0, 12)

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our most popular digital solutions and software packages
          </p>
        </div>

        {displayProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayProducts.map((product: any) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden group flex flex-col text-center"
              >
                <Link href={`/product/${product.id}`} className="block relative">
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    {/* Using next/image for optimization */}
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
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {product.description.replace(/<[^>]*>?/gm, '')}
                    </p>
                  )}

                  <div className="mt-auto">
                    {product.price && (
                      <div className="text-lg font-bold text-blue-600 mb-4">
                        <span>{product.price}</span>
                      </div>
                    )}
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      // onClick={() => addToCart(product)} // Assuming addToCart is available in this context if needed
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