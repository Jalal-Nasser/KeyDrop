export interface Product {
  id: number
  name: string
  description?: string
  price: string
  image?: string | string[]
  is_digital?: boolean
  download_url?: string
  sale_price?: string // New: Price when on sale
  is_on_sale?: boolean // New: Flag to indicate if product is on sale
  sale_percent?: number // New: Percentage discount for sale
}