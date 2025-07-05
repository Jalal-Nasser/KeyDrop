export interface Product {
  id: number
  name: string
  description?: string
  price: string
  image?: string | string[]
  is_digital?: boolean
  download_url?: string
  sale_price?: string // New: Optional sale price
  is_on_sale?: boolean // New: Indicates if the product is on sale
  sale_percent?: number // New: Calculated sale percentage
}