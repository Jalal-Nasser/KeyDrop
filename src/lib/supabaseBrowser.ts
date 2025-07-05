import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { SupabaseClient } from "@supabase/supabase-js";

let supabase: SupabaseClient | undefined;

export const createSupabaseBrowserClient = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Missing Supabase environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.");
  }
  if (!supabase) {
    supabase = createClientComponentClient();
  }
  return supabase;
};