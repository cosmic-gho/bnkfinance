-- Create a user profile for a specific user
-- Replace USER_ID_HERE with the actual user ID from the error message
-- Example: c8338ad4-2c19-4818-b685-40c9ec4669af

-- Step 1: Create the profile
INSERT INTO user_profiles (id, username, first_name, last_name, is_admin)
VALUES (
  'c8338ad4-2c19-4818-b685-40c9ec4669af'::UUID,  -- Replace with your user ID
  'user_' || SUBSTRING('c8338ad4-2c19-4818-b685-40c9ec4669af', 1, 8),  -- Auto-generate username
  NULL,  -- You can set these if you have the info
  NULL,
  FALSE
)
ON CONFLICT (id) DO UPDATE
SET 
  username = COALESCE(EXCLUDED.username, user_profiles.username),
  first_name = COALESCE(EXCLUDED.first_name, user_profiles.first_name),
  last_name = COALESCE(EXCLUDED.last_name, user_profiles.last_name);

-- Step 2: Verify it was created
SELECT * FROM user_profiles WHERE id = 'c8338ad4-2c19-4818-b685-40c9ec4669af'::UUID;

-- Step 3: If the user also doesn't have an account, create one
INSERT INTO accounts (user_id, account_type_id, account_number, balance, is_active)
SELECT 
  'c8338ad4-2c19-4818-b685-40c9ec4669af'::UUID,
  (SELECT id FROM account_types WHERE name = 'Savings' LIMIT 1),
  'SAV-' || 
    TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
    LPAD((EXTRACT(EPOCH FROM NOW())::BIGINT % 1000000)::TEXT, 6, '0') || '-' ||
    LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0'),
  0.00,
  TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM accounts WHERE user_id = 'c8338ad4-2c19-4818-b685-40c9ec4669af'::UUID
)
ON CONFLICT (account_number) DO NOTHING;

-- Step 4: Verify account was created
SELECT 
  a.*,
  at.name as account_type
FROM accounts a
JOIN account_types at ON at.id = a.account_type_id
WHERE a.user_id = 'c8338ad4-2c19-4818-b685-40c9ec4669af'::UUID;

-- Step 5: Final verification - Check if everything is set up correctly
SELECT 
  'Profile Status' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM user_profiles WHERE id = 'c8338ad4-2c19-4818-b685-40c9ec4669af'::UUID) 
    THEN '✅ Profile exists'
    ELSE '❌ Profile missing'
  END as status;

SELECT 
  'Account Status' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM accounts WHERE user_id = 'c8338ad4-2c19-4818-b685-40c9ec4669af'::UUID) 
    THEN '✅ Account exists'
    ELSE '❌ Account missing'
  END as status,
  COUNT(*) as account_count
FROM accounts 
WHERE user_id = 'c8338ad4-2c19-4818-b685-40c9ec4669af'::UUID;

-- Step 6: Summary - Show complete user setup
SELECT 
  up.id,
  up.username,
  up.first_name,
  up.last_name,
  up.is_admin,
  COUNT(a.id) as account_count,
  COALESCE(SUM(a.balance), 0) as total_balance
FROM user_profiles up
LEFT JOIN accounts a ON a.user_id = up.id
WHERE up.id = 'c8338ad4-2c19-4818-b685-40c9ec4669af'::UUID
GROUP BY up.id, up.username, up.first_name, up.last_name, up.is_admin;

-- ============================================
-- USAGE INSTRUCTIONS:
-- ============================================
-- 1. Replace 'c8338ad4-2c19-4818-b685-40c9ec4669af' with the actual user ID
--    You can find user IDs in Supabase Dashboard → Authentication → Users
--
-- 2. If you want to set a specific username, first_name, or last_name,
--    modify the VALUES section in Step 1
--
-- 3. Run this script in the Supabase SQL Editor or your database client
--
-- 4. The script will:
--    - Create or update the user profile
--    - Create a savings account if one doesn't exist
--    - Verify everything was created successfully
--
-- 5. If you get errors:
--    - Make sure the user exists in auth.users first
--    - Check that account_types table has a 'Savings' type
--    - Verify the user_id is a valid UUID format

