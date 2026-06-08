-- Add RLS policy to allow admins to insert/create transactions for any account
-- This fixes the issue where admins cannot create transactions (deposits, etc.) for users

-- First, drop the policy if it exists to avoid errors
DROP POLICY IF EXISTS "Admins can insert transactions" ON transactions;

-- Create the policy
CREATE POLICY "Admins can insert transactions"
  ON transactions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Verify the policy was created
SELECT * FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Admins can insert transactions';
