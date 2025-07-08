export interface Product {
  id: number
  name: string
  description?: string
  price: string
  image?: string | string[]
  is_digital?: boolean
  download_url?: string
  sale_price?: number
  is_on_sale?: boolean
  sale_percent?: number
  // New fields
  sku?: string
  tag?: string
  category?: string
  is_most_sold?: boolean // Added
}