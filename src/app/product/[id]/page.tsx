import { notFound } from "next/navigation"
import products from "@/data/products.json"
import { Product } from "@/types/product"
import { ProductDetailsClient } from "@/components/product-details-client" // New import

// This function tells Next.js which dynamic paths to pre-render at build time.
export async function generateStaticParams() {
  // Map all product IDs to an array of objects with a 'id' property (as a string).
  return products.map((product) => ({
    id: product.id.toString(),
  }))
}

export default function ProductPage({ params }: { params: { id: string } }) {
  // Parse the ID from the URL params to a number
  const productId = parseInt(params.id)
  // Find the product in your local JSON data
  const product: Product | undefined = (products as Product[]).find(
    (p) => p.id === productId
  )

  // If the product is not found, render the Next.js notFound page
  if (!product) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <ProductDetailsClient product={product} />
    </div>
  )
}