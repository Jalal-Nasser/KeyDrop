"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, ShoppingBag, Heart, PackageCheck, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCart } from "@/context/cart-context"
import { useSession } from "@/context/session-context"
import { useWishlist } from "@/context/wishlist-context" // Import useWishlist

export function MobileNavBar({ className }: { className?: string }) {
  const pathname = usePathname()
  const { cartCount, isLoadingCart } = useCart() // Get isLoadingCart
  const { session, isLoading: isLoadingSession } = useSession() // Use isLoading from useSession
  const { wishlistCount, isLoadingWishlist } = useWishlist() // Use wishlist hook and get isLoadingWishlist

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/shop", label: "Shop", icon: ShoppingBag },
    { href: "/wishlist", label: "Wishlist", icon: Heart, count: wishlistCount, isLoading: isLoadingWishlist }, // Use actual wishlist count and loading state
    { href: "/account/orders", label: "Track Order", icon: PackageCheck },
  ]

  // Add "My account" only if session exists AND is not loading
  if (!isLoadingSession && session) {
    navItems.push({ href: "/account", label: "My account", icon: User });
  }

  return (
    <div className={cn("fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg lg:hidden", className)}>
      <nav className="flex justify-around items-center h-14">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center text-xs text-gray-600 hover:text-blue-600 transition-colors relative",
              pathname === item.href && "text-blue-600 font-semibold"
            )}
          >
            <item.icon className="w-5 h-5 mb-1" />
            {item.label}
            {item.label === "Wishlist" && item.isLoading ? (
              <span className="absolute -top-1 right-0 bg-gray-300 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs animate-pulse">
                ...
              </span>
            ) : item.label === "Wishlist" && item.count !== undefined && item.count > 0 && (
              <span className="absolute -top-1 right-0 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                {item.count}
              </span>
            )}
          </Link>
        ))}
        {isLoadingSession && ( // Add a loading indicator for the session-dependent item
          <div className="flex flex-col items-center text-xs text-gray-600 animate-pulse">
            <User className="w-5 h-5 mb-1" />
            <span>Loading...</span>
          </div>
        )}
      </nav>
    </div>
  )
}