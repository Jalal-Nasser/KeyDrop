"use client"

import { useState } from "react"
import { Search, Heart, User, ShoppingCart, Menu, X } from "lucide-react"

export function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header>
      {/* ---------- TOP WHITE BAR ---------- */}
      <div className="bg-white py-3 border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 lg:px-8">
          {/* logo + tagline */}
          <div className="flex items-center gap-3">
            {/* simplified geometric logo */}
            <svg className="h-10 w-10" viewBox="0 0 40 40" fill="#1e73be">
              {Array.from({ length: 5 }).map((_, r) =>
                Array.from({ length: 5 }).map((__, c) =>
                  (r !== 1 || c !== 1) && (r !== 3 || c !== 2) ? (
                    <rect key={`${r}${c}`} x={2 + c * 8} y={2 + r * 8} width={6} height={6} rx={1} />
                  ) : null,
                ),
              )}
            </svg>
            <div>
              <p className="text-2xl font-bold text-blue-600">Dropskey</p>
              <p className="flex items-center gap-1 text-xs text-gray-500">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                Verified Digital Key Store
              </p>
            </div>
          </div>

          {/* hours + phone (lg)  |  user actions */}
          <div className="hidden items-center gap-6 text-sm text-gray-600 lg:flex">
            <span>🌐 Mon - Fri 8:00 Am - 6:00 Pm Sat - Sat Closed</span>
            <span>📞 +1 (310) 777 8808, +1 (310) 888 7708</span>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1 hover:text-blue-600">
                <Heart className="h-4 w-4" /> Wishlist
              </button>
              <span className="text-gray-300">|</span>
              <button className="flex items-center gap-1 hover:text-blue-600">
                <User className="h-4 w-4" /> Sign In
              </button>
              <span className="text-gray-300">|</span>
              <button className="flex items-center gap-1 hover:text-blue-600">
                <ShoppingCart className="h-4 w-4" /> Cart 0.00 $
              </button>
            </div>
          </div>

          {/* mobile burger */}
          <button className="lg:hidden" aria-label="Toggle navigation" onClick={() => setOpen((o) => !o)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* ---------- BLUE MENU BAR ---------- */}
      <nav className="bg-[#1e73be]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 lg:px-8">
          {/* desktop */}
          <ul className="hidden text-sm font-medium text-white lg:flex">
            <li className="bg-green-600 px-6 py-3">Home</li>
            {["About US", "Shop", "Kaspersky Endpoint", "Contact Us", "Account"].map((t) => (
              <li key={t} className="px-6 py-3 hover:bg-blue-700">
                <a href="#">{t}</a>
              </li>
            ))}
          </ul>
          {/* search */}
          <button className="hidden p-3 text-white hover:text-blue-200 lg:block">
            <Search className="h-5 w-5" />
          </button>
        </div>

        {/* mobile links */}
        {open && (
          <ul className="flex flex-col gap-1 px-4 py-2 text-white lg:hidden">
            {["Home", "About US", "Shop", "Kaspersky Endpoint", "Contact Us", "Account"].map((t, i) => (
              <li key={t} className={`rounded px-3 py-2 ${i === 0 ? "bg-green-600" : "hover:bg-blue-700"}`}>
                <a href="#">{t}</a>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </header>
  )
}
