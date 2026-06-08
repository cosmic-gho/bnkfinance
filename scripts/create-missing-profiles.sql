-- Create user_profiles for users who don't have one
-- This fixes users who signed up before the trigger was set up

-- Step 1: Find users in auth.users who don't have a profile
-- Note: We can't directly query auth.users, but we can check which profiles are missing
-- by looking at what we have vs what accounts reference

-- Step 2: Create profiles for users who have accounts but no profile
-- (This handles the case where accounts were created but profile wasn't)
INSERT INTO user_profiles (id, username, first_name, last_name, is_admin)
SELECT DISTINCT
  a.user_id,
  'user_' || SUBSTRING(a.user_id::TEXT, 1, 8) as username,
  NULL as first_name,
  NULL as last_name,
  FALSE as is_admin
FROM accounts a
WHERE NOT EXISTS (
  SELECT 1 FROM user_profiles up WHERE up.id = a.user_id
)
ON CONFLICT (id) DO NOTHING;

-- Step 3: For users who signed up but have no profile and no accounts,
-- we need to manually create profiles. 
-- Since we can't query auth.users directly, you'll need to:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Note the user IDs that don't have profiles
-- 3. Run this for each user:

-- Example (replace USER_ID_HERE with actual user ID):
-- INSERT INTO user_profiles (id, username, first_name, last_name, is_admin)
-- VALUES (
--   'USER_ID_HERE'::UUID,
--   'username_here',
--   'First Name',
--   'Last Name',
--   FALSE
-- )
-- ON CONFLICT (id) DO NOTHING;

-- Step 4: Verify the fix
SELECT 
  'Profiles created' as status,
  COUNT(*) as total_profiles
FROM user_profiles;

-- Step 5: Check if there are still users without profiles
-- (This will show accounts that reference users without profiles)
SELECT 
  'Users with accounts but no profile:' as info,
  a.user_id,
  COUNT(a.id) as account_count
FROM accounts a
WHERE NOT EXISTS (
  SELECT 1 FROM user_profiles up WHERE up.id = a.user_id
)
GROUP BY a.user_id;

-- If the above query returns rows, those users need manual profile creation
-- Use the INSERT statement in Step 3 for each user_id

