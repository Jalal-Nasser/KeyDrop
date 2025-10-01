"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import type { Database } from "@/types/supabase-wrapper"

// Removed the local createSupabaseServerClient wrapper function here.
// Each action will now directly create its client.

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
  console.log("updateCurrentUserProfile: Action started.");
  const supabase = createServerActionClient<Database>({ cookies: () => cookies() });
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    console.error("updateCurrentUserProfile: Error getting session:", sessionError);
    return { error: { message: "Error retrieving session." } }
  }

  if (!session) {
    console.warn("updateCurrentUserProfile: No session found. User not authenticated.");
    return { error: { message: "User not authenticated." } }
  }
  console.log("updateCurrentUserProfile: Session found for user:", session.user.id);

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
  console.log("getCurrentUserProfile: Action started.");
  const supabase = createServerActionClient<Database>({ cookies: () => cookies() });
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    console.error("getCurrentUserProfile: Error getting session:", sessionError);
    return { data: null, error: "Error retrieving session." }
  }

  if (!session) {
    console.warn("getCurrentUserProfile: No session found. User not authenticated.");
    return { data: null, error: "User not authenticated." }
  }
  console.log("getCurrentUserProfile: Session found for user:", session.user.id);

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
  console.log("getAllUserProfilesForAdmin: Action started.");
  const supabase = createServerActionClient<Database>({ cookies: () => cookies() });
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session?.user?.id) {
    console.warn("getAllUserProfilesForAdmin: No session found or session error. Authentication required.");
    return { data: null, error: "Authentication required" }
  }
  console.log("getAllUserProfilesForAdmin: Session found for user:", session.user.id);

  try {
    // Get the current user's profile to check admin status
    const { data: adminProfile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single()

    if (profileError || !adminProfile || !adminProfile.is_admin) {
      return { data: null, error: "Unauthorized: Admin access required." }
    }

    // Get all users using the admin API
    // Note: createServerActionClient does not have admin.listUsers directly.
    // We need to use the admin client from src/lib/supabase/admin.ts for this.
    // Let's ensure that the admin client is correctly imported and used here.
    const supabaseAdmin = createServerActionClient<Database>({ cookies: () => cookies() }); // This is still the regular client.
    // For admin.listUsers, we need the service role key.
    // The createClient from '@supabase/supabase-js' with service role key is needed.
    // Let's use the createClient from src/lib/supabase/actions.ts which is already configured for admin.
    const { createClient: createAdminSupabaseClient } = await import('@/lib/supabase/actions');
    const adminSupabase = await createAdminSupabaseClient(); // This is the admin client

    const { data: authUsers, error: usersError } = await adminSupabase.auth.admin.listUsers()

    if (usersError) throw usersError
    if (!authUsers || authUsers.users.length === 0) return { data: [], error: null }

    // Define User type from auth
    type AuthUser = {
      id: string;
      email?: string;
      created_at: string;
    };

    // Get additional profile info for these users
    const userIds = (authUsers.users as AuthUser[]).map(user => user.id)
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, is_admin')
      .in('id', userIds)

    if (profilesError) throw profilesError

    // Define profile type
    type Profile = {
      id: string;
      first_name?: string | null;
      last_name?: string | null;
      is_admin?: boolean | null;
    };

    // Combine the data
    const userData = (authUsers.users as AuthUser[]).map(user => {
      const profile = (profiles as Profile[]).find(p => p.id === user.id) || {} as Profile
      return {
        id: user.id,
        email: user.email || '',
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        is_admin: profile.is_admin || false,
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
  console.log("createUserProfile: Action started.");
  const supabase = createServerActionClient<Database>({ cookies: () => cookies() });
  
  // Check if profile already exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single()

  if (existingProfile) {
    console.log("createUserProfile: Profile already exists for user:", userId);
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
  console.log("createUserProfile: Profile created successfully for user:", userId);
  return { success: true }
}