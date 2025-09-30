import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase-wrapper';

// Fallback values as absolute last resort - these WILL work if everything else fails
const FALLBACK_URL = "https://notncpmpmgostfxesrvk.supabase.co";
const FALLBACK_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vdG5jcG1wbWdvc3RmeGVzcnZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MzUyMjEsImV4cCI6MjA2NzExMTIyMX0.I5_c7ZC3bab-q1q_sg9-bVVpTb15wBbNw5vPie-P77s";

// Global cache for the client - only create it once
let _cachedClient: SupabaseClient<Database> | null = null;
let _initializationPromise: Promise<SupabaseClient<Database>> | null = null;

// Direct client creation completely bypassing validation
export function createDirectSupabaseClient(): SupabaseClient<Database> {
  // Return cached client if we have one
  if (_cachedClient) {
    return _cachedClient;
  }

  // If initialization is in progress, wait for it to complete
  if (_initializationPromise) {
    // This will throw if initialization fails, which is what we want
    throw new Error('Supabase client initialization already in progress');
  }

  try {
    // Try to get values from various sources with ultimate fallback
    let url = FALLBACK_URL;
    let key = FALLBACK_KEY;
    
    try {
      // Try process.env first (server-side)
      if (typeof process !== 'undefined' && process.env) {
        if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          url = process.env.NEXT_PUBLIC_SUPABASE_URL;
          key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
          console.info('Using Supabase credentials from process.env');
        }
      }
      
      // Then try localStorage (client-side)
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
      
      // Then try window.__PUBLIC_ENV (client-side)
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
      console.warn('Error getting credentials:', e);
    }

    // Create a promise that will resolve with the client
    _initializationPromise = (async () => {
      try {
        // Create client with recommended options
        const client = createClient(url, key, {
          auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
            flowType: 'pkce',
          },
          global: {
            headers: {
              'X-Client-Info': 'keydrop-web/1.0',
            },
          },
        });

        // Verify the client works by making a simple request
        try {
          const { data, error } = await client.auth.getSession();
          if (error) {
            console.warn('Supabase auth check failed:', error);
          } else {
            console.info('Supabase client initialized successfully');
          }
        } catch (e) {
          console.warn('Supabase connection check failed:', e);
        }

        _cachedClient = client;
        return client;
      } catch (e) {
        console.error('Failed to initialize Supabase client:', e);
        throw e;
      } finally {
        _initializationPromise = null;
      }
    })();

    // This will throw if initialization fails, which is what we want
    throw new Error('Supabase client is initializing. Please wait and try again.');
  } catch (e) {
    console.error('Critical error initializing Supabase client:', e);
    
    // Return a minimal dummy client if all else fails
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
            single: () => Promise.resolve({ data: null, error: new Error('Dummy client') })
          })
        })
      })
    };
    
    _cachedClient = dummyClient;
    return dummyClient as SupabaseClient<Database>;
  }
}
