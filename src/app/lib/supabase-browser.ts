import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase-fixed';
import type { Session } from '@supabase/supabase-js';

// Create a single supabase client for interacting with your database
const createSupabaseClient = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables');
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          if (typeof document === 'undefined') return [];
          return document.cookie.split('; ').map(cookie => {
            const [name, ...value] = cookie.split('=');
            return { name, value: value.join('=') };
          });
        },
        setAll(cookiesToSet) {
          if (typeof document === 'undefined') return;
          cookiesToSet.forEach(({ name, value, options }) => {
            document.cookie = `${name}=${value}; ${Object.entries(options || {})
              .map(([key, val]) => `${key}=${val}`)
              .join('; ')}`;
          });
        },
      },
    }
  );
};

// Create a single supabase client for interacting with your database
export const supabase = createSupabaseClient();

// Log auth state changes for debugging
if (typeof window !== 'undefined') {
  supabase.auth.onAuthStateChange((event: string, session: Session | null) => {
    console.log('Auth state changed:', event, session);
  });
}
