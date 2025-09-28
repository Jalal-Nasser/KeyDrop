"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/supabaseServer"

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
  const supabase = createSupabaseServerClient()
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
  const supabase = createSupabaseServerClient()
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
  const supabase = createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return { data: null, error: "User not authenticated." }
  }

  try {
    // Verify admin status
    const { data: adminProfile, error: adminError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single()

    if (adminError || !adminProfile?.is_admin) {
      return { data: null, error: "Unauthorized: Admin access required." }
    }

    // Get all users with their email from auth.users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, created_at')
      .order('created_at', { ascending: false });

    if (usersError) throw usersError;

    // Get profile info for these users
    const userIds = users.map(user => user.id);
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, is_admin')
      .in('id', userIds);

    if (profilesError) throw profilesError;

    // Define profile type
    type UserProfile = {
      id: string;
      first_name?: string | null;
      last_name?: string | null;
      is_admin?: boolean | null;
    };

    // Combine the data
    const userData = users.map(user => {
      const profile = (profiles as UserProfile[]).find(p => p.id === user.id) || {} as UserProfile;
      return {
        id: user.id,
        email: user.email || '',
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        is_admin: profile.is_admin || false,
        created_at: user.created_at
      };
    });

    return { data: userData, error: null };
  } catch (error) {
    console.error("Error in getAllUserProfilesForAdmin:", error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : "Failed to fetch users" 
    };
  }
}

export async function createUserProfile(userId: string, email: string) {
  const supabase = createSupabaseServerClient()
  
  // Check if profile already exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single()

  if (existingProfile) {
    return { success: true, message: 'Profile already exists' }
  }

  // Create new profile
  const { error } = await supabase
    .from('profiles')
    .insert([
      { 
        id: userId,
        email: email,
        first_name: '',
        last_name: '',
        created_at: new Date().toISOString()
      }
    ])

  if (error) {
    console.error('Error creating user profile:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}