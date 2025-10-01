"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/context/session-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { ProfileForm } from "@/components/profile-form" // Import the new ProfileForm
import { getCurrentUserProfile } from "@/app/account/actions" // Import getCurrentUserProfile
import { Loader2 } from "lucide-react"
import { z } from "zod"
import { Tables } from "@/types/supabase" // Import Tables

type Profile = Tables<'profiles'>;

// Define the schema for profile validation (same as in profile-form.tsx)
const profileSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required"),
  last_name: z.string().trim().min(1, "Last name is required"),
  company_name: z.string().optional(),
  vat_number: z.string().optional(),
  address_line_1: z.string().trim().min(1, "Address is required"),
  address_line_2: z.string().optional(),
  city: z.string().trim().min(1, "City is required"),
  state_province_region: z.string().trim().min(1, "State/Province/Region is required"),
  postal_code: z.string().trim().min(1, "Postal code is required"),
  country: z.string().trim().length(2, "Country is required"),
});

export default function AccountPage() {
  const { session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const supabase = createClientComponentClient()

  const fetchProfile = async () => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }
    const { data: profileData, error: profileError } = await getCurrentUserProfile();
    if (profileError) {
      console.error("Error fetching user profile:", profileError);
      setUserProfile(null);
    } else {
      setUserProfile(profileData);
    }

    const { data: adminProfile, error: adminError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single();
    
    if (!adminError && adminProfile?.is_admin) {
      setIsAdmin(true);
    } else if (adminError) {
      console.error("Error fetching admin status:", adminError);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (session) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [session]);

  const handleProfileUpdated = () => {
    // Re-fetch profile to update the displayed data and re-evaluate completeness
    fetchProfile();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 py-12 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4">Loading account details...</p>
      </div>
    );
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

  // Check if profile is complete
  const isProfileComplete = userProfile ? profileSchema.safeParse(userProfile).success : false;

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
          
          {!isProfileComplete && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4" role="alert">
              <p className="font-bold">Profile Incomplete!</p>
              <p>Please complete your profile details below to proceed with purchases.</p>
            </div>
          )}

          <ProfileForm initialProfile={userProfile} onProfileUpdated={handleProfileUpdated} />
          
          <div className="grid gap-6">
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