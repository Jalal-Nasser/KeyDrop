export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: number
          name: string
          description: string | null
          price: number
          image: string | null
          is_digital: boolean | null
          download_url: string | null
          sale_price: number | null
          is_on_sale: boolean | null
          sale_percent: number | null
          sku: string | null
          tag: string | null
          category: string | null
          is_most_sold: boolean | null
          seo_title: string | null
          seo_description: string | null
          seo_keywords: string | null
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          price: number
          image?: string | null
          is_digital?: boolean | null
          download_url?: string | null
          sale_price?: number | null
          is_on_sale?: boolean | null
          sale_percent?: number | null
          sku?: string | null
          tag?: string | null
          category?: string | null
          is_most_sold?: boolean | null
          seo_title?: string | null
          seo_description?: string | null
          seo_keywords?: string | null
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          price?: number
          image?: string | null
          is_digital?: boolean | null
          download_url?: string | null
          sale_price?: number | null
          is_on_sale?: boolean | null
          sale_percent?: number | null
          sku?: string | null
          tag?: string | null
          category?: string | null
          is_most_sold?: boolean | null
          seo_title?: string | null
          seo_description?: string | null
          seo_keywords?: string | null
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
          amounts: Json | null // Added
          promo_code: string | null // Added
          promo_snapshot: Json | null // Added
        }
        Insert: {
          id?: string
          user_id: string
          status?: string
          total: number
          created_at?: string
          payment_gateway?: string | null
          payment_id?: string | null
          amounts?: Json | null // Added
          promo_code?: string | null // Added
          promo_snapshot?: Json | null // Added
        }
        Update: {
          id?: string
          user_id?: string
          status?: string
          total?: number
          created_at?: string
          payment_gateway?: string | null
          payment_id?: string | null
          amounts?: Json | null // Added
          promo_code?: string | null // Added
          promo_snapshot?: Json | null // Added
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: number
          quantity: number
          price_at_purchase: number
          product_key: string | null
          product_name: string | null // Added
          sku: string | null // Added
          unit_price: number | null // Added
          line_total: number | null // Added
          products: Database['public']['Tables']['products']['Row'][] | null
        }
        Insert: {
          id?: string
          order_id: string
          product_id: number
          quantity: number
          price_at_purchase: number
          product_key?: string | null
          product_name?: string | null // Added
          sku?: string | null // Added
          unit_price?: number | null // Added
          line_total?: number | null // Added
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: number
          quantity?: number
          price_at_purchase?: number
          product_key?: string | null
          product_name?: string | null // Added
          sku?: string | null // Added
          unit_price?: number | null // Added
          line_total?: number | null // Added
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
      services: {
        Row: {
          id: number
          name: string
          description: string | null
          base_price: number
          price_per_user: number
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
          assigned_coupon_id?: string | null
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          base_price: number
          price_per_user: number
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          assigned_coupon_id?: string | null
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          base_price?: number
          price_per_user?: number
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          assigned_coupon_id?: string | null
        }
      }
      promotions: { // Added promotions table definition
        Row: {
          id: string
          code: string
          type: string
          value: number
          applies_to: string | null
          product_ids: number[] | null
          min_subtotal: number | null
          start_at: string | null
          end_at: string | null
          usage_limit: number | null
          per_user_limit: number | null
          is_active: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          type: string
          value: number
          applies_to?: string | null
          product_ids?: number[] | null
          min_subtotal?: number | null
          start_at?: string | null
          end_at?: string | null
          usage_limit?: number | null
          per_user_limit?: number | null
          is_active?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          type?: string
          value?: number
          applies_to?: string | null
          product_ids?: number[] | null
          min_subtotal?: number | null
          start_at?: string | null
          end_at?: string | null
          usage_limit?: number | null
          per_user_limit?: number | null
          is_active?: boolean | null
          created_at?: string
        }
      }
    }
    Views: {}
    Functions: {
      generate_unique_sku: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {}
    CompositeTypes: {}
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never