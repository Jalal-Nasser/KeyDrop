"use client"
import React, { useState } from "react"
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
import { useCart } from "@/context/cart-context"
import { Product } from "@/types/product"

// Gets the correct image path from the product data.
const getImagePath = (image: string | string[] | undefined): string => {
  if (!image) return "/placeholder.jpg";
  // Use the first image if it's an array (assuming it's the primary one).
  if (Array.isArray(image)) return image[0];
  return image;
}

interface WeeklyProductsProps {
  products: Product[]; // Now receives products as a prop
  title?: string;
}

export function WeeklyProducts({ products, title }: WeeklyProductsProps) {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { addToCart } = useCart()
  const [quickViewQuantity, setQuickViewQuantity] = useState(1)

  const handleQuickViewClick = (product: Product) => {
    setSelectedProduct(product);
    setQuickViewQuantity(1);
    setIsQuickViewOpen(true);
  };

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
          {title && <h2 className="text-3xl font-bold text-gray-900 mb-8">{title}</h2>}
          <div className="w-16 h-0.5 mb-8" style={{ backgroundColor: "#1e73be" }}></div>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow relative group flex flex-col"
                >
                  {product.is_on_sale && (
                    <div className="absolute top-2 left-2 z-10">
                      <span className="text-white text-xs px-2 py-1 rounded" style={{ backgroundColor: "#dc3545" }}>
                        SALE {product.sale_percent ? `${product.sale_percent.toFixed(0)}%` : ""}
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
                      {product.is_on_sale && product.sale_price ? (
                        <>
                          <span className="text-gray-500 line-through mr-2">{product.price}</span>
                          <span>{product.sale_price}</span>
                        </>
                      ) : (
                        <span>{product.price}</span>
                      )}
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
                        {/* These buttons are disabled as quantity is managed in cart or quick view */}
                        <button className="px-2 py-1 text-gray-500 hover:text-gray-700 text-sm" disabled>-</button>
                        <input type="number" defaultValue="1" className="w-12 text-center border-0 text-sm py-1" readOnly />
                        <button className="px-2 py-1 text-gray-500 hover:text-gray-700 text-sm" disabled>+</button>
                      </div>
                      <Button 
                        size="icon" 
                        style={{ backgroundColor: "#1e73be" }}
                        onClick={() => addToCart(product)}
                      >
                        <ShoppingCart className="w-4 h-4" />
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
      </div>

      <Dialog open={isQuickViewOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-3xl p-0 gap-0 max-h-[90vh] overflow-y-auto">
          {selectedProduct && (
            <div className="flex flex-col md:flex-row md:gap-8 h-full">
              <div className="flex-1 flex-shrink-0 flex items-center justify-center bg-gray-100 p-4 md:rounded-l-lg">
                <Image
                  src={getImagePath(selectedProduct.image)}
                  alt={selectedProduct.name}
                  width={400}
                  height={400}
                  className="object-contain max-h-full w-auto"
                />
              </div>
              <div className="flex-1 flex flex-col p-8">
                <DialogHeader className="text-left">
                  <DialogTitle className="text-2xl font-bold mb-2">{selectedProduct.name}</DialogTitle>
                </DialogHeader>
                
                <p className="text-2xl font-semibold text-blue-600 mb-4">
                  {selectedProduct.is_on_sale && selectedProduct.sale_price ? (
                    <>
                      <span className="text-gray-500 line-through mr-3 text-xl">{selectedProduct.price}</span>
                      <span>{selectedProduct.sale_price}</span>
                    </>
                  ) : (
                    <span>{selectedProduct.price}</span>
                  )}
                </p>
                
                <DialogDescription asChild>
                  <div
                    className="text-sm text-gray-600 mb-6 prose prose-sm max-h-40 overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: selectedProduct.description || '' }}
                  />
                </DialogDescription>
                
                <div className="mt-auto pt-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <Button variant="ghost" size="icon" className="h-12 w-12 text-lg" onClick={() => setQuickViewQuantity(q => Math.max(1, q - 1))}>-</Button>
                      <span className="w-16 text-center font-medium text-lg">{quickViewQuantity}</span>
                      <Button variant="ghost" size="icon" className="h-12 w-12 text-lg" onClick={() => setQuickViewQuantity(q => q + 1)}>+</Button>
                    </div>
                    <Button 
                      size="lg" 
                      className="flex-1 h-12 text-base" 
                      style={{ backgroundColor: "#1e73be" }}
                      onClick={() => {
                        addToCart(selectedProduct, quickViewQuantity)
                        handleOpenChange(false)
                      }}
                    >
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