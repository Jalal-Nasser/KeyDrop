"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { useCart } from "@/context/cart-context"
// import { Product } from "@/types/product" // Types are missing, defining locally or using any
import Image from "next/image"
import Link from "next/link"

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

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault()
        addToCart({
            id: product.id,
            name: product.name,
            price: product.sale_price ?? product.price,
            image: product.image,
        })
    }

    return (
        <Card className="h-full flex flex-col overflow-hidden group">
            <Link href={`/product/${product.id}`} className="flex-grow">
                <CardHeader className="p-0">
                    <div className="aspect-square relative overflow-hidden bg-white">
                        {product.image ? (
                            <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-contain transition-transform group-hover:scale-105"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                No Image
                            </div>
                        )}
                        {product.sale_percent && (
                            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                -{product.sale_percent}%
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground mb-2">{product.category || "Uncategorized"}</div>
                    <h3 className="font-semibold text-lg line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                        {product.name}
                    </h3>
                    <div className="flex items-baseline gap-2">
                        {product.sale_price ? (
                            <>
                                <span className="text-lg font-bold text-red-500">${product.sale_price.toFixed(2)}</span>
                                <span className="text-sm text-muted-foreground line-through">${product.price.toFixed(2)}</span>
                            </>
                        ) : (
                            <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
                        )}
                    </div>
                </CardContent>
            </Link>
            <CardFooter className="p-4 pt-0 mt-auto">
                <Button className="w-full" onClick={handleAddToCart} disabled={product.stock <= 0}>
                    {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                </Button>
            </CardFooter>
        </Card>
    )
}
