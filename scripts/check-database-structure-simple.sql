-- Simple check: See what tables and data you have
-- This version handles missing tables gracefully

-- 1. Check all tables in public schema
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

-- 2. Check if key tables exist
SELECT 
  'user_profiles' as table_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'user_profiles'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
UNION ALL
SELECT 
  'accounts',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'accounts'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END
UNION ALL
SELECT 
  'account_types',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'account_types'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END
UNION ALL
SELECT 
  'transactions',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'transactions'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END
UNION ALL
SELECT 
  'notifications',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'notifications'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END;

-- 3. Show user_profiles structure (if it exists)
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 4. Show account_types data (if it exists)
SELECT 
  id,
  name,
  description
FROM account_types
ORDER BY id;

-- 5. Count records in each table (only if tables exist)
-- Note: These will error if tables don't exist, that's okay
SELECT 
  'user_profiles' as table_name,
  COUNT(*) as record_count
FROM user_profiles
UNION ALL
SELECT 
  'accounts',
  COUNT(*)
FROM accounts
UNION ALL
SELECT 
  'account_types',
  COUNT(*)
FROM account_types
UNION ALL
SELECT 
  'transactions',
  COUNT(*)
FROM transactions
UNION ALL
SELECT 
  'notifications',
  COUNT(*)
FROM notifications;

