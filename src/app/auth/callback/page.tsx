"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    console.log("AuthCallbackPage: useEffect triggered.");
    // Normalize hash-based tokens to a clean route
    if (typeof window !== 'undefined') {
      const hash = window.location.hash
      console.log("AuthCallbackPage: Current hash:", hash);
      if (hash && hash.includes('access_token')) {
        const params = new URLSearchParams(hash.replace(/^#/, ''))
        const access_token = params.get('access_token')
        const refresh_token = params.get('refresh_token')
        
        console.log("AuthCallbackPage: Tokens found in hash. Access token present:", !!access_token, "Refresh token present:", !!refresh_token);

        if (access_token && refresh_token) {
          // Ask the server to set a secure session cookie for SSR/API use
          fetch('/api/auth/set-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ access_token, refresh_token }),
            credentials: 'include',
          })
          .then(response => {
            console.log("AuthCallbackPage: /api/auth/set-session response status:", response.status);
            if (!response.ok) {
              return response.json().then(err => Promise.reject(err));
            }
            return response.json();
          })
          .then(data => {
            console.log("AuthCallbackPage: /api/auth/set-session successful:", data);
            router.replace('/account');
          })
          .catch(error => {
            console.error("AuthCallbackPage: Error calling /api/auth/set-session:", error);
            router.replace('/account'); // Still redirect, but log the error
          });
          return
        }
      }
    }
    console.log("AuthCallbackPage: No tokens found or already processed, redirecting to /account.");
    router.replace('/account')
  }, [router])

  return null
}