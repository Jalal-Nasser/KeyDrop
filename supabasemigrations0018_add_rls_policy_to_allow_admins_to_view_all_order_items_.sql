CREATE POLICY "Admins can view all order items." ON public.order_items
FOR SELECT USING (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);