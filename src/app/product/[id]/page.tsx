import { notFound } from "next/navigation"
import products from "@/data/products.json"
import { Product } from "@/types/product"
import { ProductDetailsClient } from "@/components/product-details-client"

export async function generateStaticParams() {
  return products.map((product) => ({
    id: product.id.toString(),
  }))
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const productId = parseInt(params.id)
  const product: Product | undefined = (products as Product[]).find(
    (p) => p.id === productId
  )

  if (!product) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <ProductDetailsClient product={product} />
    </div>
  )
}