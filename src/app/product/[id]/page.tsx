import { notFound } from "next/navigation"
import { Product } from "@/types/product"
import { ProductDetailsClient } from "@/components/product-details-client"
import { createSupabaseServerClientComponent } from "@/lib/supabase/server" // Updated import
import { Metadata } from "next"
import { Tables } from "@/types/supabase" // Import Tables type

interface ProductPageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const productId = parseInt(params.id)
  const supabase = await createSupabaseServerClientComponent() // Await the client

  const { data: product, error } = await supabase
    .from("products")
    .select("name, description, seo_title, seo_description, seo_keywords, image")
    .eq("id", productId)
    .single() as { data: Pick<Tables<'products'>, 'name' | 'description' | 'seo_title' | 'seo_description' | 'seo_keywords' | 'image'> | null, error: any }; // Explicitly type product

  if (error || !product) {
    return {
      title: "Product Not Found",
      description: "The product you are looking for does not exist.",
    }
  }

  return {
    title: product.seo_title || product.name,
    description: product.seo_description || product.description || `Discover ${product.name} at Dropskey.`,
    keywords: product.seo_keywords?.split(',').map((keyword: string) => keyword.trim()) || [product.name, "digital key", "software", "dropskey"],
    openGraph: {
      title: product.seo_title || product.name,
      description: product.seo_description || product.description || `Discover ${product.name} at Dropskey.`,
      images: product.image ? [{ url: product.image }] : [],
    },
  }
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const productId = parseInt(params.id)
  const supabase = await createSupabaseServerClientComponent() // Await the client

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .single()

  if (error || !product) {
    console.error("Error fetching product details:", error);
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 bg-background">
      <ProductDetailsClient product={product as Product} />
    </div>
  )
}