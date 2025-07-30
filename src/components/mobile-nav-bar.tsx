"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, ShoppingBag, Heart, PackageCheck, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCart } from "@/context/cart-context"
import { useSession } from "@/context/session-context"
import { useWishlist } from "@/context/wishlist-context"
import { useEffect, useState } from "react"

const SkeletonLoader = ({ className }: { className: string }) => (
  <div className={cn("flex flex-col items-center justify-center gap-1", className)}>
    <div className="bg-muted-foreground/20 animate-pulse rounded-full w-6 h-6" />
    <div className="bg-muted-foreground/20 animate-pulse rounded w-10 h-2" />
  </div>
);

export function MobileNavBar({ className }: { className?: string }) {
  const pathname = usePathname()
  const { session, isLoading: isLoadingSession } = useSession()
  const { wishlistCount, isLoadingWishlist } = useWishlist()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const baseNavItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/shop", label: "Shop", icon: ShoppingBag },
    { href: "/wishlist", label: "Wishlist", icon: Heart, count: wishlistCount },
    { href: "/account/orders", label: "Track Order", icon: PackageCheck },
  ]

  const AccountNavItem = () => {
    if (isLoadingSession) {
      return <SkeletonLoader className="w-14 h-14" />;
    }
    if (session) {
      return (
        <Link
          href="/account"
          className={cn(
            "flex flex-col items-center text-xs text-gray-600 hover:text-blue-600 transition-colors relative",
            pathname === "/account" && "text-blue-600 font-semibold"
          )}
        >
          <User className="w-5 h-5 mb-1" />
          My account
        </Link>
      );
    }
    return null;
  }

  return (
    <div className={cn("fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg lg:hidden", className)}>
      <nav className="flex justify-around items-center h-14">
        {baseNavItems.map((item) => (
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
            {item.label === "Wishlist" && isClient && !isLoadingWishlist && item.count !== undefined && item.count > 0 && (
              <span className="absolute -top-1 right-0 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                {item.count}
              </span>
            )}
          </Link>
        ))}
        {isClient ? <AccountNavItem /> : <SkeletonLoader className="w-14 h-14" />}
      </nav>
    </div>
  )
}