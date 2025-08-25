import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { SupabaseClient } from "@supabase/supabase-js"
import { Database } from "@/types/supabase"

let _supabase: SupabaseClient<Database> | null = null

export function getSupabaseBrowserClient(): SupabaseClient<Database> {
  if (_supabase) return _supabase
  const pub: any = (typeof window !== 'undefined' && (window as any).__PUBLIC_ENV) || {}
  _supabase = createClientComponentClient<Database>({
    supabaseUrl: (process.env.NEXT_PUBLIC_SUPABASE_URL as string) || pub.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string) || pub.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  })
  return _supabase
}