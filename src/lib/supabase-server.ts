import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase-fixed';

type Profile = Database['public']['Tables']['profiles']['Row'];

export const createSupabaseServerClient = (cookieStore?: ReturnType<typeof cookies>) => {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return (cookieStore || cookies()).getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            (cookieStore || cookies()).set(name, value, options);
          });
        },
      },
    }
  );
};

export const getSession = async (cookieStore?: ReturnType<typeof cookies>) => {
  const supabase = createSupabaseServerClient(cookieStore);
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
  
  return session;
};

export const getCurrentUser = async (cookieStore?: ReturnType<typeof cookies>) => {
  const supabase = createSupabaseServerClient(cookieStore);
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
    
    const supabase = createSupabaseServerClient(cookieStore);
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
    
    const supabase = createSupabaseServerClient(cookieStore);
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
    const { data: profile } = await createSupabaseServerClient(cookieStore)
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return { data: null, error: 'Unauthorized: Admin access required' };
    }
    
    // Get all profiles
    const { data: profiles, error } = await createSupabaseServerClient(cookieStore)
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