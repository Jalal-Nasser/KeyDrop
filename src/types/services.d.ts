import { Database } from "./supabase";

declare module "./supabase" {
  interface Database {
    public: {
      Tables: {
        services: {
          Row: {
            id: number;
            name: string;
            description: string | null;
            base_price: number;
            price_per_user: number;
            is_active: boolean | null;
            created_at: string | null;
            updated_at: string | null;
            assigned_coupon_id?: string | null;
          };
          Insert: {
            id?: number;
            name: string;
            description?: string | null;
            base_price: number;
            price_per_user: number;
            is_active?: boolean | null;
            created_at?: string | null;
            updated_at?: string | null;
            assigned_coupon_id?: string | null;
          };
          Update: {
            id?: number;
            name?: string;
            description?: string | null;
            base_price?: number;
            price_per_user?: number;
            is_active?: boolean | null;
            created_at?: string | null;
            updated_at?: string | null;
            assigned_coupon_id?: string | null;
          };
        };
      };
    };
  }
}