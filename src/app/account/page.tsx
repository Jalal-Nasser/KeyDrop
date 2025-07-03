"use client"

import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { useSession } from "@/context/session-context"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function AccountPage() {
  const { session, supabase } = useSession()

  if (!session) {
    return (
      <div className="flex justify-center items-center py-12 px-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You must be signed in to view this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please sign in using the button in the header to access your account details.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 py-12">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Your Account</CardTitle>
          <CardDescription>
            Welcome back, {session.user.email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">You are now signed in.</p>
          <Button onClick={() => supabase.auth.signOut()} className="w-full">
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}