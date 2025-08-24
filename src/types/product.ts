export interface Product {
  id: number
  name: string
  description?: string | null // Changed to allow null
  price: number
  image?: string | null
  is_digital?: boolean
  download_url?: string | null // Changed to allow null
  sale_price?: number | null // Changed to allow null
  is_on_sale?: boolean
  sale_percent?: number | null // Changed to allow null
  // New fields
  sku?: string | null // Changed to allow null
  tag?: string | null // Changed to allow null
  category?: string | null // Changed to allow null
  is_most_sold?: boolean
  // SEO fields
  seo_title?: string | null
  seo_description?: string | null
  seo_keywords?: string | null
}