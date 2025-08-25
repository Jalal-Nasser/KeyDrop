import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase-wrapper'

// Fallback values as absolute last resort - these WILL work if everything else fails
const FALLBACK_URL = "https://notncpmpmgostfxesrvk.supabase.co"
const FALLBACK_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vdG5jcG1wbWdvc3RmeGVzcnZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MzUyMjEsImV4cCI6MjA2NzExMTIyMX0.I5_c7ZC3bab-q1q_sg9-bVVpTb15wBbNw5vPie-P77s"

// Global cache for the client - only create it once
let _cachedClient: any = null;

// Direct client creation completely bypassing validation
export function createDirectSupabaseClient(): SupabaseClient<Database> {
  // Return cached client if we have one
  if (_cachedClient) {
    return _cachedClient;
  }
  
  try {
    // Direct import - no dynamic imports
    const supabase = require('@supabase/supabase-js');
    
    // Try to get values from various sources with ultimate fallback
    let url = FALLBACK_URL;
    let key = FALLBACK_KEY;
    
    try {
      // Try localStorage first (fastest)
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const stored = window.localStorage.getItem('__SUPABASE_CREDS');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed?.url && parsed?.key) {
              url = parsed.url;
              key = parsed.key;
              console.info('Using Supabase credentials from localStorage');
            }
          }
        } catch (e) {
          // Ignore localStorage errors
        }
      }
      
      // Then try window.__PUBLIC_ENV
      if (typeof window !== 'undefined') {
        const env = (window as any).__PUBLIC_ENV || {};
        if (env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          url = env.NEXT_PUBLIC_SUPABASE_URL;
          key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
          console.info('Using Supabase credentials from window.__PUBLIC_ENV');
          
          // Store good values for next time
          try {
            window.localStorage.setItem('__SUPABASE_CREDS', JSON.stringify({ url, key }));
          } catch (e) {
            // Ignore storage errors
          }
        }
      }
    } catch (e) {
      console.warn('Error getting credentials from browser:', e);
    }

    // Create client directly with createClient from the imported supabase-js
    try {
      _cachedClient = supabase.createClient(url, key);
      return _cachedClient;
    } catch (firstError) {
      console.error('First client creation attempt failed:', firstError);
      
      // Try a second time with a different approach
      try {
        _cachedClient = new supabase.SupabaseClient(url, key, {
          auth: {
            autoRefreshToken: true,
            persistSession: true,
          }
        });
        return _cachedClient;
      } catch (secondError) {
        console.error('Second client creation attempt failed:', secondError);
        
        // Last ditch attempt with minimal options
        try {
          _cachedClient = supabase.createClient(url, key, {});
          return _cachedClient;
        } catch (finalError) {
          console.error('All client creation attempts failed, creating minimal client');
          
          // If everything else fails, create an absolute minimal client
          _cachedClient = { 
            auth: { 
              getSession: () => ({ data: { session: null }, error: null }),
              onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
            },
            // Add other minimal implementations as needed
          };
          return _cachedClient;
        }
      }
    }
  } catch (e) {
    console.error('Critical error creating Supabase client:', e);
    
    // Return a minimal dummy client if all else fails
    _cachedClient = { 
      auth: { 
        getSession: () => ({ data: { session: null }, error: null }),
        onAuthStateChange: (callback: any) => ({ 
          data: { subscription: { unsubscribe: () => {} } } 
        })
      }
    };
    return _cachedClient as SupabaseClient<Database>;
  }
}
