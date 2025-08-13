"use client"

    import { useState } from "react"
    import Image from "next/image"
    import { Button } from "@/components/ui/button"
    import { ShoppingCart, Heart } from "lucide-react" // Import Heart icon
    import { PayPalButton } from "@/components/paypal-button"
    import { Product } from "@/types/product"
    import { useCart } from "@/context/cart-context"
    import { useWishlist } from "@/context/wishlist-context" // Import useWishlist
    import { getImagePath } from "@/lib/utils"
    import { Card, CardContent } from "./ui/card"
    import { Separator } from "./ui/separator"
    import { RichTextEditor } from "./admin/rich-text-editor"

    interface ProductDetailsClientProps {
      product: Product;
    }

    export function ProductDetailsClient({ product }: ProductDetailsClientProps) {
      const [quantity, setQuantity] = useState(1)
      const { addToCart } = useCart()
      const { addToWishlist, removeFromWishlist, isProductInWishlist } = useWishlist() // Use wishlist hook

      const handleAddToCart = () => {
        addToCart(product, quantity)
      }

      const handleWishlistToggle = () => {
        if (isProductInWishlist(product.id)) {
          removeFromWishlist(product.id)
        } else {
          addToWishlist(product)
        }
      }

      const imagePath = getImagePath(product.image);

      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="relative h-96 w-full bg-background rounded-lg overflow-hidden flex items-center justify-center border">
            <Image
              src={imagePath}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain"
              priority // Added priority prop
            />
          </div>
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-3xl font-semibold text-blue-600">${product.price.toFixed(2)}</p> {/* Directly use product.price */}

            <div>
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              {/* Render description using RichTextEditor for display, make it read-only */}
              <Card className="p-4">
                <CardContent className="prose dark:prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: product.description || "<p>No description available.</p>" }} />
                </CardContent>
              </Card>
            </div>

            <div className="flex items-center space-x-4">
              <label htmlFor="quantity" className="font-medium">Quantity:</label>
              <input
                type="number"
                id="quantity"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 p-2 border rounded-md text-center"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="flex-1" onClick={handleAddToCart}>
                <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="flex-1"
                onClick={handleWishlistToggle}
              >
                <Heart className={isProductInWishlist(product.id) ? "mr-2 h-5 w-5 text-red-500 fill-red-500" : "mr-2 h-5 w-5 text-gray-500"} />
                {isProductInWishlist(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
              </Button>
              <PayPalButton product={product} quantity={quantity} />
            </div>

            <Separator className="my-6" />

            <div className="text-sm text-gray-600">
              <p>Category: Digital Keys</p>
              <p>Availability: In Stock</p>
            </div>
          </div>
        </div>
      )
    }