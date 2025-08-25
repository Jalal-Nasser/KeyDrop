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
        // Let Supabase client pick it up from the hash; then navigate away
        // Give a brief tick for auth helpers to process the hash
        setTimeout(() => {
          router.replace('/account')
        }, 50)
        return
      }
    }
    router.replace('/account')
  }, [router])

  return null
}
