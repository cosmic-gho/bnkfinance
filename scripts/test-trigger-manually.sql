-- Manual test to verify the trigger works
-- This simulates what happens when a user signs up
-- WARNING: Only run this for testing, not on production with real users

-- First, let's check the current state
SELECT 'Current account_types:' as info;
SELECT * FROM account_types;

SELECT 'Recent user_profiles:' as info;
SELECT id, username, first_name, last_name, created_at 
FROM user_profiles 
ORDER BY created_at DESC 
LIMIT 5;

SELECT 'Recent accounts:' as info;
SELECT a.id, a.user_id, a.account_number, a.balance, at.name as account_type
FROM accounts a
JOIN account_types at ON at.id = a.account_type_id
ORDER BY a.created_at DESC
LIMIT 5;

-- Check if there are users without accounts
SELECT 'Users without accounts:' as info;
SELECT 
  up.id,
  up.username,
  up.first_name,
  up.last_name,
  up.created_at
FROM user_profiles up
WHERE NOT EXISTS (
  SELECT 1 FROM accounts WHERE accounts.user_id = up.id
)
ORDER BY up.created_at DESC;

-- If you want to manually create accounts for users who don't have any:
-- (Uncomment and run only if needed)
/*
INSERT INTO accounts (user_id, account_type_id, account_number, balance, is_active)
SELECT 
  up.id,
  (SELECT id FROM account_types WHERE name = 'Savings' LIMIT 1),
  'SAV-' || 
    TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
    TO_CHAR(EXTRACT(EPOCH FROM NOW())::BIGINT % 1000000, 'FM000000') || '-' ||
    LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0'),
  0.00,
  TRUE
FROM user_profiles up
WHERE NOT EXISTS (
  SELECT 1 FROM accounts WHERE accounts.user_id = up.id
)
ON CONFLICT (account_number) DO NOTHING;
*/

