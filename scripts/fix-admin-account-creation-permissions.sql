-- Fix RLS policies for admin account creation
-- This allows admins to read account_types and create accounts for any user

-- Step 1: Check if account_types has RLS enabled
-- If not, we'll enable it and add policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'account_types' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE account_types ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS enabled on account_types';
  ELSE
    RAISE NOTICE 'RLS already enabled on account_types';
  END IF;
END $$;

-- Step 2: Create policies for account_types
-- Allow all authenticated users to read account types (needed for account creation)
DROP POLICY IF EXISTS "Anyone can view account types" ON account_types;
CREATE POLICY "Anyone can view account types"
  ON account_types FOR SELECT
  TO authenticated
  USING (true);

-- Step 3: Add admin policy for accounts INSERT (allows admins to create accounts for any user)
DROP POLICY IF EXISTS "Admins can insert accounts" ON accounts;
CREATE POLICY "Admins can insert accounts"
  ON accounts FOR INSERT
  WITH CHECK (is_user_admin(auth.uid()));

-- Step 4: Also ensure admins can read account_types (redundant but safe)
DROP POLICY IF EXISTS "Admins can view account types" ON account_types;
CREATE POLICY "Admins can view account types"
  ON account_types FOR SELECT
  USING (is_user_admin(auth.uid()));

-- Step 5: Verify the policies exist
SELECT 
  'Account Types Policies' as info,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'account_types'
ORDER BY policyname;

SELECT 
  'Accounts Policies' as info,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'accounts'
ORDER BY policyname;

-- Step 6: Add admin policy for transactions INSERT (allows admins to create transactions)
DROP POLICY IF EXISTS "Admins can insert transactions" ON transactions;
CREATE POLICY "Admins can insert transactions"
  ON transactions FOR INSERT
  WITH CHECK (is_user_admin(auth.uid()));

-- Step 7: Test query (should work for admins)
-- This will show if the policies are working
SELECT 
  'Test: Can admin read account_types?' as test,
  COUNT(*) as account_type_count
FROM account_types;
