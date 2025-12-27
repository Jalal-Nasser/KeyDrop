-- Create user_discounts table
CREATE TABLE IF NOT EXISTS public.user_discounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_discount UNIQUE (user_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_discounts ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Enable read access for admins"
  ON public.user_discounts
  FOR SELECT
  TO authenticated
  USING (auth.role() = 'authenticated' AND auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'is_admin' = 'true'
  ));

CREATE POLICY "Enable insert for admins"
  ON public.user_discounts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'is_admin' = 'true'
  ));

CREATE POLICY "Enable update for admins"
  ON public.user_discounts
  FOR UPDATE
  TO authenticated
  USING (auth.role() = 'authenticated' AND auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'is_admin' = 'true'
  ));

CREATE POLICY "Enable delete for admins"
  ON public.user_discounts
  FOR DELETE
  TO authenticated
  USING (auth.role() = 'authenticated' AND auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'is_admin' = 'true'
  ));

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the updated_at column
CREATE TRIGGER update_user_discounts_modtime
BEFORE UPDATE ON public.user_discounts
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Create an index for faster lookups
CREATE INDEX idx_user_discounts_user_id ON public.user_discounts(user_id);
CREATE INDEX idx_user_discounts_is_active ON public.user_discounts(is_active);
CREATE INDEX idx_user_discounts_expires_at ON public.user_discounts(expires_at);
