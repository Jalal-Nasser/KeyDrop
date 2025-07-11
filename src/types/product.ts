export interface Product {
  id: number
  name: string
  description?: string
  price: number // Changed from string to number
  image?: string | null
  is_digital?: boolean
  download_url?: string
  sale_price?: number
  is_on_sale?: boolean
  sale_percent?: number
  // New fields
  sku?: string
  tag?: string
  category?: string
  is_most_sold?: boolean
  // SEO fields
  seo_title?: string | null
  seo_description?: string | null
  seo_keywords?: string | null
}