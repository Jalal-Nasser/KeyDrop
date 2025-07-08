import { HeroSection } from "@/components/hero-section"
import WeeklyProducts from "@/components/weekly-products"
import { FeaturesSection } from "@/components/features-section"

export default function Home() {
  return (
    <>
      <HeroSection />
      <WeeklyProducts title="Most Sold Products" />
      <FeaturesSection />
    </>
  )
}