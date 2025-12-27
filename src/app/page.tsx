import Link from "next/link"
import { Button } from "@/components/ui/button"
import WeeklyProducts from "@/components/weekly-products"
// import Hero from "@/components/hero" // Assuming Hero existed, but for now fallback to simple header

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section Placeholder */}
      <section className="bg-gray-900 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Welcome to KeyDrop</h1>
          <p className="text-xl mb-8 text-gray-300">Premium Software Keys at Unbeatable Prices</p>
          <div className="flex justify-center gap-4">
            <Button asChild className="bg-blue-600 hover:bg-blue-700 h-11 px-8 text-lg">
              <Link href="/shop">Browse Shop</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <WeeklyProducts title="Weekly Best Sellers" />

    </div>
  )
}
