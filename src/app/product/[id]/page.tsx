import { notFound } from "next/navigation"
import { Product } from "@/types/product"
import { ProductDetailsClient } from "@/components/product-details-client"
import { createSupabaseServerClient } from "@/lib/supabaseServer"

// This function tells Next.js which dynamic paths to pre-render at build time.
export async function generateStaticParams() {
  const supabase = createSupabaseServerClient()
  const { data: products, error } = await supabase
    .from("products")
    .select("id")

  if (error) {
    console.error("Error fetching product IDs for static params:", error)
    return []
  }

  return products.map((product) => ({
    id: product.id.toString(),
  }))
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const productId = parseInt(params.id)
  const supabase = createSupabaseServerClient()

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .single()

  if (error || !product) {
    console.error(`Error fetching product ${productId}:`, error)
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <ProductDetailsClient product={product as Product} />
    </div>
  )
}