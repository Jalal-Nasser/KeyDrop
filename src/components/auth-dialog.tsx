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
import { AuthChangeEvent, Session } from "@supabase/supabase-js" // Import types

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

  // Handle email input validation
  useEffect(() => {
    if (!open) return;

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

  // Handle auth state changes and profile creation
  useEffect(() => {
    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => { // Explicitly type event and session
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            // Create a profile for new users
            const response = await fetch('/api/auth/create-profile', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: session.user.id,
                email: session.user.email
              })
            });

            if (!response.ok) {
              const error = await response.json();
              console.error('Error creating user profile:', error);
            }

            // Close the dialog after successful sign in
            onOpenChange(false);
          } catch (error) {
            console.error('Error in auth state change:', error);
          }
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [open, supabase, onOpenChange]); // Add supabase and onOpenChange to dependencies

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
          {/* Render Auth only once Supabase client is ready to avoid runtime errors */}
          {supabase && (
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
              redirectTo={`${(() => {
                // Prioritize the injected public env variable
                if (typeof window !== 'undefined' && (window as any).__PUBLIC_ENV?.NEXT_PUBLIC_BASE_URL) {
                  return (window as any).__PUBLIC_ENV.NEXT_PUBLIC_BASE_URL;
                }
                // Fallback to window.location.origin if public env is not available
                if (typeof window !== 'undefined' && window.location?.origin) {
                  return window.location.origin;
                }
                return ''; // Final fallback to empty string
              })()}/auth/callback`}
            />
          )}
          {emailError && (
            <div className="text-red-600 text-sm text-center">{emailError}</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}