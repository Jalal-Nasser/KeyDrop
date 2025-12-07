-- Add INSERT policy to allow users to create their own profile during signup
-- This is needed for Supabase Auth to create profiles automatically

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Policy: users can insert their own profile (during signup)
CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT WITH CHECK (id = auth.uid());

-- Policy: users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (id = auth.uid());

-- Policy: Admins can insert any profile
DROP POLICY IF EXISTS "Admins can insert any profile" ON public.profiles;
CREATE POLICY "Admins can insert any profile" ON public.profiles
FOR INSERT WITH CHECK (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);

-- Policy: Admins can update any profile
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile" ON public.profiles
FOR UPDATE USING (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);
