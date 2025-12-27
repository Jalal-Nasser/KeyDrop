"use client"

import { useWishlist } from "@/context/wishlist-context"
import { useSession } from "@/context/session-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product-card"
import Link from "next/link"
import { Loader2 } from "lucide-react"

export default function WishlistPage() {
  const { session, isLoading: isLoadingSession } = useSession()
  const { wishlistItems, isLoadingWishlist } = useWishlist()

  if (isLoadingSession || isLoadingWishlist) {
    return (
      <div className="container mx-auto flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4">Loading wishlist...</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex justify-center items-center py-12 px-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You must be signed in to view your wishlist.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please sign in using the button in the header to access your saved items.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Your Wishlist</h1>
      {wishlistItems.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-4">Your wishlist is empty.</p>
          <Button asChild>
            <Link href="/shop">Start Adding Products</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {wishlistItems.map((item) => (
            <ProductCard key={item.product_id} product={item.product} />
          ))}
        </div>
      )}
    </div>
  )
}