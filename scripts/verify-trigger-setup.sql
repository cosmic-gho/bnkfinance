-- Verify that the trigger is set up correctly to auto-create profiles
-- Run this to check if everything is configured properly

-- Step 1: Check if the function exists
SELECT 
  'Function Status' as check_type,
  routine_name,
  routine_type,
  CASE 
    WHEN routine_name = 'handle_new_user' THEN '✅ Function exists'
    ELSE '❌ Function missing'
  END as status
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'handle_new_user';

-- Step 2: Check if the trigger exists
SELECT 
  'Trigger Status' as check_type,
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation,
  CASE 
    WHEN trigger_name = 'on_auth_user_created' THEN '✅ Trigger exists'
    ELSE '❌ Trigger missing'
  END as status
FROM information_schema.triggers
WHERE trigger_schema = 'auth'
AND trigger_name = 'on_auth_user_created';

-- Step 3: Check recent user_profiles to see if trigger is working
SELECT 
  'Recent Profiles' as info,
  id,
  username,
  first_name,
  last_name,
  created_at
FROM user_profiles
ORDER BY created_at DESC
LIMIT 5;

-- Step 4: Check if trigger function has the account creation code
SELECT 
  'Function Definition' as info,
  pg_get_functiondef(oid) as function_code
FROM pg_proc
WHERE proname = 'handle_new_user'
LIMIT 1;

-- Step 5: Test the trigger setup
-- This will show if the trigger is properly configured
SELECT 
  'Setup Summary' as info,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_name = 'handle_new_user'
    ) AND EXISTS (
      SELECT 1 FROM information_schema.triggers 
      WHERE trigger_name = 'on_auth_user_created'
    ) THEN '✅ Trigger is properly set up'
    ELSE '❌ Trigger setup incomplete - run fix-auto-account-creation.sql'
  END as status;

