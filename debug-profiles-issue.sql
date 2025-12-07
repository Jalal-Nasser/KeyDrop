-- Debug script to check profiles table configuration
-- Run this in Supabase SQL Editor to diagnose the signup issue

-- 1. Check all RLS policies on profiles table
SELECT
  schemaname,
  tablename,
  policyname,
  cmd as operation,
  qual as using_expression,
  with_check as check_expression
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

-- 2. Check if RLS is enabled on profiles
SELECT tablename, rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'profiles';

-- 3. Check all triggers on profiles table
SELECT
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'profiles'
ORDER BY trigger_name;

-- 4. Check profiles table structure
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 5. Check for any triggers on auth.users that might create profiles
SELECT
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users'
ORDER BY trigger_name;
