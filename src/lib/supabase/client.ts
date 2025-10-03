import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase-wrapper';

// Type for our singleton
let supabaseInstance: ReturnType<typeof createBrowserClient<Database>> | null = null;

/**
 * Get or create the Supabase client instance
 * This ensures we only have one instance throughout the app
 */
export function getSupabaseClient() {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check your .env file.'
    );
  }

  supabaseInstance = createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    }
  );

  return supabaseInstance;
}

// Default export for backward compatibility
export const supabase = getSupabaseClient();
