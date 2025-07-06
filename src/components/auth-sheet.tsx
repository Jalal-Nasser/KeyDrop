"use client"

import { useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
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
        </SheetHeader>
        <div className="py-4">
          <Auth
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
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}