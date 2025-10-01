import { createClient, SupabaseClient } from "@supabase/supabase-js"
import { Database } from "@/types/supabase-fixed"

// Removed hard-coded fallback values.
// These should only come from environment variables.

let _supabase: SupabaseClient<Database> | null = null
let _failedCreateCount = 0

// Sync method to get public env on client
function getClientEnv(): { url: string, key: string } {
  try {
    if (typeof window !== 'undefined') {
      const pub = (window as any).__PUBLIC_ENV || {}
      const url = pub.NEXT_PUBLIC_SUPABASE_URL
      const key = pub.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (url && key) {
        return { url, key }
      }
    }
  } catch (e) {
    console.warn("Error accessing window.__PUBLIC_ENV:", e)
  }
  
  return { url: "", key: "" }
}

// Detect if we're in browser environment
function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

export function getSupabaseBrowserClient(): SupabaseClient<Database> {
  if (_supabase) return _supabase
  
  try {
    // Try to prevent too many client creation attempts
    if (_failedCreateCount > 2) {
      console.warn("Too many failed Supabase client creation attempts - cannot initialize client.")
      throw new Error("Supabase client initialization failed too many times.")
    }

    let supabaseUrl: string;
    let supabaseKey: string;

    if (isBrowser()) {
      const clientEnv = getClientEnv();
      supabaseUrl = clientEnv.url;
      supabaseKey = clientEnv.key;
    } else {
      // This branch should ideally not be hit for getSupabaseBrowserClient,
      // but as a safeguard, use process.env if somehow called server-side.
      supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL as string) || '';
      supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string) || '';
    }

    // Verify we have values before creating client
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase URL or key from environment variables.")
    }
    
    _supabase = createClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
    
    return _supabase
  } catch (e) {
    console.error("Error creating Supabase client:", e)
    _failedCreateCount++
    
    // If client creation fails, return a dummy client to prevent further errors
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