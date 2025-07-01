"use client"
import products from "@/data/products.json"
import Image from "next/image"
import { ShoppingCart } from "lucide-react"
import { useState } from "react"
import { Dialog } from "@/components/ui/dialog"

export function WeeklyProducts({ limit = 8 }) {
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null)
  // Combine local and WordPress products
  const displayProducts = [...products].slice(0, limit)

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-16 h-0.5 mb-8" style={{ backgroundColor: "#1e73be" }}></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayProducts.map((product: any) => (
            <div
              key={product.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow relative group"
            >
              {/* Sale badge */}
              {product.onSale && (
                <div className="absolute top-2 left-2 z-10">
                  <span className="text-white text-xs px-2 py-1 rounded" style={{ backgroundColor: "#dc3545" }}>
                    SALE {product.salePercent || ""}
                  </span>
                </div>
              )}
              <div className="aspect-square mb-4 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                {Array.isArray(product.image) ? (
                  <picture>
                    <source srcSet={product.image[0]} type="image/webp" />
                    <img
                      src={product.image[1]}
                      alt={product.name}
                      width={150}
                      height={150}
                      className="w-full h-full object-contain rounded-lg group-hover:scale-105 transition-transform"
                    />
                  </picture>
                ) : (
                  <Image
                    src={product.image || "/placeholder.jpg"}
                    alt={product.name}
                    width={150}
                    height={150}
                    className="w-full h-full object-contain rounded-lg group-hover:scale-105 transition-transform"
                  />
                )}
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
              <div className="text-lg font-semibold text-gray-900 mb-4">
                <span>{product.price}</span>
              </div>
              {/* Quick view button */}
              <button
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded text-sm font-medium hover:bg-gray-200 transition-colors mb-3"
                onClick={() => setQuickViewProduct(product)}
              >
                QUICK VIEW
              </button>
              {/* Quantity and Add to Cart */}
              <div className="flex items-center justify-between">
                <div className="flex items-center border border-gray-300 rounded">
                  <button className="px-2 py-1 text-gray-500 hover:text-gray-700 text-sm">-</button>
                  <input type="number" value="1" className="w-12 text-center border-0 text-sm py-1" readOnly />
                  <button className="px-2 py-1 text-gray-500 hover:text-gray-700 text-sm">+</button>
                </div>
                <button
                  className="text-white p-2 rounded hover:bg-blue-700 transition-colors"
                  style={{ backgroundColor: "#1e73be" }}
                >
                  <ShoppingCart className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        {/* Quick View Modal */}
        {quickViewProduct && (
          <Dialog open={!!quickViewProduct} onOpenChange={() => setQuickViewProduct(null)}>
            <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-lg">
              <div className="flex flex-col items-center">
                <Image
                  src={quickViewProduct.image || "/placeholder.jpg"}
                  alt={quickViewProduct.name}
                  width={200}
                  height={200}
                  className="mb-4 object-contain rounded-lg"
                />
                <h2 className="text-xl font-bold mb-2">{quickViewProduct.name}</h2>
                <div className="text-lg font-semibold text-gray-900 mb-4">
                  <span>{quickViewProduct.price}</span>
                </div>
                <p className="mb-4 text-gray-700">{quickViewProduct.description}</p>
                <button
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() => setQuickViewProduct(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </Dialog>
        )}
      </div>
    </section>
  )
}
