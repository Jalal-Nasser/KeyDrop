-- Drop any new policies that might cause recursion or block access
DROP POLICY IF EXISTS "Users can select own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can select all profiles" ON public.profiles;
DROP FUNCTION IF EXISTS public.is_admin_user();

-- Enable RLS if not enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Original policy: Users can select their own profile
CREATE POLICY "Users can select own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

-- Original policy: Admins can manage profiles (select all)
CREATE POLICY "Admins can select all profiles" ON public.profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles p2 WHERE p2.id = auth.uid() AND p2.is_admin = true
  )
);