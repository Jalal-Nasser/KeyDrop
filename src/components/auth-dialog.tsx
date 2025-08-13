"use client"

import { useEffect, useRef, useState } from "react"
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
import { toast } from "sonner"

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const allowedDomains = [
  "gmail.com",
  "hotmail.com",
  "outlook.com"
];

const adminEmail = "admin@dropskey.com";

function isAllowedEmail(email: string) {
  if (email.toLowerCase() === adminEmail) return true;
  const domain = email.split("@")[1]?.toLowerCase();
  return allowedDomains.includes(domain);
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const { supabase, session } = useSession()
  const [emailError, setEmailError] = useState<string | null>(null)
  const emailInputRef = useRef<HTMLInputElement | null>(null)

  // Close the dialog automatically when a session is established
  useEffect(() => {
    if (session) {
      onOpenChange(false)
    }
  }, [session, onOpenChange])

  // Intercept form submission to validate email domain
  useEffect(() => {
    if (!open) return;

    // Wait for the Auth UI to render the email input
    const interval = setInterval(() => {
      const input = document.querySelector('input[type="email"]') as HTMLInputElement | null;
      if (input) {
        emailInputRef.current = input;
        // Add event listener to the parent form
        const form = input.closest("form");
        if (form) {
          const handler = (e: Event) => {
            const email = input.value.trim();
            if (email && !isAllowedEmail(email)) {
              e.preventDefault();
              setEmailError("Only Gmail, Hotmail, Outlook, or admin@dropskey.com are allowed.");
              toast.error("Only Gmail, Hotmail, Outlook, or admin@dropskey.com are allowed.");
              input.focus();
              return false;
            } else {
              setEmailError(null);
            }
          };
          form.addEventListener("submit", handler, { capture: true });
          // Clean up
          return () => {
            form.removeEventListener("submit", handler, { capture: true });
          };
        }
      }
    }, 300);

    return () => clearInterval(interval);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sign In / Sign Up</DialogTitle>
          <DialogDescription>
            Only Gmail, Hotmail, Outlook, or admin@dropskey.com are allowed for registration.
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
          {emailError && (
            <div className="text-red-600 text-sm text-center">{emailError}</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}