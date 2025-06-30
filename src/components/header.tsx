"use client"

import { useState } from "react"
import { Search, Heart, User, ShoppingCart, Menu, X } from "lucide-react"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header>
      {/* Top white header section - exact match */}
      <div className="bg-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Left - Dropskey Logo */}
            <div className="flex items-center space-x-3">
              {/* Exact geometric logo pattern */}
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
                <div className="text-2xl font-bold text-blue-600">Dropskey</div>
                <div className="text-xs text-gray-500 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  Verified Digital Key Store
                </div>
              </div>
            </div>

            {/* Right side - Business info and user actions */}
            <div className="flex items-center space-x-8">
              {/* Business hours and phone - exact text */}
              <div className="hidden lg:flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <span>🌐</span>
                  <span>Mon - Fri 8:00 Am - 6:00 Pm Sat - Sat Closed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>📞</span>
                  <span>+1 (310) 777 8808, +1 (310) 888 7708</span>
                </div>
              </div>

              {/* User action buttons with separators */}
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <button className="flex items-center space-x-1 hover:text-blue-600">
                  <Heart className="w-4 h-4" />
                  <span>Wishlist</span>
                </button>
                <span className="text-gray-300">|</span>
                <button className="flex items-center space-x-1 hover:text-blue-600">
                  <User className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
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

      {/* Blue navigation bar - exact colors and layout */}
      <div className="bg-blue-600" style={{ backgroundColor: "#1e73be" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Navigation menu */}
            <nav className="hidden lg:flex">
              <div className="flex">
                <a
                  href="/"
                  className="bg-green-600 text-white px-6 py-3 text-sm font-medium"
                  style={{ backgroundColor: "#28a745" }}
                >
                  Home
                </a>
                <a href="/about" className="text-white px-6 py-3 text-sm font-medium hover:bg-blue-700">
                  About US
                </a>
                <a href="/shop" className="text-white px-6 py-3 text-sm font-medium hover:bg-blue-700">
                  Shop
                </a>
                <a href="/kaspersky" className="text-white px-6 py-3 text-sm font-medium hover:bg-blue-700">
                  Kaspersky Endpoint
                </a>
                <a href="/contact" className="text-white px-6 py-3 text-sm font-medium hover:bg-blue-700">
                  Contact Us
                </a>
                <a href="/account" className="text-white px-6 py-3 text-sm font-medium hover:bg-blue-700">
                  Account
                </a>
              </div>
            </nav>

            {/* Search icon */}
            <button className="p-3 text-white hover:text-blue-200">
              <Search className="w-5 h-5" />
            </button>

            {/* Mobile menu button */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-3 text-white">
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-blue-600" style={{ backgroundColor: "#1e73be" }}>
          <div className="px-4 py-2 space-y-1">
            <a href="/" className="block px-3 py-2 text-white font-medium bg-green-600 rounded">
              Home
            </a>
            <a href="/about" className="block px-3 py-2 text-white hover:bg-blue-700 rounded">
              About US
            </a>
            <a href="/shop" className="block px-3 py-2 text-white hover:bg-blue-700 rounded">
              Shop
            </a>
            <a href="/kaspersky" className="block px-3 py-2 text-white hover:bg-blue-700 rounded">
              Kaspersky Endpoint
            </a>
            <a href="/contact" className="block px-3 py-2 text-white hover:bg-blue-700 rounded">
              Contact Us
            </a>
            <a href="/account" className="block px-3 py-2 text-white hover:bg-blue-700 rounded">
              Account
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
