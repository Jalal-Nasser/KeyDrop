-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can select their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can select all profiles" ON public.profiles;

-- Create policy allowing users to select their own profile
CREATE POLICY "Users can select their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

-- Create policy allowing admins to select all profiles
CREATE POLICY "Admins can select all profiles" ON public.profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles AS p2
    WHERE p2.id = auth.uid() AND p2.is_admin = true
  )
);