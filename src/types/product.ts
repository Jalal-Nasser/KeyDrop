export interface Product {
  id: number
  name: string
  description?: string | null
  price: number
  image?: string | null
  is_digital?: boolean
  download_url?: string | null
  sale_price?: number | null
  is_on_sale?: boolean
  sale_percent?: number | null
  sku?: string | null
  tag?: string | null
  category?: string | null
  is_most_sold?: boolean
  featured?: boolean
  inventory_count?: number | null // Added inventory_count
  created_at?: string
  // SEO fields
  seo_title?: string | null
  seo_description?: string | null
  seo_keywords?: string | null
}