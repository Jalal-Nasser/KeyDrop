import { HeroSlider } from "@/components/hero-slider"
import { WeeklyProducts } from "@/components/weekly-products"
import { SeedProductsButton } from "@/components/seed-button"
import { getProductsFromDb } from "@/app/actions/product-actions"

export default async function Home() {
  const initialProducts = await getProductsFromDb({ limit: 8 });

  return (
    <main className="flex min-h-screen flex-col">
      <HeroSlider />
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <h2 className="text-2xl font-semibold mb-8" style={{ color: "#1e73be" }}>
          Weekly Products
        </h2>
        <div className="mb-8">
          <SeedProductsButton />
        </div>
      </div>
      <WeeklyProducts initialProducts={initialProducts} />
    </main>
  )
}