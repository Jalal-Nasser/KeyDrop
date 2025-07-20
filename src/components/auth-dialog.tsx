"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { useSession } from "@/context/session-context"
import Turnstile from "react-turnstile"

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const { supabase, session } = useSession()
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

  // Close the dialog automatically when a session is established (user signs in)
  useEffect(() => {
    if (session) {
      onOpenChange(false)
    }
  }, [session, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sign In / Sign Up</DialogTitle>
          <DialogDescription>
            Enter your email and password to access your account.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Auth
            key={open ? "auth-dialog-open" : "auth-dialog-closed"}
            supabaseClient={supabase}
            providers={['google', 'github']}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: "#1e73be",
                    brandAccent: "#28a745",
                  },
                },
              },
            }}
            theme="light"
            showLinks={true}
            redirectTo={`${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`}
          />
          {/* Cloudflare Turnstile Integration */}
          <div className="mt-4">
            <Turnstile
              sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}
              onVerify={(token) => {
                setTurnstileToken(token)
                console.log("Turnstile token:", token)
                // In a custom auth flow, you would send this token to your backend for verification
              }}
              onExpire={() => setTurnstileToken(null)}
              onLoad={() => console.log("Turnstile loaded")}
            />
            {!turnstileToken && (
              <p className="text-red-500 text-sm mt-2">Please complete the CAPTCHA.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}