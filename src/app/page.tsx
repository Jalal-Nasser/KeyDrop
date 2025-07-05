import { HeroSection } from "@/components/hero-section"
import { WeeklyProducts } from "@/components/weekly-products"
import { FeaturesSection } from "@/components/features-section"
import { createSupabaseServerClient } from "@/lib/supabaseServer"
import { Product } from "@/types/product"

export default async function Home() {
  const supabase = createSupabaseServerClient()
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("id", { ascending: true })
    .limit(8) // Limit to 8 for weekly products

  if (error) {
    console.error("Error fetching weekly products:", error)
    // Handle error, perhaps pass an empty array or a specific error state
  }

  return (
    <>
      <HeroSection />
      <WeeklyProducts title="Most Sold Products" products={products as Product[] || []} />
      <FeaturesSection />
    </>
  )
}