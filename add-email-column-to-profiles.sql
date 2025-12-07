-- Add email column to profiles table
-- This fixes the "column email of relation profiles does not exist" error

-- Add the email column
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email TEXT;

-- Optionally, backfill email from auth.users for existing profiles
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id
  AND p.email IS NULL;

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND column_name = 'email';
