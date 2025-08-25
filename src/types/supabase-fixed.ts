export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      contact_messages: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          ip: unknown;
          message: string;
          message_sha: string;
          name: string;
          subject: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          ip?: unknown;
          message: string;
          message_sha?: string;
          name: string;
          subject: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          ip?: unknown;
          message?: string;
          message_sha?: string;
          name?: string;
          subject?: string;
        };
        Relationships: [];
      };
      coupons: {
        Row: {
          assigned_user_id: string | null;
          code: string;
          created_at: string | null;
          discount_percent: number;
          id: string;
          is_applied: boolean;
        };
        Insert: {
          assigned_user_id?: string | null;
          code: string;
          created_at?: string | null;
          discount_percent: number;
          id?: string;
          is_applied?: boolean;
        };
        Update: {
          assigned_user_id?: string | null;
          code?: string;
          created_at?: string | null;
          discount_percent?: number;
          id?: string;
          is_applied?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "coupons_assigned_user_id_fkey";
            columns: ["assigned_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      order_items: {
        Row: {
          created_at: string;
          id: string;
          line_total: number | null;
          order_id: string;
          price: number;
          product_id: number;
          product_name: string;
          quantity: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          line_total?: number | null;
          order_id: string;
          price: number;
          product_id: number;
          product_name: string;
          quantity?: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          line_total?: number | null;
          order_id?: string;
          price?: number;
          product_id?: number;
          product_name?: string;
          quantity?: number;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          }
        ];
      };
      orders: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          payment_intent_id: string | null;
          payment_status: string;
          subtotal: number;
          tax: number;
          total: number;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          payment_intent_id?: string | null;
          payment_status?: string;
          subtotal: number;
          tax: number;
          total: number;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          payment_intent_id?: string | null;
          payment_status?: string;
          subtotal?: number;
          tax?: number;
          total?: number;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      products: {
        Row: {
          category: string | null;
          created_at: string;
          description: string | null;
          featured: boolean;
          id: number;
          image: string | null;
          inventory_count: number | null;
          is_digital: boolean;
          is_on_sale: boolean;
          name: string;
          price: number;
          product_keys: string[] | null;
          sale_percent: number | null;
          sale_price: number | null;
          sku: string | null;
        };
        Insert: {
          category?: string | null;
          created_at?: string;
          description?: string | null;
          featured?: boolean;
          id?: number;
          image?: string | null;
          inventory_count?: number | null;
          is_digital?: boolean;
          is_on_sale?: boolean;
          name: string;
          price: number;
          product_keys?: string[] | null;
          sale_percent?: number | null;
          sale_price?: number | null;
          sku?: string | null;
        };
        Update: {
          category?: string | null;
          created_at?: string;
          description?: string | null;
          featured?: boolean;
          id?: number;
          image?: string | null;
          inventory_count?: number | null;
          is_digital?: boolean;
          is_on_sale?: boolean;
          name?: string;
          price?: number;
          product_keys?: string[] | null;
          sale_percent?: number | null;
          sale_price?: number | null;
          sku?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string | null;
          email: string | null;
          first_name: string | null;
          id: string;
          last_name: string | null;
          role: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          email?: string | null;
          first_name?: string | null;
          id: string;
          last_name?: string | null;
          role?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string | null;
          first_name?: string | null;
          id?: string;
          last_name?: string | null;
          role?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      promotions: {
        Row: {
          applies_to: string | null;
          code: string;
          created_at: string | null;
          end_at: string | null;
          id: string;
          is_active: boolean | null;
          min_subtotal: number | null;
          per_user_limit: number | null;
          product_ids: number[] | null;
          start_at: string | null;
          type: string;
          usage_limit: number | null;
          value: number;
        };
        Insert: {
          applies_to?: string | null;
          code: string;
          created_at?: string | null;
          end_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          min_subtotal?: number | null;
          per_user_limit?: number | null;
          product_ids?: number[] | null;
          start_at?: string | null;
          type: string;
          usage_limit?: number | null;
          value: number;
        };
        Update: {
          applies_to?: string | null;
          code?: string;
          created_at?: string | null;
          end_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          min_subtotal?: number | null;
          per_user_limit?: number | null;
          product_ids?: number[] | null;
          start_at?: string | null;
          type?: string;
          usage_limit?: number | null;
          value?: number;
        };
        Relationships: [];
      };
      wishlist_items: {
        Row: {
          created_at: string;
          id: string;
          product_id: number;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          product_id: number;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          product_id?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "wishlist_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "wishlist_items_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
