"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { z } from "zod"
import { revalidatePath } from "next/cache"

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
  country: z.string().trim().min(1, "Country is required"),
})

export async function updateCurrentUserProfile(profileData: unknown) {
  const supabase = createServerActionClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return { error: { message: "User not authenticated." } }
  }

  const validation = profileSchema.safeParse(profileData)
  if (!validation.success) {
    return { error: { message: "Invalid profile data.", issues: validation.error.issues } }
  }

  const { data, error } = await supabase
    .from("profiles")
    .upsert({ ...validation.data, id: session.user.id })
    .select()

  if (error) {
    console.error("Error during profile upsert in server action:", error)
    return { error: { message: error.message } }
  }

  if (!data || data.length === 0) {
    console.error("Profile upsert failed: No data returned after operation.");
    return { error: { message: "Profile operation failed unexpectedly." } };
  }

  // Invalidate the cache for pages that rely on profile data
  revalidatePath('/account')
  revalidatePath('/checkout')

  return { error: null }
}

export async function getCurrentUserProfile() {
  const supabase = createServerActionClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return { data: null, error: "User not authenticated." }
  }

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