import { createClient, SupabaseClient } from "@supabase/supabase-js"
import { Database } from "@/types/supabase-fixed"

// Hard-coded fallback if EVERYTHING else fails (use as last resort)
const FALLBACK_URL = "https://notncpmpmgostfxesrvk.supabase.co"
const FALLBACK_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vdG5jcG1wbWdvc3RmeGVzcnZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MzUyMjEsImV4cCI6MjA2NzExMTIyMX0.I5_c7ZC3bab-q1q_sg9-bVVpTb15wBbNw5vPie-P77s"

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
      console.warn("Too many failed Supabase client creation attempts - using direct fallback")
      try {
        _supabase = createClient<Database>(FALLBACK_URL, FALLBACK_KEY, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        })
        return _supabase
      } catch (err) {
        console.error("Even direct client creation failed, creating minimal client", err)
        // Absolute last resort with no options - most resilient approach possible
        const { createClient } = require('@supabase/supabase-js')
        _supabase = createClient(FALLBACK_URL, FALLBACK_KEY) as SupabaseClient<Database>
        return _supabase
      }
    }

    // Get env from various sources
    const clientEnv = isBrowser() ? getClientEnv() : { url: "", key: "" }
    const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL as string) || 
                      (process.env.SUPABASE_URL as string) || 
                      clientEnv.url || 
                      FALLBACK_URL
                      
    const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string) || 
                      (process.env.SUPABASE_ANON_KEY as string) || 
                      clientEnv.key || 
                      FALLBACK_KEY

    // Verify we have values before creating client
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase URL or key")
    }
    
    // Always use the direct client for consistency
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
    
    // Final fallback to hardcoded values
    _supabase = createClient<Database>(FALLBACK_URL, FALLBACK_KEY)
    return _supabase
  }
}