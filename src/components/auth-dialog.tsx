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
import { toast } from "sonner"

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const { supabase, session } = useSession()
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

  // Close the dialog automatically when a session is established
  useEffect(() => {
    if (session) {
      onOpenChange(false)
    }
  }, [session, onOpenChange])

  // Reset the Turnstile token when the dialog is closed to ensure a fresh challenge
  useEffect(() => {
    if (!open) {
      setTurnstileToken(null)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sign In / Sign Up</DialogTitle>
          <DialogDescription>
            Please complete the security check to access your account.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
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
          <div className="flex justify-center">
            <Turnstile
              sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
              onVerify={(token) => setTurnstileToken(token)}
              onExpire={() => setTurnstileToken(null)}
              onError={() => toast.error("Security check failed. Please refresh and try again.")}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}