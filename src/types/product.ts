export interface Product {
  id: number
  name: string
  description?: string
  price: string
  image?: string | string[]
  is_digital?: boolean
  download_url?: string
  sale_price?: number // Added
  is_on_sale?: boolean // Added
  sale_percent?: number // Added
}