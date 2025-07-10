CREATE TABLE public.store_notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for the new table
ALTER TABLE public.store_notices ENABLE ROW LEVEL SECURITY;

-- Policy: Store notices are viewable by everyone.
CREATE POLICY "Store notices are viewable by everyone." ON public.store_notices
  FOR SELECT USING (TRUE);

-- Policy: Admins can manage store notices.
CREATE POLICY "Admins can manage store notices." ON public.store_notices
  FOR ALL USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE);

-- Function to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function on update of store_notices
CREATE TRIGGER update_store_notices_updated_at
BEFORE UPDATE ON public.store_notices
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();