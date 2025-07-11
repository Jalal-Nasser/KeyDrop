CREATE POLICY "Admins can insert order items"
ON public.order_items
FOR INSERT
WITH CHECK (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);