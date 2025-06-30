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
    <section className="relative py-20" style={{ backgroundColor: "#f8f9fa" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          {/* Navigation arrows - EXACT positioning */}
          <button className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg">
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <button className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg">
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>

          {/* Slide content - EXACT layout from screenshot */}
          <div className="text-center py-16">
            {/* Cat mascot image area - EXACT styling */}
            <div className="mx-auto max-w-3xl text-center">
              <div className="relative mx-auto mb-8 h-80 w-80">
                <Image
                  src={slides[currentSlide].image || "/placeholder.svg"}
                  alt={slides[currentSlide].caption}
                  fill
                  style={{ objectFit: "contain" }}
                  priority
                />
              </div>
              <h2 className="text-4xl font-light text-purple-500">{slides[currentSlide].caption}</h2>
              <div className="mt-6 flex justify-center gap-2">
                {slides.map((_, i) => (
                  <span
                    key={i}
                    className={`h-2 w-2 rounded-full ${i === currentSlide ? "bg-purple-500" : "bg-gray-300"}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
