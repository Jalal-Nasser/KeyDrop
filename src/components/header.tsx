"use client"

import { useState, useRef, MouseEvent } from "react"
import { Search, Heart, User, ShoppingCart, Menu, X, Globe, Phone } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image" // Import Image component
import { StoreNotice } from "@/components/store-notice"
import { useSession } from "@/context/session-context"
import { AuthSheet } from "@/components/auth-sheet"
import { useCart } from "@/context/cart-context"
import { CartSheet } from "@/components/cart-sheet"
import { cn } from "@/lib/utils" // Import cn for conditional classes
import { useWishlist } from "@/context/wishlist-context" // Import useWishlist

export function Header({ className }: { className?: string }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthSheetOpen, setIsAuthSheetOpen] = useState(false)
  const [isCartSheetOpen, setIsCartSheetOpen] = useState(false)
  const pathname = usePathname()
  const [hovered, setHovered] = useState(false)
  const [hoveredRect, setHoveredRect] = useState<DOMRect | null>(null)
  const navRef = useRef<HTMLElement>(null)
  const { session } = useSession()
  const { cartCount, cartTotal } = useCart()
  const { wishlistCount } = useWishlist()

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About US" },
    { href: "/shop", label: "Shop" },
    { href: "/kaspersky", label: "Kaspersky Endpoint" },
    { href: "/contact", label: "Contact Us" },
    { href: "/account", label: "Account" },
  ]

  const handleMouseEnter = (e: MouseEvent<HTMLAnchorElement>) => {
    setHovered(true)
    setHoveredRect(e.currentTarget.getBoundingClientRect())
  }

  const handleMouseLeave = () => {
    setHovered(false)
    setHoveredRect(null)
  }

  return (
    <header className={className}>
      {/* Top white section with logo and user actions */}
      <div className="bg-white py-4 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 relative"> {/* Added relative for Image fill */}
                <Image
                  src="/panda.png" // Updated path to the new panda.png
                  alt="Dropskey Logo"
                  fill // Use fill to make it responsive within the parent div
                  sizes="40px"
                  style={{ objectFit: "contain" }} // Ensure the image fits without cropping
                />
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: "#1e73be" }}> {/* Reverted to single blue color */}
                  Dropskey
                </div>
                <div className="text-xs text-gray-500 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  Verified Digital Key Store
                </div>
              </div>
            </div>

            {/* Right side - Business info and user actions */}
            <div className="flex items-center gap-x-4"> {/* Changed space-x-8 to gap-x-4 */}
              <div className="hidden lg:flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4" />
                  <span>Mon - Fri 8:00 Am - 6:00 Pm Sat - Sat Closed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>+1 (310) 777 8808, +1 (310) 888 7708</span>
                </div>
              </div>

              <div className="flex items-center gap-x-2 text-sm text-gray-600"> {/* Changed space-x-3 to gap-x-2 */}
                <Link href="/wishlist" className="hidden lg:flex items-center gap-x-1 hover:text-blue-600 relative">
                  <Heart className="w-4 h-4" />
                  <span className="hidden sm:inline">Wishlist</span> {/* Hide text on very small screens */}
                  {wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                <span className="text-gray-300 hidden sm:inline">|</span> {/* Hide separator on very small screens */}
                {session ? (
                  <Link href="/account" className="flex items-center gap-x-1 text-red-600 hover:text-blue-600">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Account</span> {/* Hide text on very small screens */}
                  </Link>
                ) : (
                  <button onClick={() => setIsAuthSheetOpen(true)} className="flex items-center gap-x-1 text-red-600 hover:text-blue-600">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Sign In</span> {/* Hide text on very small screens */}
                  </button>
                )}
                <span className="text-gray-300">|</span>
                <button onClick={() => setIsCartSheetOpen(true)} className="flex items-center gap-x-1 text-blue-600 hover:text-blue-800">
                  <ShoppingCart className="w-4 h-4" />
                  <span className="hidden sm:inline">Cart</span>
                  {cartCount > 0 && (
                    <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AuthSheet open={isAuthSheetOpen} onOpenChange={setIsAuthSheetOpen} />
      <CartSheet open={isCartSheetOpen} onOpenChange={setIsCartSheetOpen} />
    </header>
  )
}