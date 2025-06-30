"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)

  return (
    <section className="relative bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          {/* Navigation arrows */}
          <button className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg">
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <button className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg">
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>

          {/* Slide content */}
          <div className="text-center py-16">
            <div className="mb-8">
              {/* Cat mascot with watercolor effect */}
              <div className="mx-auto w-80 h-80 flex items-center justify-center">
                <div className="relative">
                  {/* Watercolor background effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-200 via-blue-200 to-pink-200 rounded-full opacity-30 blur-xl"></div>

                  {/* Cat illustration using placeholder */}
                  <img
                    src="/placeholder.svg?height=300&width=300&text=Cat+Mascot"
                    alt="Cat mascot with glasses and bow tie"
                    className="relative w-64 h-64 object-contain"
                  />
                </div>
              </div>
            </div>
            <h2 className="text-4xl font-light text-purple-400 mb-8">Just Started</h2>

            {/* Slide indicators */}
            <div className="flex justify-center space-x-2">
              <button className="w-3 h-3 rounded-full bg-gray-800"></button>
              <button className="w-3 h-3 rounded-full bg-gray-300"></button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
