"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase-wrapper"

// Helper function to create Supabase client
const createSupabaseServerClient = () => {
  return createServerComponentClient<Database>({ cookies: () => cookies() })
}

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
  
  try {
    // Get the current user's session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session?.user?.id) {
      return { data: null, error: "Authentication required" }
    }

    // Get the current user's profile to check admin status
    const { data: adminProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profileError || !adminProfile || adminProfile.role !== 'admin') {
      return { data: null, error: "Unauthorized: Admin access required." }
    }

    // Get all users using the admin API
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()

    if (usersError) throw usersError
    if (!users) return { data: [], error: null }

    // Define User type from auth
    type AuthUser = {
      id: string;
      email?: string;
      created_at: string;
    };

    // Get additional profile info for these users
    const userIds = (users as AuthUser[]).map(user => user.id)
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, role')
      .in('id', userIds)

    if (profilesError) throw profilesError

    // Define profile type
    type Profile = {
      id: string;
      first_name?: string | null;
      last_name?: string | null;
      role?: string | null;
    };

    // Combine the data
    const userData = (users as AuthUser[]).map(user => {
      const profile = (profiles as Profile[]).find(p => p.id === user.id) || {} as Profile
      return {
        id: user.id,
        email: user.email || '',
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        role: profile.role || 'user',
        created_at: user.created_at
      }
    })

    return { data: userData, error: null }
  } catch (error) {
    console.error("Error in getAllUserProfilesForAdmin:", error)
    return { 
      data: null, 
      error: error instanceof Error ? error.message : "Failed to fetch users" 
    }
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