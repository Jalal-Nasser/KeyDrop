"use client"

import { useState, useEffect } from "react"
import { useCart } from "@/context/cart-context"
import { getProductsFromDb } from "@/app/actions/product-actions"
import { client } from "@/lib/graphql"
import { Skeleton } from "@/components/ui/skeleton"

// Define the structure of the product data we expect from the API
interface ApiProduct {
  databaseId: number; // Changed from 'id: string' to 'databaseId: number'
  name: string;
  description: string | null;
  image: {
    sourceUrl: string;
  } | null;
  price: string;
}

export function ProductGrid() {
  const { addToCart } = useCart()
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProductsFromDb({ limit: 12, featured: true });
        // @ts-ignore
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products:", err)
        setError("Could not load products. Please try again later.")
      } finally {
        setLoading(false)
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (product: ApiProduct) => {
    addToCart({
      id: product.databaseId, // Now passing databaseId
      name: product.name,
      price: product.price,
      image: product.image?.sourceUrl,
    });
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our most popular digital solutions and software packages
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 space-y-4">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex items-center justify-between pt-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-10 w-28" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our most popular digital solutions and software packages
          </p>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.databaseId} // Using databaseId as key
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden group"
              >
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image.sourceUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                      <div className="text-blue-400 text-4xl">📦</div>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>

                  {product.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2"
                       dangerouslySetInnerHTML={{ __html: product.description }}
                    />
                  )}

                  <div className="flex items-center justify-between">
                    {product.price && (
                      <div className="text-lg font-bold text-blue-600">
                        <span>{product.price}</span>
                      </div>
                    )}
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No featured products available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  )
}