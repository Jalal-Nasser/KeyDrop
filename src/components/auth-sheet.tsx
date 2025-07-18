"use client"

import { useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription, // Import SheetDescription
} from "@/components/ui/sheet"
import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { useSession } from "@/context/session-context"

interface AuthSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthSheet({ open, onOpenChange }: AuthSheetProps) {
  const { supabase, session } = useSession()

  // Close the sheet automatically when a session is established (user signs in)
  useEffect(() => {
    if (session) {
      onOpenChange(false)
    }
  }, [session, onOpenChange])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Sign In / Sign Up</SheetTitle>
          <SheetDescription>
            Enter your email and password to access your account.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <Auth
            key={open ? "auth-sheet-open" : "auth-sheet-closed"}
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
            showLinks={false}
            redirectTo={`${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}