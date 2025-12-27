"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useCart } from "@/context/cart-context"
import Image from "next/image"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"

export interface Product {
    id: string
    name: string
    description: string | null
    price: number
    sale_price?: number | null
    sale_percent?: number | null
    image: string | null
    stock: number
    category?: string | null
    tag?: string | null
    is_on_sale?: boolean | null
}

export function ProductCard({ product }: { product: Product }) {
    const { addToCart } = useCart()

    return (
        <div
            key={product.id}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden group hover:shadow-xl transition-shadow duration-300 flex flex-col h-full"
        >
            <Link href={`/product/${product.id}`} className="block relative aspect-square bg-gray-50 overflow-hidden">
                {product.image ? (
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                    </div>
                )}
                {product.sale_percent && (
                    <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                        -{product.sale_percent}%
                    </div>
                )}
            </Link>

            <div className="p-4 flex flex-col flex-grow">
                <div className="mb-2 text-xs font-medium text-blue-600 uppercase tracking-wide">
                    {product.category || "Software"}
                </div>
                <Link href={`/product/${product.id}`} className="hover:text-blue-600 transition-colors">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                        {product.name}
                    </h3>
                </Link>
                <div className="mt-auto flex items-center justify-between pt-4">
                    <div className="flex flex-col">
                        {product.sale_price ? (
                            <>
                                <span className="text-gray-400 line-through text-sm">${product.price.toFixed(2)}</span>
                                <span className="text-xl font-bold text-blue-600">${product.sale_price.toFixed(2)}</span>
                            </>
                        ) : (
                            <span className="text-xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                        )}
                    </div>
                    <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4"
                        onClick={(e) => {
                            e.preventDefault()
                            addToCart({
                                id: product.id,
                                name: product.name,
                                price: product.sale_price ?? product.price,
                                image: product.image
                            })
                        }}
                        disabled={product.stock <= 0}
                    >
                        <ShoppingCart className="w-4 h-4" />
                        <span className="sr-only">Add to Cart</span>
                    </Button>
                </div>
            </div>
        </div>
    )
}
