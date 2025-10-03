'use server';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js'; // Keep for admin client
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase-fixed';

// Cache for the admin client (server-side only)
let adminClient: ReturnType<typeof createClient<Database>> | null = null;

/**
 * Get or create a server-side Supabase client for the current request.
 * This is safe to use in Server Components, Server Actions, and Route Handlers.
 * It uses `createServerComponentClient` from `@supabase/auth-helpers-nextjs`.
 */
export async function createSupabaseServerClientComponent() {
  // Always create a new client for each request to ensure fresh cookies
  // This is the recommended pattern for `createServerComponentClient`
  return createServerComponentClient<Database>({ 
    cookies: () => cookies() 
  });
}

/**
 * Get or create an admin Supabase client with service role key.
 * Only use this in Server Components, Server Actions, and Route Handlers
 * that require elevated permissions.
 */
export async function createAdminClient() {
  if (adminClient) {
    return adminClient;
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }

  adminClient = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
  
  return adminClient;
}

// Helper functions that use the consistent server client
// These were previously in src/lib/supabase-server.ts but are now consolidated here.

type Profile = Database['public']['Tables']['profiles']['Row'];

export const getSession = async (cookieStore?: ReturnType<typeof cookies>) => {
  const supabase = await createSupabaseServerClientComponent(); // Use the consistent client
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
  
  return session;
};

export const getCurrentUser = async (cookieStore?: ReturnType<typeof cookies>) => {
  const supabase = await createSupabaseServerClientComponent(); // Use the consistent client
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  
  return user;
};

export const getCurrentUserProfile = async (cookieStore?: ReturnType<typeof cookies>) => {
  try {
    const user = await getCurrentUser(cookieStore);
    if (!user) return { data: null, error: 'User not authenticated' };
    
    const supabase = await createSupabaseServerClientComponent(); // Use the consistent client
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: user.id,
              email: user.email,
              created_at: new Date().toISOString()
            }
          ])
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          return { data: null, error: 'Failed to create profile' };
        }
        
        return { data: newProfile, error: null };
      }
      
      console.error('Error fetching profile:', error);
      return { data: null, error: error.message };
    }
    
    return { data: profile, error: null };
  } catch (error) {
    console.error('Error in getCurrentUserProfile:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
};

export const updateProfile = async (profileData: Partial<Profile>, cookieStore?: ReturnType<typeof cookies>) => {
  try {
    const user = await getCurrentUser(cookieStore);
    if (!user) return { data: null, error: 'User not authenticated' };
    
    const supabase = await createSupabaseServerClientComponent(); // Use the consistent client
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return { data: null, error: error.message };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error in updateProfile:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
};

export const getAllUserProfilesForAdmin = async (cookieStore?: ReturnType<typeof cookies>) => {
  try {
    const user = await getCurrentUser(cookieStore);
    if (!user) return { data: null, error: 'User not authenticated' };
    
    // Check if user is admin
    const supabase = await createSupabaseServerClientComponent(); // Use the consistent client
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return { data: null, error: 'Unauthorized: Admin access required' };
    }
    
    // Get all profiles
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*');

    if (error) {
      console.error('Error fetching profiles:', error);
      return { data: null, error: error.message };
    }
    
    return { data: profiles, error: null };
  } catch (error) {
    console.error('Error in getAllUserProfilesForAdmin:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
};