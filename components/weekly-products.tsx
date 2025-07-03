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

// Gets the correct image path from the product data.
const getImagePath = (image: string | string[] | undefined): string => {
  if (!image) return "/placeholder.jpg";
  // Use the first image if it's an array (assuming it's the primary one).
  if (Array.isArray(image)) return image[0];
  return image;
}

export function WeeklyProducts({ limit = 8 }) {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const displayProducts = [...products].slice(0, limit)

  const handleQuickViewClick = (product: any) => {
    setSelectedProduct(product);
    setIsQuickViewOpen(true);
  };

  // This function is passed to the Dialog's onOpenChange prop.
  const handleOpenChange = (open: boolean) => {
    setIsQuickViewOpen(open);
    if (!open) {
      setSelectedProduct(null);
    }
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
                {product.onSale && (
                  <div className="absolute top-2 left-2 z-10">
                    <span className="text-white text-xs px-2 py-1 rounded" style={{ backgroundColor: "#dc3545" }}>
                      SALE {product.salePercent || ""}
                    </span>
                  </div>
                )}
                
                <Link href={`/product/${product.id}`} className="flex-grow flex flex-col">
                  <div className="aspect-square mb-4 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                    <Image
                      src={getImagePath(product.image)}
                      alt={product.name}
                      width={200}
                      height={200}
                      className="w-full h-full object-contain rounded-lg group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem] hover:text-blue-600">{product.name}</h3>
                </Link>

                <div className="mt-auto">
                  <div className="text-lg font-semibold text-gray-900 mb-4">
                    <span>{product.price}</span>
                  </div>
                  <Button
                    className="w-full mb-3 hover:brightness-90"
                    style={{ backgroundColor: "#dc3545", color: "white" }}
                    onClick={() => handleQuickViewClick(product)}
                  >
                    QUICK VIEW
                  </Button>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-gray-300 rounded">
                      <button className="px-2 py-1 text-gray-500 hover:text-gray-700 text-sm">-</button>
                      <input type="number" defaultValue="1" className="w-12 text-center border-0 text-sm py-1" readOnly />
                      <button className="px-2 py-1 text-gray-500 hover:text-gray-700 text-sm">+</button>
                    </div>
                    <Button size="icon" style={{ backgroundColor: "#1e73be" }}>
                      <ShoppingCart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={isQuickViewOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-3xl p-0 gap-0 max-h-[90vh] overflow-y-auto">
          {selectedProduct && (
            <div className="flex flex-col md:flex-row md:gap-8 w-full h-full">
              {/* Image Section */}
              <div className="flex-1 flex-shrink-0 flex items-center justify-center bg-gray-100 p-4 md:rounded-l-lg">
                <Image
                  src={getImagePath(selectedProduct.image)}
                  alt={selectedProduct.name}
                  width={400}
                  height={400}
                  className="object-contain max-h-full w-auto"
                />
              </div>
              {/* Details Section */}
              <div className="flex-1 flex flex-col p-8">
                <DialogHeader className="text-left">
                  <DialogTitle className="text-2xl font-bold mb-2">{selectedProduct.name}</DialogTitle>
                </DialogHeader>
                
                <p className="text-2xl font-semibold text-blue-600 mb-4">{selectedProduct.price}</p>
                
                <DialogDescription asChild>
                  <div
                    className="text-sm text-gray-600 mb-6 prose prose-sm max-h-40 overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: selectedProduct.description || '' }}
                  />
                </DialogDescription>
                
                <div className="mt-auto pt-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <Button variant="ghost" size="icon" className="h-12 w-12 text-lg">-</Button>
                      <span className="w-16 text-center font-medium text-lg">1</span>
                      <Button variant="ghost" size="icon" className="h-12 w-12 text-lg">+</Button>
                    </div>
                    <Button size="lg" className="flex-1 h-12 text-base" style={{ backgroundColor: "#1e73be" }}>
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}