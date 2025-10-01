"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/context/session-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function AccountPage() {
  const { session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    console.log("AccountPage: useEffect triggered. Session:", session);
    const checkAdmin = async () => {
      if (!session?.user?.id) {
        console.log("AccountPage: No session user ID, cannot check admin status.");
        setLoading(false);
        return;
      }
      
      console.log("AccountPage: Checking admin status for user ID:", session.user.id);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single()
      
      if (!error && profile?.is_admin) {
        console.log("AccountPage: User is admin.");
        setIsAdmin(true)
      } else if (error) {
        console.error("AccountPage: Error fetching admin status:", error)
      } else {
        console.log("AccountPage: User is not admin.");
      }
      setLoading(false)
    }
    
    if (session) {
      checkAdmin()
    } else {
      console.log("AccountPage: No active session.");
      setLoading(false)
    }
  }, [session, supabase])

  console.log("AccountPage: Render. Loading:", loading, "Session:", session ? "present" : "null", "IsAdmin:", isAdmin);

  if (loading) {
    return <div className="container mx-auto p-4 py-12">Loading...</div>
  }

  if (!session) {
    return (
      <div className="flex justify-center items-center py-12 px-4">
        <Card className="w-full max-w-md mx-auto">
          <CardTitle className="p-6 pb-2">Access Denied</CardTitle>
          <CardDescription className="px-6 pb-6">
            You must be signed in to view this page.
          </CardDescription>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Please sign in using the button in the header to access your account details.
            </p>
            <Button asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 py-12">
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Your Account</h2>
            <p className="text-sm text-muted-foreground">
              Welcome back, {session.user.email}
            </p>
          </div>
          
          <div className="grid gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Account Details</h3>
              <div className="grid gap-2">
                <p className="text-sm">
                  <span className="font-medium">Email:</span> {session.user.email}
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Quick Links</h3>
              <div className="grid gap-2">
                <Button asChild variant="outline" className="w-full sm:w-auto justify-start">
                  <Link href="/account/orders">View Order History</Link>
                </Button>
                {isAdmin && (
                  <Button asChild variant="outline" className="w-full sm:w-auto justify-start">
                    <Link href="/admin">Admin Panel</Link>
                  </Button>
                )}
                <Button
                  variant="destructive"
                  className="w-full sm:w-auto justify-start"
                  onClick={async () => {
                    if (!supabase) return;
                    setLoading(true);
                    try {
                      await supabase.auth.signOut();
                      router.push('/');
                      router.refresh();
                    } catch (error) {
                      console.error('Error signing out:', error);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}