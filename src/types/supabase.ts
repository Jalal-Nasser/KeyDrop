export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: number
          name: string
          description: string | null
          price: number // Changed from string to number
          image: string | null
          is_digital: boolean | null
          download_url: string | null
          sale_price: number | null
          is_on_sale: boolean | null
          sale_percent: number | null
          sku: string | null // Added
          tag: string | null // Added
          category: string | null // Added
          is_most_sold: boolean | null // Added
          seo_title: string | null // Added
          seo_description: string | null // Added
          seo_keywords: string | null // Added
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          price: number // Changed from string to number
          image?: string | null
          is_digital?: boolean | null
          download_url?: string | null
          sale_price?: number | null
          is_on_sale?: boolean | null
          sale_percent?: number | null
          sku?: string | null // Added (will be auto-generated)
          tag?: string | null // Added
          category?: string | null // Added
          is_most_sold?: boolean | null // Added
          seo_title?: string | null // Added
          seo_description?: string | null // Added
          seo_keywords?: string | null // Added
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          price?: number // Changed from string to number
          image?: string | null
          is_digital?: boolean | null
          download_url?: string | null
          sale_price?: number | null
          is_on_sale?: boolean | null
          sale_percent?: number | null
          sku?: string | null // Added (should not be updated manually)
          tag?: string | null // Added
          category?: string | null // Added
          is_most_sold?: boolean | null // Added
          seo_title?: string | null // Added
          seo_description?: string | null // Added
          seo_keywords?: string | null // Added
        }
      }
      profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          company_name: string | null
          vat_number: string | null
          address_line_1: string | null
          address_line_2: string | null
          city: string | null
          state_province_region: string | null
          postal_code: string | null
          country: string | null
          is_admin: boolean | null
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          company_name?: string | null
          vat_number?: string | null
          address_line_1?: string | null
          address_line_2?: string | null
          city?: string | null
          state_province_region?: string | null
          postal_code?: string | null
          country?: string | null
          is_admin?: boolean | null
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          company_name?: string | null
          vat_number?: string | null
          address_line_1?: string | null
          address_line_2?: string | null
          city?: string | null
          state_province_region?: string | null
          postal_code?: string | null
          country?: string | null
          is_admin?: boolean | null
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          status: string
          total: number
          created_at: string
          payment_gateway: string | null
          payment_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          status?: string
          total: number
          created_at?: string
          payment_gateway?: string | null
          payment_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          status?: string
          total?: number
          created_at?: string
          payment_gateway?: string | null
          payment_id?: string | null
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: number
          quantity: number
          price_at_purchase: number
        }
        Insert: {
          id?: string
          order_id: string
          product_id: number
          quantity: number
          price_at_purchase: number
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: number
          quantity?: number
          price_at_purchase?: number
        }
      }
      wishlist_items: {
        Row: {
          id: string
          user_id: string
          product_id: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: number
          created_at?: string
        }
      }
      coupons: {
        Row: {
          id: string
          code: string
          discount_percent: number
          assigned_user_id: string | null
          is_applied: boolean
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          discount_percent: number
          assigned_user_id?: string | null
          is_applied?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          discount_percent?: number
          assigned_user_id?: string | null
          is_applied?: boolean
          created_at?: string
        }
      }
      store_notices: {
        Row: {
          id: string
          content: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          content: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          content?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      // Add views if any
    }
    Functions: {
      generate_unique_sku: { // Added
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      update_updated_at_column: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      // Add functions if any
    }
    Enums: {
      // Add enums if any
    }
    CompositeTypes: {
      // Add composite types if any
    }
  }
}