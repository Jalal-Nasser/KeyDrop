"use client"
import React, { useState } from "react"
import products from "@/data/products.json"
import Image from "next/image"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

// Helper function to format image paths
const formatImagePath = (filename: string | undefined): string => {
  if (!filename) {
    return "/placeholder.jpg";
  }
  // If it's already a full URL or starts with /images/, return as is
  if (filename.startsWith('http://') || filename.startsWith('https://') || filename.startsWith('/images/')) {
    return filename;
  }
  // Otherwise, prepend /images/
  return `/images/${filename}`;
};

export function WeeklyProducts({ limit = 8 }) {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null); // Store the selected product
  const displayProducts = [...products].slice(0, limit)

  const handleQuickViewClick = (product: any) => {
    setSelectedProduct(product);
    setIsQuickViewOpen(true);
  };

  const handleDialogClose = () => {
    setIsQuickViewOpen(false);
    setSelectedProduct(null); // Clear selected product on close
  };

  return (
    <>
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="w-16 h-0.5 mb-8" style={{ backgroundColor: "#1e73be" }}></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayProducts.map((product: any) => (
              <div
                key={product.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow relative group flex flex-col"
              >
                {/* Sale badge */}
                {product.onSale && (
                  <div className="absolute top-2 left-2 z-10">
                    <span className="text-white text-xs px-2 py-1 rounded" style={{ backgroundColor: "#dc3545" }}>
                      SALE {product.salePercent || ""}
                    </span>
                  </div>
                )}
                
                <Link href={`/product/${product.id}`} className="flex-grow flex flex-col">
                  <div className="aspect-square mb-4 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                    {Array.isArray(product.image) ? (
                      <picture>
                        <source srcSet={formatImagePath(product.image[0])} type="image/webp" />
                        <img
                          src={formatImagePath(product.image[1])}
                          alt={product.name}
                          width={150}
                          height={150}
                          className="w-full h-full object-contain rounded-lg group-hover:scale-105 transition-transform"
                        />
                      </picture>
                    ) : (
                      <Image
                        src={formatImagePath(product.image)}
                        alt={product.name}
                        width={150}
                        height={150}
                        className="w-full h-full object-contain rounded-lg group-hover:scale-105 transition-transform"
                      />
                    )}
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem] hover:text-blue-600">{product.name}</h3>
                </Link>

                <div className="mt-auto">
                  <div className="text-lg font-semibold text-gray-900 mb-4">
                    <span>{product.price}</span>
                  </div>
                  <button
                    className="w-full py-2 px-4 rounded text-sm font-medium transition-colors mb-3 hover:brightness-90"
                    style={{ backgroundColor: "#dc3545", color: "white" }}
                    onClick={() => handleQuickViewClick(product)}
                  >
                    QUICK VIEW
                  </button>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-gray-300 rounded">
                      <button className="px-2 py-1 text-gray-500 hover:text-gray-700 text-sm">-</button>
                      <input type="number" defaultValue="1" className="w-12 text-center border-0 text-sm py-1" readOnly />
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
              </div>
            ))}
          </div>
        </div>
      </div>
      {selectedProduct && (
        <Dialog open={isQuickViewOpen} onOpenChange={handleDialogClose}>
          <DialogContent className="sm:max-w-2xl p-0">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Image Column */}
              <div className="p-6 flex items-center justify-center bg-gray-100 rounded-l-lg">
                <Image
                  src={Array.isArray(selectedProduct.image) ? formatImagePath(selectedProduct.image[1]) : formatImagePath(selectedProduct.image)}
                  alt={selectedProduct.name}
                  width={300}
                  height={300}
                  className="object-contain"
                />
              </div>
              {/* Details Column */}
              <div className="p-6 flex flex-col">
                <DialogHeader>
                  <DialogTitle className="text-2xl mb-2">{selectedProduct.name}</DialogTitle>
                  <DialogDescription className="text-2xl font-semibold text-blue-600 mb-4">
                    {selectedProduct.price}
                  </DialogDescription>
                </DialogHeader>
                <div
                  className="text-sm text-gray-600 mb-4 prose prose-sm max-h-32 overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: selectedProduct.description || '' }}
                />
                <div className="mt-auto pt-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <Button variant="ghost" size="icon" className="h-10 w-10 text-lg">-</Button>
                      <span className="w-12 text-center font-medium">1</span>
                      <Button variant="ghost" size="icon" className="h-10 w-10 text-lg">+</Button>
                    </div>
                    <Button size="lg" className="flex-1 h-10" style={{ backgroundColor: "#1e73be" }}>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}