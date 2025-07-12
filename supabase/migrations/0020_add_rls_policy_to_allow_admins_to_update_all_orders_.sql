CREATE POLICY "Admins can update all orders."
ON public.orders
FOR UPDATE
USING (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);