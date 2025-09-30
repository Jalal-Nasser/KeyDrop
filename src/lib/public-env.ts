// Get public environment variables
export type PublicEnv = {
  NEXT_PUBLIC_SUPABASE_URL?: string | null
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string | null
  NEXT_PUBLIC_PAYPAL_CLIENT_ID?: string | null
  NEXT_PUBLIC_TURNSTILE_SITE_KEY?: string | null
  NEXT_PUBLIC_BASE_URL?: string | null
}

// Get public env variables directly from the window object or process.env
export function getPublicEnv(): PublicEnv {
  // In the browser
  if (typeof window !== 'undefined') {
    const w = window as any;
    if (!w.__PUBLIC_ENV) {
      w.__PUBLIC_ENV = {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        NEXT_PUBLIC_PAYPAL_CLIENT_ID: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
        NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
        NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || window.location.origin
      };
    }
    return w.__PUBLIC_ENV as PublicEnv;
  }
  
  // On the server
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_PAYPAL_CLIENT_ID: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || ''
  };
}
