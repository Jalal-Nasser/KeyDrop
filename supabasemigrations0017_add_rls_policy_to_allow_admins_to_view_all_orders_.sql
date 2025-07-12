CREATE POLICY "Admins can view all orders." ON public.orders
FOR SELECT USING (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);