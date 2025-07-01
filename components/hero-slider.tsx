"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

const slides = [
	{ caption: "Just Started", image: "/images/layerslider-02-bear.png" },
	{ caption: "Lets Paint it", image: "/images/layerslider-03-cat.png" },
]

export function HeroSlider() {
	const [currentSlide, setCurrentSlide] = useState(0)

	// Auto-slide effect
	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
		}, 4000) // Change slide every 4 seconds
		return () => clearInterval(interval)
	}, [])

	return (
		<section className="relative py-0 overflow-hidden">
			{/* Main slider container */}
			<div className="relative w-full max-w-full lg:max-w-[1515px] h-[250px] sm:h-[400px] md:h-[500px] lg:h-[667px] mx-auto overflow-hidden">
				{/* Image */}
				<Image
					src={slides[currentSlide].image || "/placeholder.svg"}
					alt={slides[currentSlide].caption}
					fill
					style={{ objectFit: "cover" }} // Changed to cover for full-bleed
					priority
				/>

				{/* Overlay for text and arrows */}
				<div className="absolute inset-0 bg-black/20 flex items-center justify-center p-4">
					{/* Caption */}
					<h2 className="text-white text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold drop-shadow-lg">
						{slides[currentSlide].caption}
					</h2>
				</div>

				{/* Left Arrow */}
				<button
					className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
					onClick={() =>
						setCurrentSlide((prev) =>
							prev === 0 ? slides.length - 1 : prev - 1
						)
					}
					aria-label="Previous slide"
				>
					<ChevronLeft className="w-8 h-8 text-white" />
				</button>

				{/* Right Arrow */}
				<button
					className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
					onClick={() =>
						setCurrentSlide((prev) =>
							prev === slides.length - 1 ? 0 : prev + 1
						)
					}
					aria-label="Next slide"
				>
					<ChevronRight className="w-8 h-8 text-white" />
				</button>
			</div>

			{/* Dots - kept below the image */}
			<div className="mt-6 flex justify-center gap-2">
				{slides.map((_, i) => (
					<span
						key={i}
						className={`h-2 w-2 rounded-full ${
							i === currentSlide
								? "bg-purple-500"
								: "bg-gray-300"
						}`}
					/>
				))}
			</div>
		</section>
	)
}