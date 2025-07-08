"use client"

import { useState, useRef, MouseEvent } from "react"
import { Search, Heart, User, ShoppingCart, Menu, X, Globe, Phone } from "lucide-react"
import { usePathname } => "next/navigation"
import Link from "next/link"
import { StoreNotice } from "@/components/store-notice"
import { useSession } from "@/context/session-context"
import { AuthSheet } from "@/components/auth-sheet"
import { useCart } from "@/context/cart-context"
import { CartSheet } from "@/components/cart-sheet"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthSheetOpen, setIsAuthSheetOpen] = useState(false)
  const [isCartSheetOpen, setIsCartSheetOpen] = useState(false)
  const pathname = usePathname()
  const [hovered, setHovered] = useState(false)
  const [hoveredRect, setHoveredRect] = useState<DOMRect | null>(null)
  const navRef = useRef<HTMLElement>(null)
  const { session } = useSession()
  const { cartCount, cartTotal } = useCart()

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
    <header>
      {/* Top white section with logo and user actions */}
      <div className="bg-white py-4 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10">
                <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="0" y="0" width="100" height="100" fill="#805DA8"/>
                  <path d="M50 10C27.9086 10 10 27.9086 10 50C10 72.0914 27.9086 90 50 90C72.0914 90 90 72.0914 90 50C90 27.9086 72.0914 10 50 10ZM50 20C66.5685 20 80 33.4315 80 50C80 66.5685 66.5685 80 50 80C33.4315 80 20 66.5685 20 50C20 33.4315 33.4315 20 50 20Z" fill="#1E73BE"/>
                  <path d="M50 30C44.4772 30 40 34.4772 40 40C40 45.5228 44.4772 50 50 50C55.5228 50 60 45.5228 60 40C60 34.4772 55.5228 30 50 30Z" fill="white"/>
                  <path d="M50 60C44.4772 60 40 64.4772 40 70C40 75.5228 44.4772 80 50 80C55.5228 80 60 75.5228 60 70C60 64.4772 55.5228 60 50 60Z" fill="white"/>
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: "#1e73be" }}> {/* Reverted to single color */}
                  Dropskey
                </div>
                <div className="text-xs text-gray-500 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  Verified Digital Key Store
                </div>
              </div>
            </div>

            {/* Right side - Business info and user actions */}
            <div className="flex items-center space-x-8">
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

              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <button className="flex items-center space-x-1 hover:text-blue-600">
                  <Heart className="w-4 h-4" />
                  <span>Wishlist</span>
                </button>
                <span className="text-gray-300">|</span>
                {session ? (
                  <Link href="/account" className="flex items-center space-x-1 text-red-600 hover:text-blue-600">
                    <User className="w-4 h-4" />
                    <span>Account</span>
                  </Link>
                ) : (
                  <button onClick={() => setIsAuthSheetOpen(true)} className="flex items-center space-x-1 text-red-600 hover:text-blue-600">
                    <User className="w-4 h-4" />
                    <span>Sign In</span>
                  </button>
                )}
                <span className="text-gray-300">|</span>
                <button onClick={() => setIsCartSheetOpen(true)} className="flex items-center space-x-1 hover:text-blue-600 relative">
                  <ShoppingCart className="w-4 h-4" />
                  <span>Cart {cartTotal.toFixed(2)} $</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Blue navigation bar */}
      <div className="bg-blue-600" style={{ backgroundColor: "#1e73be" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <nav className="hidden lg:flex relative" ref={navRef} onMouseLeave={handleMouseLeave}>
              {hovered && hoveredRect && navRef.current && (
                <div
                  className="absolute rounded-md"
                  style={{
                    backgroundColor: "#805da8",
                    left: hoveredRect.left - navRef.current.getBoundingClientRect().left,
                    top: hoveredRect.top - navRef.current.getBoundingClientRect().top,
                    width: hoveredRect.width,
                    height: hoveredRect.height,
                    transition: "all 0.2s ease-in-out",
                  }}
                />
              )}
              <div className="flex relative">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-white px-6 py-3 text-sm font-medium"
                    style={{
                      backgroundColor: pathname === link.href ? "#28a745" : "transparent",
                    }}
                    onMouseEnter={handleMouseEnter}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </nav>

            <button className="p-3 text-white hover:text-blue-200">
              <Search className="w-5 h-5" />
            </button>

            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-3 text-white">
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <StoreNotice />

      {/* White banner below the red Store Notice */}
      <div style={{ height: 40, background: 'white' }} />

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden" style={{ backgroundColor: "#1e73be" }}>
          <div className="px-4 py-2 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2 text-white font-medium rounded"
                style={{
                  backgroundColor: pathname === link.href ? "#28a745" : "transparent",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
      <AuthSheet open={isAuthSheetOpen} onOpenChange={setIsAuthSheetOpen} />
      <CartSheet open={isCartSheetOpen} onOpenChange={setIsCartSheetOpen} />
    </header>
  )
}