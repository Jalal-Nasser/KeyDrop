"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

export function HeroSlider() {
  const [idx, setIdx] = useState(0)
  const slides = [
    { caption: "Just Started", emoji: "🐼" },
    { caption: "Lets Paint it", emoji: "🐱" },
  ]

  return (
    <section className="relative bg-white py-20">
      <button
        onClick={() => setIdx((idx + slides.length - 1) % slides.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-3 shadow"
      >
        <ChevronLeft />
      </button>
      <button
        onClick={() => setIdx((idx + 1) % slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-3 shadow"
      >
        <ChevronRight />
      </button>

      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-8 text-8xl">{slides[idx].emoji}</div>
        <h2 className="text-4xl font-light text-purple-500">{slides[idx].caption}</h2>
        <div className="mt-6 flex justify-center gap-2">
          {slides.map((_, i) => (
            <span key={i} className={`h-2 w-2 rounded-full ${i === idx ? "bg-purple-500" : "bg-gray-300"}`} />
          ))}
        </div>
      </div>
    </section>
  )
}
