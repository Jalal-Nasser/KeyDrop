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
		<section
			className="relative py-0 overflow-hidden"
			style={{ backgroundColor: "#f8f9fa" }}
		>
			{/* Main slider container */}
			<div className="relative w-full h-[400px] md:h-[500px] flex items-center">
				{/* Left Arrow - full height, far left */}
				<button
					className="absolute left-0 top-0 h-full flex items-center pl-2 z-10 bg-transparent hover:bg-white/40 rounded-none"
					onClick={() =>
						setCurrentSlide((prev) =>
							prev === 0 ? slides.length - 1 : prev - 1
						)
					}
					aria-label="Previous slide"
				>
					<ChevronLeft className="w-8 h-8 text-gray-600" />
				</button>
				{/* Image wrapper - centered */}
				<div className="relative w-full max-w-xl h-full mx-auto flex items-center justify-center">
					<Image
						src={slides[currentSlide].image || "/placeholder.svg"}
						alt={slides[currentSlide].caption}
						fill
						style={{ objectFit: "contain" }}
						priority
					/>
				</div>
				{/* Right Arrow - full height, far right */}
				<button
					className="absolute right-0 top-0 h-full flex items-center pr-2 z-10 bg-transparent hover:bg-white/40 rounded-none"
					onClick={() =>
						setCurrentSlide((prev) =>
							prev === slides.length - 1 ? 0 : prev + 1
						)
					}
					aria-label="Next slide"
				>
					<ChevronRight className="w-8 h-8 text-gray-600" />
				</button>
			</div>

			{/* Text content and dots - centered within max-w-7xl, placed below the image */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-8">
				<h2
					className="text-4xl font-light mb-8"
					style={{ color: "#9c88ff" }}
				>
					{slides[currentSlide].caption}
				</h2>
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
			</div>
		</section>
	)
}
