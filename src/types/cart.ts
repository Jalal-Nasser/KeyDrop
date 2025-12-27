import { Product } from "./product"

export interface CartItem extends Product {
  quantity: number
  is_on_sale?: boolean
  sale_price?: number | null
  original_price?: number
}