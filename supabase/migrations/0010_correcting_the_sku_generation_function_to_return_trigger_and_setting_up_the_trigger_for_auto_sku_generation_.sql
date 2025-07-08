-- Add columns if they don't exist (this will error if they already exist, which is fine)
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS sku TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS tag TEXT,
ADD COLUMN IF NOT EXISTS category TEXT;

-- Function to generate a unique SKU and assign it to the new row
CREATE OR REPLACE FUNCTION public.generate_unique_sku()
RETURNS TRIGGER -- Corrected return type
LANGUAGE plpgsql
SECURITY DEFINER -- Good practice for trigger functions
SET search_path = '' -- Good practice for security definer functions
AS $$
DECLARE
  new_sku TEXT;
BEGIN
  LOOP
    -- Generate a SKU, e.g., 'PROD-' followed by a short UUID part
    new_sku := 'PROD-' || SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 10);
    -- Check if it already exists
    IF NOT EXISTS (SELECT 1 FROM public.products WHERE sku = new_sku) THEN
      NEW.sku := new_sku; -- Assign the generated SKU to the new row
      RETURN NEW; -- Return the modified new row
    END IF;
  END LOOP;
END;
$$;

-- Trigger to set SKU before insert
CREATE OR REPLACE TRIGGER set_product_sku
BEFORE INSERT ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.generate_unique_sku();