CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_percent NUMERIC NOT NULL,
  assigned_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_applied BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Policy for admins to view and manage all coupons
CREATE POLICY "Admins can manage all coupons." ON public.coupons
FOR ALL USING ( (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE ) WITH CHECK ( (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE );

-- Policy for users to view their own assigned, unapplied coupons
CREATE POLICY "Users can view their own unapplied coupons." ON public.coupons
FOR SELECT USING ( auth.uid() = assigned_user_id AND is_applied = FALSE );

-- Policy for users to update their own assigned coupon to applied
CREATE POLICY "Users can mark their own assigned coupons as applied." ON public.coupons
FOR UPDATE USING ( auth.uid() = assigned_user_id ) WITH CHECK ( auth.uid() = assigned_user_id );