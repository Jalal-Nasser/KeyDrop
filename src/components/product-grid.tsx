import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { Product } from "@/types/product"
import { useCart } from "@/context/cart-context"

export function ProductGrid({ products }: { products: Product[] }) {
  const { addToCart } = useCart()
  // ... rest of component
}