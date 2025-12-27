// This file provides fixed type definitions for Supabase

declare module '@/types/supabase-fixed' {
  export interface Database {
    public: {
      Tables: {
        orders: {
          Row: {
            id: string;
            user_id: string;
            product_id: string;
            amount: number;
            total: number;
            status: string;
            payment_gateway: string;
            payment_id: string;
            created_at: string;
            updated_at: string;
          };
          Insert: {
            id?: string;
            user_id: string;
            product_id: string;
            amount: number;
            total: number;
            status?: string;
            payment_gateway: string;
            payment_id: string;
            created_at?: string;
            updated_at?: string;
          };
          Update: {
            id?: string;
            user_id?: string;
            product_id?: string;
            amount?: number;
            total?: number;
            status?: string;
            payment_gateway?: string;
            payment_id?: string;
            created_at?: string;
            updated_at?: string;
          };
        };
        // Add other tables as needed
      };
    };
  }
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];
