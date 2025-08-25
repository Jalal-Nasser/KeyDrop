import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase-wrapper'

// Fallback values as absolute last resort
const FALLBACK_URL = "https://notncpmpmgostfxesrvk.supabase.co"
const FALLBACK_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vdG5jcG1wbWdvc3RmeGVzcnZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MzUyMjEsImV4cCI6MjA2NzExMTIyMX0.I5_c7ZC3bab-q1q_sg9-bVVpTb15wBbNw5vPie-P77s"

// Direct client creation without env validation
export function createDirectSupabaseClient(): SupabaseClient<Database> {
  // Dynamic import to avoid SSR issues
  const { createClient } = require('@supabase/supabase-js')
  
  // Try to get values from various sources with ultimate fallback
  let url = FALLBACK_URL
  let key = FALLBACK_KEY
  
  try {
    if (typeof window !== 'undefined') {
      const env = (window as any).__PUBLIC_ENV || {}
      url = env.NEXT_PUBLIC_SUPABASE_URL || url
      key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || key
    }
  } catch (e) {
    console.warn('Error accessing window.__PUBLIC_ENV:', e)
  }

  // Create client directly with no validation
  return createClient(url, key) as SupabaseClient<Database>
}
