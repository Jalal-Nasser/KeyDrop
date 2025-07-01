import { WeeklyProducts } from "@/components/weekly-products"

export default async function ShopPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Our Products</h1>
        <WeeklyProducts limit={20} /> {/* Display more products on the main shop page */}
      </div>
    </main>
  )
}
