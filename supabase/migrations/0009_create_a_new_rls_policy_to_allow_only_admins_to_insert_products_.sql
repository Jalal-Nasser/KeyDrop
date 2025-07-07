CREATE POLICY "Admins can insert products."
ON public.products
FOR INSERT
WITH CHECK ( (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true );