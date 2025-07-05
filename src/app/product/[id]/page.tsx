"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Loader2 } from "lucide-react"
import { PayPalButton } from "@/components/paypal-button"
import { Product } from "@/types/product"
import { useCart } from "@/context/cart-context"
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser" // Import client-side Supabase client

const getImagePath = (image: string | string[] | undefined): string => {
  if (!image) return "/placeholder.jpg"
  if (Array.isArray(image)) return image[0]
  return image
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createSupabaseBrowserClient()

  const productId = parseInt(params.id)

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single()

      if (error) {
        console.error("Error fetching product:", error)
        setError(error.message)
        setProduct(null)
      } else {
        setProduct(data as Product)
      }
      setLoading(false)
    }
    fetchProduct()
  }, [productId, supabase])

  if (loading) {
    return (
      <div className="container mx-auto flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4">Loading product details...</p>
      </div>
    )
  }

  if (error || !product) {
    notFound() // Use Next.js notFound to render 404 page
  }

  const handleQuantityChange = (amount: number) => {
    setQuantity((prev) => Math.max(1, prev + amount))
  }

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity)
    }
  }

  const displayPrice = product.is_on_sale && product.sale_price
    ? parseFloat(product.sale_price).toFixed(2)
    : parseFloat(product.price).toFixed(2);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12 bg-white p-6 rounded-lg shadow-md">
        {/* Product Image */}
        <div className="md:w-1/2 flex items-center justify-center bg-gray-50 rounded-lg p-4 relative">
          <Image
            src={getImagePath(product.image)}
            alt={product.name}
            width={500}
            height={500}
            className="object-contain max-h-[500px] w-full"
          />
          {product.is_on_sale && product.sale_percent && (
            <div className="absolute top-4 left-4 z-10">
              <span className="text-white text-sm px-3 py-1 rounded-full font-semibold" style={{ backgroundColor: "#dc3545" }}>
                SALE {product.sale_percent}%
              </span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="md:w-1/2 flex flex-col">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {product.name}
          </h1>

          <div className="text-3xl font-semibold text-blue-600 mb-6">
            {product.is_on_sale && product.sale_price ? (
              <>
                <span className="line-through text-gray-500 mr-3 text-2xl">${parseFloat(product.price).toFixed(2)}</span>
                <span>${displayPrice}</span>
              </>
            ) : (
              <span>${displayPrice}</span>
            )}
          </div>

          <div
            className="text-base text-gray-700 mb-8 prose prose-lg max-h-60 overflow-y-auto"
            dangerouslySetInnerHTML={{ __html: product.description || "" }}
          />

          <div className="mt-auto pt-6 border-t border-gray-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center border border-gray-300 rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 text-lg"
                  onClick={() => handleQuantityChange(-1)}
                >
                  -
                </Button>
                <span className="w-16 text-center font-medium text-lg">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 text-lg"
                  onClick={() => handleQuantityChange(1)}
                >
                  +
                </Button>
              </div>
              <Button
                size="lg"
                className="flex-1 h-12 text-base"
                style={{ backgroundColor: "#1e73be" }}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
            </div>
            <PayPalButton product={product} quantity={quantity} />
          </div>
        </div>
      </div>
    </div>
  )
}