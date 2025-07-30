-- Drop all existing policies on profiles to avoid conflicts
DROP POLICY IF EXISTS "Admins can select all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can select own profile" ON public.profiles;

-- Enable RLS on profiles table (if not already enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create a function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin_user() RETURNS boolean AS $$
DECLARE
  admin_flag boolean;
BEGIN
  SELECT is_admin INTO admin_flag FROM public.profiles WHERE id = auth.uid();
  RETURN admin_flag;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy: users can select their own profile
CREATE POLICY "Users can select own profile" ON public.profiles
FOR SELECT USING (id = auth.uid());

-- Policy: admins can select all profiles
CREATE POLICY "Admins can select all profiles" ON public.profiles
FOR SELECT USING (public.is_admin_user());