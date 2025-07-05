import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { SupabaseClient } from "@supabase/supabase-js"

export function createSupabaseServerClient(): SupabaseClient {
  return createServerComponentClient({ cookies })
}