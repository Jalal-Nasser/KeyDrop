-- Add is_admin column to profiles table
ALTER TABLE public.profiles
ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- Create a policy to allow admins to insert new products
CREATE POLICY "Admins can insert products."
ON public.products
FOR INSERT
WITH CHECK (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE
);

-- Create a policy to allow admins to update existing products
CREATE POLICY "Admins can update products."
ON public.products
FOR UPDATE
USING (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE
);

-- Create a policy to allow admins to delete products
CREATE POLICY "Admins can delete products."
ON public.products
FOR DELETE
USING (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE
);