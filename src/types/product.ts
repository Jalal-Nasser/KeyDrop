export interface Product {
  id: number
  name: string
  description?: string
  price: string
  image?: string | string[]
  is_digital?: boolean
  download_url?: string
}