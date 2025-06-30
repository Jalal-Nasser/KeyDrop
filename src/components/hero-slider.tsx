"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)

  return (
    <section className="relative bg-gray-50 py-20" style={{ backgroundColor: "#f8f9fa" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          {/* Navigation arrows - exact positioning */}
          <button className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg">
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <button className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg">
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>

          {/* Slide content - exact layout */}
          <div className="text-center py-16">
            {/* Cat mascot image area */}
            <div className="mb-8">
              <div className="mx-auto w-80 h-80 flex items-center justify-center">
                {/* Watercolor cat placeholder - exact style */}
                <div className="relative w-64 h-64">
                  {/* Watercolor background effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-200 via-blue-200 to-pink-200 rounded-full opacity-40 blur-2xl transform scale-110"></div>

                  {/* Cat figure */}
                  <div className="relative w-full h-full flex flex-col items-center justify-center">
                    {/* Hat */}
                    <div className="text-6xl mb-2">🎩</div>
                    {/* Cat face with glasses */}
                    <div className="text-5xl mb-2">😺</div>
                    <div className="text-3xl absolute top-20">👓</div>
                    {/* Bow tie */}
                    <div className="text-2xl mt-2">🎀</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Exact text from screenshot */}
            <h2 className="text-4xl font-light mb-8" style={{ color: "#9c88ff" }}>
              Just Started
            </h2>

            {/* Slide indicators - exact style */}
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
