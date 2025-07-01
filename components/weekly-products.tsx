"use client"
import products from "@/data/products.json"
import Image from "next/image"
import { ShoppingCart, Plus, Minus } from "lucide-react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function WeeklyProducts({ limit = 8 }) {
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null)
  const [quantity, setQuantity] = useState(1)

  const handleQuickViewOpen = (product: any) => {
    setQuickViewProduct(product)
    setQuantity(1) // Reset quantity when opening a new modal
  }

  const handleQuickViewClose = () => {
    setQuickViewProduct(null)
  }

  // Helper function to ensure image paths are correct
  const getCorrectedImagePath = (path: string | undefined) => {
    if (!path) {
      return "/placeholder.jpg";
    }
    // If path already starts with /images/ or is an absolute URL, return as is
    if (path.startsWith('/images/') || path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    // Otherwise, prepend /images/
    return `/images/${path}`;
  };

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
                    <source srcSet={getCorrectedImagePath(product.image[0])} type="image/webp" />
                    <img
                      src={getCorrectedImagePath(product.image[1])}
                      alt={product.name}
                      width={150}
                      height={150}
                      className="w-full h-full object-contain rounded-lg group-hover:scale-105 transition-transform"
                    />
                  </picture>
                ) : (
                  <Image
                    src={getCorrectedImagePath(product.image || "/placeholder.jpg")}
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
                className="w-full py-2 px-4 rounded text-sm font-medium transition-colors mb-3 hover:brightness-90"
                style={{ backgroundColor: "#dc3545", color: "white" }}
                onClick={() => handleQuickViewOpen(product)}
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
          <Dialog open={!!quickViewProduct} onOpenChange={handleQuickViewClose}>
            <DialogContent className="sm:max-w-3xl p-8 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Image */}
                <div className="relative">
                  {quickViewProduct.onSale && (
                    <div className="absolute top-2 left-2 z-10">
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                        SALE {quickViewProduct.salePercent || ""}
                      </span>
                    </div>
                  )}
                  <Image
                    src={getCorrectedImagePath(Array.isArray(quickViewProduct.image) ? quickViewProduct.image[0] : quickViewProduct.image || "/placeholder.jpg")}
                    alt={quickViewProduct.name}
                    width={400}
                    height={400}
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>

                {/* Right Column: Details */}
                <div className="flex flex-col justify-center space-y-4">
                  <DialogHeader>
                    <DialogTitle className="text-3xl font-bold">{quickViewProduct.name}</DialogTitle>
                    <DialogDescription className="text-gray-600">
                      {quickViewProduct.description}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="flex items-baseline gap-2">
                    {quickViewProduct.oldPrice && (
                      <span className="text-xl text-gray-500 line-through">
                        {quickViewProduct.oldPrice}
                      </span>
                    )}
                    <span className="text-2xl font-semibold text-blue-600">
                      {quickViewProduct.price}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 pt-4">
                    <div className="flex items-center border border-gray-300 rounded">
                      <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-2"><Minus size={16}/></button>
                      <input type="number" value={quantity} readOnly className="w-12 text-center border-y-0 border-x" />
                      <button onClick={() => setQuantity(q => q + 1)} className="p-2"><Plus size={16}/></button>
                    </div>
                    <Button size="lg" className="flex-grow bg-[#1e73be] hover:bg-[#1a63a3]">
                      <ShoppingCart className="mr-2" />
                      ADD TO CART
                    </Button>
                  </div>

                  <div className="text-sm text-gray-500 space-y-1 pt-4">
                    {quickViewProduct.categories && <p><strong>Categories:</strong> {quickViewProduct.categories}</p>}
                    {quickViewProduct.tags && <p><strong>Tags:</strong> {quickViewProduct.tags}</p>}
                    {quickViewProduct.brand && <p><strong>Brand:</strong> {quickViewProduct.brand}</p>}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </section>
  )
}