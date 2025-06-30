"use client"

import { useState } from "react"
import { Search, Heart, User, ShoppingCart, Menu, X } from "lucide-react"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header>
      {/* Top white section with logo and user actions */}
      <div className="bg-white py-3 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                {/* Dropskey logo with geometric pattern */}
                <div className="w-12 h-12 relative">
                  <svg viewBox="0 0 48 48" className="w-full h-full">
                    <rect x="4" y="4" width="8" height="8" fill="#3b82f6" rx="1" />
                    <rect x="14" y="4" width="8" height="8" fill="#3b82f6" rx="1" />
                    <rect x="24" y="4" width="8" height="8" fill="#3b82f6" rx="1" />
                    <rect x="34" y="4" width="8" height="8" fill="#3b82f6" rx="1" />
                    <rect x="4" y="14" width="8" height="8" fill="#3b82f6" rx="1" />
                    <rect x="24" y="14" width="8" height="8" fill="#3b82f6" rx="1" />
                    <rect x="34" y="14" width="8" height="8" fill="#3b82f6" rx="1" />
                    <rect x="4" y="24" width="8" height="8" fill="#3b82f6" rx="1" />
                    <rect x="14" y="24" width="8" height="8" fill="#3b82f6" rx="1" />
                    <rect x="24" y="24" width="8" height="8" fill="#3b82f6" rx="1" />
                    <rect x="34" y="24" width="8" height="8" fill="#3b82f6" rx="1" />
                    <rect x="4" y="34" width="8" height="8" fill="#3b82f6" rx="1" />
                    <rect x="14" y="34" width="8" height="8" fill="#3b82f6" rx="1" />
                    <rect x="34" y="34" width="8" height="8" fill="#3b82f6" rx="1" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">Dropskey</div>
                  <div className="text-xs text-gray-500 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                    Verified Digital Key Store
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Hours, Phone, Actions */}
            <div className="flex items-center space-x-6">
              {/* Business hours and phone */}
              <div className="hidden lg:flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">🌐</span>
                  <span>Mon - Fri 8:00 Am - 6:00 Pm Sat - Sat Closed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">📞</span>
                  <span>+1 (310) 777 8808, +1 (310) 888 7708</span>
                </div>
              </div>

              {/* User actions */}
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 text-sm">
                  <Heart className="w-4 h-4" />
                  <span className="hidden sm:inline">Wishlist</span>
                </button>
                <span className="text-gray-300">|</span>
                <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 text-sm">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
                <span className="text-gray-300">|</span>
                <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 text-sm">
                  <ShoppingCart className="w-4 h-4" />
                  <span className="hidden sm:inline">Cart 0.00 $</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Blue navigation bar */}
      <div className="bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex">
              <div className="flex">
                <a href="/" className="bg-green-600 text-white px-6 py-3 text-sm font-medium">
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
            <div className="flex items-center">
              <button className="p-3 text-white hover:text-blue-200">
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile menu button */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-3 text-white hover:text-blue-200">
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden bg-blue-600">
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
