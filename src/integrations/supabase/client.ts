import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { SupabaseClient } from "@supabase/supabase-js"
import { Database } from "@/types/supabase"

let _supabase: SupabaseClient<Database> | null = null

export function getSupabaseBrowserClient(): SupabaseClient<Database> {
  if (_supabase) return _supabase
  _supabase = createClientComponentClient<Database>({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
  })
  return _supabase
}