-- Create savings accounts for existing users who don't have any accounts
-- Run this if you want to backfill accounts for users who signed up before the auto-account feature

INSERT INTO accounts (user_id, account_type_id, account_number, balance, is_active)
SELECT 
  up.id,
  (SELECT id FROM account_types WHERE name = 'Savings' LIMIT 1),
  'SAV-' || 
    TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
    TO_CHAR(NOW(), 'HH24MISS') || '-' ||
    LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0'),
  0.00,
  TRUE
FROM user_profiles up
WHERE NOT EXISTS (
  SELECT 1 FROM accounts WHERE accounts.user_id = up.id
)
ON CONFLICT (account_number) DO NOTHING;

-- Verify the accounts were created
SELECT 
  up.id,
  up.username,
  up.first_name,
  up.last_name,
  a.account_number,
  a.balance,
  at.name as account_type
FROM user_profiles up
LEFT JOIN accounts a ON a.user_id = up.id
LEFT JOIN account_types at ON at.id = a.account_type_id
ORDER BY up.created_at DESC
LIMIT 10;

