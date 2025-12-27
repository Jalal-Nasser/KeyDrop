-- Comprehensive fix for auth signup and profiles
-- Run this in Supabase SQL Editor

-- Step 1: Ensure RLS policies allow profile creation
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can select own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can select all profiles" ON public.profiles;

-- Create policies for users
CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can select own profile" ON public.profiles
FOR SELECT TO authenticated
USING (id = auth.uid());

-- Create policies for admins
CREATE POLICY "Admins can insert any profile" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Admins can update any profile" ON public.profiles
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Admins can select all profiles" ON public.profiles
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Step 2: Create or replace function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at)
  VALUES (NEW.id, NEW.email, NOW())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 4: Create trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 5: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;

-- Verify the setup
SELECT 'Policies created:' as status;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'profiles';

SELECT 'Trigger created:' as status;
SELECT trigger_name FROM information_schema.triggers
WHERE event_object_table = 'users' AND event_object_schema = 'auth';
