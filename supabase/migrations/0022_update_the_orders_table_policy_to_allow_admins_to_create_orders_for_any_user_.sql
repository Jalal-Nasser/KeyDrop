ALTER POLICY "Users can create their own orders." ON public.orders
WITH CHECK (
  (auth.uid() = user_id) OR
  ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true)
);