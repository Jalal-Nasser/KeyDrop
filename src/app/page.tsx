import { HeroSlider } from "@/components/hero-slider"
import { WeeklyProducts } from "@/components/weekly-products"

export default async function Home() {
  return (
    <>
      <HeroSlider />
      <WeeklyProducts />
    </>
  )
}
