// Fetch and cache public env at runtime for client side
export type PublicEnv = {
  NEXT_PUBLIC_SUPABASE_URL?: string | null
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string | null
  NEXT_PUBLIC_PAYPAL_CLIENT_ID?: string | null
  NEXT_PUBLIC_TURNSTILE_SITE_KEY?: string | null
  NEXT_PUBLIC_BASE_URL?: string | null
}

let _publicEnvLoaded = false

export async function getPublicEnv(): Promise<PublicEnv> {
  if (typeof window === 'undefined') return {}
  const w = window as any
  if (w.__PUBLIC_ENV) {
    _publicEnvLoaded = true
    return w.__PUBLIC_ENV as PublicEnv
  }
  if (!_publicEnvLoaded) {
    try {
      const res = await fetch('/api/env/public', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        w.__PUBLIC_ENV = data
        _publicEnvLoaded = true
        return data as PublicEnv
      }
    } catch (e) {
      // ignore; fallback to empty
    }
  }
  return (w.__PUBLIC_ENV as PublicEnv) || {}
}
