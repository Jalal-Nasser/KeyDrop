-- Quick fix for profiles table RLS policies
-- Run this in Supabase Dashboard -> SQL Editor

-- Add INSERT policy to allow users to create their own profile during signup
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT WITH CHECK (id = auth.uid());

-- Add UPDATE policy to allow users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (id = auth.uid());

-- Add INSERT policy for admins
DROP POLICY IF EXISTS "Admins can insert any profile" ON public.profiles;
CREATE POLICY "Admins can insert any profile" ON public.profiles
FOR INSERT WITH CHECK (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);

-- Add UPDATE policy for admins
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile" ON public.profiles
FOR UPDATE USING (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);

-- Verify policies were created
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'profiles';
