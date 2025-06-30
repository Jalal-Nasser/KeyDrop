"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

const slides = [
  { caption: "Just Started", image: "/images/layerslider-02-bear.png" },
  { caption: "Lets Paint it", image: "/images/layerslider-03-cat.png" },
]

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)

  return (
    <section className="relative py-0" style={{ backgroundColor: "#f8f9fa" }}>
      {/* Image container - spans full width and height of the section */}
      <div className="relative h-[90vh] w-full flex items-center justify-center">
        <Image
          src={slides[currentSlide].image || "/placeholder.svg"}
          alt={slides[currentSlide].caption}
          fill
          style={{ objectFit: "contain" }} // Keep contain to show full image
          priority
        />
        {/* Navigation arrows - position relative to this full-width image container */}
        <button className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg">
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </button>
        <button className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg">
          <ChevronRight className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* Text content and dots - centered within max-w-7xl, placed below the image */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-8">
        <h2 className="text-4xl font-light mb-8" style={{ color: "#9c88ff" }}>
          {slides[currentSlide].caption}
        </h2>
        <div className="mt-6 flex justify-center gap-2">
          {slides.map((_, i) => (
            <span key={i} className={`h-2 w-2 rounded-full ${i === currentSlide ? "bg-purple-500" : "bg-gray-300"}`} />
          ))}
        </div>
      </div>
    </section>
  )
}
