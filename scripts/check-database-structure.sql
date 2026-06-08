-- Quick check: See what tables and data you have
-- Run this to understand your current database structure

-- 1. Check all tables in public schema
SELECT 
  'Tables in public schema:' as info;
  
SELECT 
  table_name,
  (SELECT COUNT(*) 
   FROM information_schema.columns 
   WHERE table_schema = 'public' 
   AND table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. Check if user_profiles exists and has data
SELECT 
  'User Profiles:' as info;
  
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'user_profiles'
    ) THEN '✅ user_profiles table exists'
    ELSE '❌ user_profiles table MISSING'
  END as status;

-- If it exists, show structure
SELECT 
  'user_profiles columns:' as info,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 3. Check if accounts table exists
SELECT 
  'Accounts Table:' as info;
  
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'accounts'
    ) THEN '✅ accounts table exists'
    ELSE '❌ accounts table MISSING'
  END as status;

-- 4. Check if account_types exists
SELECT 
  'Account Types:' as info;
  
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'account_types'
    ) THEN '✅ account_types table exists'
    ELSE '❌ account_types table MISSING'
  END as status;

-- If it exists, show what types are available
SELECT 
  id,
  name,
  description
FROM account_types
ORDER BY id;

-- 5. Check auth.users (Supabase's built-in user table)
-- Note: You can't directly query this, but it exists
SELECT 
  'Auth Users:' as info,
  'auth.users is Supabase''s built-in table in the auth schema' as note,
  'Users are created automatically when they sign up via Supabase Auth' as explanation;

-- 6. Count records (if tables exist)
-- Note: These queries will fail if tables don't exist - that's expected
-- Just check which tables exist from the queries above first

-- Try to count user_profiles
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'user_profiles'
  ) THEN
    RAISE NOTICE 'user_profiles count: %', (SELECT COUNT(*) FROM user_profiles);
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'accounts'
  ) THEN
    RAISE NOTICE 'accounts count: %', (SELECT COUNT(*) FROM accounts);
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'account_types'
  ) THEN
    RAISE NOTICE 'account_types count: %', (SELECT COUNT(*) FROM account_types);
  END IF;
END $$;

