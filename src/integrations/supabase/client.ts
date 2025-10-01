import { createClient, SupabaseClient } from "@supabase/supabase-js"
import { Database } from "@/types/supabase-fixed"

let _supabase: SupabaseClient<Database> | null = null
let _failedCreateCount = 0

// Sync method to get public env on client
function getClientEnv(): { url: string, key: string } {
  if (typeof window === 'undefined') {
    // This client is for the browser. If called server-side, it's an error.
    throw new Error("Supabase browser client cannot be initialized on the server during build/prerender.")
  }
  
  const pub = (window as any).__PUBLIC_ENV || {}
  const url = pub.NEXT_PUBLIC_SUPABASE_URL
  const key = pub.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) {
    throw new Error("Missing Supabase URL or key from window.__PUBLIC_ENV. Ensure environment variables are injected correctly.")
  }
  
  return { url, key }
}

export function getSupabaseBrowserClient(): SupabaseClient<Database> {
  if (_supabase) return _supabase
  
  try {
    if (_failedCreateCount > 2) {
      console.warn("Too many failed Supabase client creation attempts - cannot initialize client.")
      throw new Error("Supabase client initialization failed too many times.")
    }

    const clientEnv = getClientEnv(); // This will throw if not in browser or env missing
    const supabaseUrl = clientEnv.url;
    const supabaseKey = clientEnv.key;
    
    _supabase = createClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
    
    return _supabase
  } catch (e: any) {
    console.error("Error creating Supabase client:", e)
    _failedCreateCount++
    
    // Return a dummy client to prevent further errors in client-side code
    const dummyClient: any = { 
      auth: { 
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ 
          data: { subscription: { unsubscribe: () => {} } } 
        }),
        signOut: () => Promise.resolve({ error: null })
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: new Error('Dummy client: Supabase not initialized') })
          })
        })
      }),
      functions: {
        invoke: () => Promise.resolve({ data: null, error: new Error('Dummy client: Supabase functions not available') })
      }
    };
    _supabase = dummyClient as SupabaseClient<Database>;
    return _supabase;
  }
}