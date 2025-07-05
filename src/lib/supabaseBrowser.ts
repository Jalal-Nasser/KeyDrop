import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { SupabaseClient } from "@supabase/supabase-js";

let supabase: SupabaseClient | undefined;

export const createSupabaseBrowserClient = () => {
  if (!supabase) {
    supabase = createClientComponentClient();
  }
  return supabase;
};