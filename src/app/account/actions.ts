"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function getCurrentUserProfile() {
  const supabase = createServerActionClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return { data: null, error: "User not authenticated." }
  }

  // Replaced .single() with .limit(1) to avoid 406 errors on certain server configurations.
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .limit(1)

  if (error) {
    console.error("Error fetching user profile in server action:", error)
    return { data: null, error: error.message }
  }

  return { data: profiles?.[0] || null, error: null }
}

export async function getAllUserProfilesForAdmin() {
  const supabase = createServerActionClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return { data: null, error: "User not authenticated." }
  }

  // First, check if the current user is an admin
  const { data: adminProfiles, error: adminError } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', session.user.id)
    .limit(1)

  if (adminError) {
    return { data: null, error: "Could not verify admin status." }
  }
  
  const adminProfile = adminProfiles?.[0]

  if (!adminProfile || !adminProfile.is_admin) {
    return { data: null, error: "Unauthorized: User is not an admin." }
  }

  // If they are an admin, fetch all users
  const { data, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name")
    .order("first_name", { ascending: true });

  if (error) {
    console.error("Error fetching all users for admin:", error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}