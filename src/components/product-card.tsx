"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { Product } from "@/types/product"
import { useCart } from "@/context/cart-context"
import { getImagePath } from "@/lib/utils"

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden group flex flex-col text-center hover:shadow-xl transition-shadow duration-300">
      {/* ... other product card content ... */}
      
      <div className="p-4 flex flex-col flex-grow">
        {/* ... product info ... */}
        
        <div className="mt-auto">
          <Button 
            className="w-full bg-[#805da8] hover:bg-[#6d4d8f] text-white"
            onClick={() => addToCart(product)}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}