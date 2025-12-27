"use server"

import { cookies } from "next/headers"
import { z } from "zod"
import { revalidatePath } from 'next/cache'
import {
  getCurrentUserProfile as getServerUserProfile,
  updateProfile as updateServerProfile,
  getAllUserProfilesForAdmin as getServerAllUserProfilesForAdmin,
  createSupabaseServerClientComponent
} from '@/lib/supabase/server'

const profileSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required"),
  last_name: z.string().trim().min(1, "Last name is required"),
  company_name: z.string().optional(),
  address_line_1: z.string().trim().min(1, "Address is required"),
  address_line_2: z.string().optional(),
  city: z.string().trim().min(1, "City is required"),
  state_province_region: z.string().trim().min(1, "State/Province/Region is required"),
  country: z.string().trim().min(1, "Country is required"),
})

export async function updateCurrentUserProfile(profileData: any) {
  try {
    const cookieStore = cookies()
    const { data, error } = await updateServerProfile(profileData, cookieStore)
    
    if (error) {
      console.error('Error updating profile:', error)
      return { error: { message: error } }
    }
    
    revalidatePath('/account')
    revalidatePath('/checkout')
    
    return { data, error: null }
  } catch (error) {
    console.error('Unexpected error in updateCurrentUserProfile:', error)
    return { 
      error: { 
        message: error instanceof Error ? error.message : 'An unexpected error occurred' 
      } 
    }
  }
}

export async function getCurrentUserProfile() {
  try {
    const cookieStore = cookies()
    return await getServerUserProfile(cookieStore)
  } catch (error) {
    console.error('Error in getCurrentUserProfile:', error)
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }
  }
}

export async function getAllUserProfilesForAdmin() {
  try {
    const cookieStore = cookies()
    return await getServerAllUserProfilesForAdmin(cookieStore)
  } catch (error) {
    console.error("Error in getAllUserProfilesForAdmin:", error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : "Failed to fetch users" 
    };
  }
}

export async function createUserProfile(userId: string, email: string) {
  console.log("createUserProfile: Action started.");
  const supabase = await createSupabaseServerClientComponent(); // Await the client
  
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
        last_name: ''
      }
    ])

  if (error) {
    console.error('Error creating user profile:', error)
    return { success: false, error: error.message }
  }
  console.log("createUserProfile: Profile created successfully for user:", userId);
  return { success: true }
}