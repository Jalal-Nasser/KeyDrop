"use client"

import { useState, useRef, MouseEvent } from "react"
import { Search, Heart, User, ShoppingCart, Menu, X, Globe, Phone } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { StoreNotice } from "@/components/store-notice" // Import StoreNotice
import { useSession } from "@/context/session-context"
import { AuthSheet } from "@/components/auth-sheet"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthSheetOpen, setIsAuthSheetOpen] = useState(false)
  const pathname = usePathname()
  const [hovered, setHovered] = useState(false)
  const [hoveredRect, setHoveredRect] = useState<DOMRect | null>(null)
  const navRef = useRef<HTMLElement>(null)
  const { session } = useSession()

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
      {/* Top white section with logo and user actions - EXACT MATCH */}
      <div className="bg-white py-4 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo - EXACT geometric pattern */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10">
                <svg viewBox="0 0 40 40" className="w-full h-full">
                  <rect x="2" y="2" width="6" height="6" fill="#1e73be" />
                  <rect x="10" y="2" width="6" height="6" fill="#1e73be" />
                  <rect x="18" y="2" width="6" height="6" fill="#1e73be" />
                  <rect x="26" y="2" width="6" height="6" fill="#1e73be" />
                  <rect x="34" y="2" width="4" height="6" fill="#1e73be" />

                  <rect x="2" y="10" width="6" height="6" fill="#1e73be" />
                  <rect x="18" y="10" width="6" height="6" fill="#1e73be" />
                  <rect x="26" y="10" width="6" height="6" fill="#1e73be" />
                  <rect x="34" y="10" width="4" height="6" fill="#1e73be" />

                  <rect x="2" y="18" width="6" height="6" fill="#1e73be" />
                  <rect x="10" y="18" width="6" height="6" fill="#1e73be" />
                  <rect x="18" y="18" width="6" height="6" fill="#1e73be" />
                  <rect x="26" y="18" width="6" height="6" fill="#1e73be" />
                  <rect x="34" y="18" width="4" height="6" fill="#1e73be" />

                  <rect x="2" y="26" width="6" height="6" fill="#1e73be" />
                  <rect x="10" y="26" width="6" height="6" fill="#1e73be" />
                  <rect x="26" y="26" width="6" height="6" fill="#1e73be" />
                  <rect x="34" y="26" width="4" height="6" fill="#1e73be" />

                  <rect x="2" y="34" width="6" height="4" fill="#1e73be" />
                  <rect x="10" y="34" width="6" height="4" fill="#1e73be" />
                  <rect x="18" y="34" width="6" height="4" fill="#1e73be" />
                  <rect x="26" y="34" width="6" height="4" fill="#1e73be" />
                  <rect x="34" y="34" width="4" height="4" fill="#1e73be" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: "#1e73be" }}>
                  Dropskey
                </div>
                <div className="text-xs text-gray-500 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  Verified Digital Key Store
                </div>
              </div>
            </div>

            {/* Right side - Business info and user actions - EXACT TEXT */}
            <div className="flex items-center space-x-8">
              {/* Business hours and phone - EXACT from screenshot */}
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

              {/* User action buttons with separators - EXACT layout */}
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <button className="flex items-center space-x-1 hover:text-blue-600">
                  <Heart className="w-4 h-4" />
                  <span>Wishlist</span>
                </button>
                <span className="text-gray-300">|</span>
                {session ? (
                  <Link href="/account" className="flex items-center space-x-1 hover:text-blue-600">
                    <User className="w-4 h-4" />
                    <span>Account</span>
                  </Link>
                ) : (
                  <button onClick={() => setIsAuthSheetOpen(true)} className="flex items-center space-x-1 hover:text-blue-600">
                    <User className="w-4 h-4" />
                    <span>Sign In</span>
                  </button>
                )}
                <span className="text-gray-300">|</span>
                <button className="flex items-center space-x-1 hover:text-blue-600">
                  <ShoppingCart className="w-4 h-4" />
                  <span>Cart 0.00 $</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Blue navigation bar - EXACT colors */}
      <div className="bg-blue-600" style={{ backgroundColor: "#1e73be" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Navigation menu - EXACT items and styling */}
            <nav
              className="hidden lg:flex relative"
              ref={navRef}
              onMouseLeave={handleMouseLeave}
            >
              {
                hovered && hoveredRect && navRef.current && (
                  <div
                    className="absolute bg-blue-700 rounded-md"
                    style={{
                      left:
                        hoveredRect.left -
                        navRef.current.getBoundingClientRect().left,
                      top:
                        hoveredRect.top - navRef.current.getBoundingClientRect().top,
                      width: hoveredRect.width,
                      height: hoveredRect.height,
                      transition: "all 0.2s ease-in-out",
                    }}
                  />
                )
              }
              <div className="flex relative">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-white px-6 py-3 text-sm font-medium"
                    style={{
                      backgroundColor:
                        pathname === link.href ? "#28a745" : "transparent",
                    }}
                    onMouseEnter={handleMouseEnter}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </nav>

            {/* Search icon - EXACT positioning */}
            <button className="p-3 text-white hover:text-blue-200">
              <Search className="w-5 h-5" />
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-3 text-white"
            >
              {
                isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />
              }
            </button>
          </div>
        </div>
      </div>

      {/* Store Notice will now appear directly below the blue navigation bar */}
      <StoreNotice />

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
                  backgroundColor:
                    pathname === link.href ? "#28a745" : "transparent",
                }}
              >
                {
                  link.label
                }
              </Link>
            ))}
          </div>
        </div>
      )}
      <AuthSheet open={isAuthSheetOpen} onOpenChange={setIsAuthSheetOpen} />
    </header>
  )
}