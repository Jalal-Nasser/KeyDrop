"use client";

import { supabase } from "@/integrations/supabase/client"; // Import the new centralized client
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase-fixed";

export function useSupabase(): SupabaseClient<Database> {
  // This hook now simply returns the pre-initialized client
  return supabase;
}