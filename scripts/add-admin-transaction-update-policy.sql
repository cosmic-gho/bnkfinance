-- Add RLS policy to allow admins to update transactions
-- This is needed for the approve/reject functionality

-- Step 1: Ensure the is_user_admin function exists
CREATE OR REPLACE FUNCTION is_user_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = user_id AND is_admin = TRUE
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION is_user_admin(UUID) TO authenticated;

-- Step 2: Add admin policy for updating transactions
DROP POLICY IF EXISTS "Admins can update all transactions" ON transactions;
CREATE POLICY "Admins can update all transactions"
  ON transactions FOR UPDATE
  USING (is_user_admin(auth.uid()));

-- Step 3: Verify the policy was created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'transactions'
AND policyname = 'Admins can update all transactions';




