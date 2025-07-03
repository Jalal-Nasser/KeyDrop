"use client"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { useSession } from "@/context/session-context"

interface AuthSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuthSheet({ open, onOpenChange }: AuthSheetProps) {
  const { supabase } = useSession()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-md">
        <SheetHeader>
          <SheetTitle className="text-2xl">Login or Sign Up</SheetTitle>
          <SheetDescription>
            Access your account or create a new one to continue.
          </SheetDescription>
        </SheetHeader>
        <div className="py-8">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: "#1e73be",
                    brandAccent: "#1a62a3",
                  },
                },
              },
            }}
            providers={["google", "github"]}
            socialLayout="horizontal"
            theme="light"
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}