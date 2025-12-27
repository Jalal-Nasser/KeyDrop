-- Check for triggers on auth.users that might be causing the 500 error
SELECT
  trigger_schema,
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users'
ORDER BY trigger_name;

-- Check what happens when we try to insert a profile manually
-- This will show us if there's a permission or constraint issue
DO $$
DECLARE
  test_uuid UUID := gen_random_uuid();
BEGIN
  -- Try to insert a test profile
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (test_uuid, 'test@example.com', '', '');

  -- Clean up
  DELETE FROM public.profiles WHERE id = test_uuid;

  RAISE NOTICE 'Profile insert test: SUCCESS';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Profile insert test: FAILED - %', SQLERRM;
END $$;

-- Check if there's a constraint on profiles that might fail
SELECT
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.profiles'::regclass
ORDER BY conname;
