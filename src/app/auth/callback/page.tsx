"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    // Normalize hash-based tokens to a clean route
    if (typeof window !== 'undefined') {
      const hash = window.location.hash
      if (hash && hash.includes('access_token')) {
        const params = new URLSearchParams(hash.replace(/^#/, ''))
        const access_token = params.get('access_token')
        const refresh_token = params.get('refresh_token')
        if (access_token && refresh_token) {
          // Ask the server to set a secure session cookie for SSR/API use
          fetch('/api/auth/set-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ access_token, refresh_token }),
            credentials: 'include',
          }).finally(() => {
            router.replace('/account')
          })
          return
        }
      }
    }
    router.replace('/account')
  }, [router])

  return null
}
