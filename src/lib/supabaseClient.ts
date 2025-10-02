import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase-fixed' // Using supabase-fixed for type safety

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true, // Keep this for OAuth redirects
    },
  }
)