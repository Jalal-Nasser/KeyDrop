"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

interface Slide {
  caption: string;
  image: string;
}

const slides: Slide[] = [
	{ caption: "Just Started", image: "/images/layerslider-02-bear.png" },
	{ caption: "Lets Paint it", image: "/images/layerslider-03-cat.png" },
]

export function HeroSlider() {
	const [currentSlide, setCurrentSlide] = useState(0)

	// Auto-slide effect
	useEffect(() => {
		// Commented out for now to disable auto-sliding
		// const interval = setInterval(() => {
		// 	setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
		// }, 4000) // Change slide every 4 seconds
		// return () => clearInterval(interval)
	}, [])

	return (
		<section className="relative py-0 overflow-hidden w-full">
			{/* Main slider container */}
			<div className="relative w-full h-[250px] sm:h-[400px] md:h-[500px] lg:h-[667px] overflow-hidden bg-white">
				{/* Image */}
				<Image
					src={slides[currentSlide].image || "/placeholder.svg"}
					alt={slides[currentSlide].caption}
					fill
					style={{ objectFit: "contain" }}
					priority
				/>

				{/* Overlay for text and arrows */}
				<div className="absolute inset-0 bg-transparent flex items-end justify-center p-4 pb-8"> {/* Changed items-center to items-end and added pb-8 */}
					{/* Caption */}
					<h2 className="text-blue-600 text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold"> {/* Changed text-white to text-blue-600 */}
						{slides[currentSlide].caption}
					</h2>
				</div>

				{/* Left Arrow */}
				<button
					className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
					onClick={() =>
						setCurrentSlide((prev: number) =>
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
						setCurrentSlide((prev: number) =>
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
				{slides.map((_: Slide, i: number) => (
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