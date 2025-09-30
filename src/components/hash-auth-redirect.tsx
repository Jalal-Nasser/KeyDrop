"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

// Redirects any page that receives OAuth tokens in the URL hash to /auth/callback
export function HashAuthRedirect() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === 'undefined') return
    const hash = window.location.hash
    if (!hash || !hash.includes('access_token')) return

    // Avoid loop on the callback page itself; ensure we keep the hash tokens
    if (pathname !== '/auth/callback') {
      router.replace(`/auth/callback${hash}`)
    }
  }, [router, pathname])

  return null
}
