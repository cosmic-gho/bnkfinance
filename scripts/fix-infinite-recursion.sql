-- Fix infinite recursion in user_profiles RLS policies
-- This happens because admin policies query user_profiles, which triggers RLS again

-- Step 1: Drop the problematic admin policies
DROP POLICY IF EXISTS "Admins can view all user profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all user profiles" ON user_profiles;

-- Step 2: Create a security definer function to check admin status
-- This function bypasses RLS, preventing infinite recursion
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

-- Step 3: Recreate admin policies using the function
CREATE POLICY "Admins can view all user profiles"
  ON user_profiles FOR SELECT
  USING (is_user_admin(auth.uid()));

CREATE POLICY "Admins can update all user profiles"
  ON user_profiles FOR UPDATE
  USING (is_user_admin(auth.uid()));

-- Step 4: Also fix admin policies for other tables to use the function
-- This prevents similar issues and improves performance

-- Drop existing admin policies on other tables
DROP POLICY IF EXISTS "Admins can view all accounts" ON accounts;
DROP POLICY IF EXISTS "Admins can update all accounts" ON accounts;
DROP POLICY IF EXISTS "Admins can view all transactions" ON transactions;
DROP POLICY IF EXISTS "Admins can view all notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can create notifications" ON notifications;

-- Recreate with the function
CREATE POLICY "Admins can view all accounts"
  ON accounts FOR SELECT
  USING (is_user_admin(auth.uid()));

CREATE POLICY "Admins can update all accounts"
  ON accounts FOR UPDATE
  USING (is_user_admin(auth.uid()));

CREATE POLICY "Admins can view all transactions"
  ON transactions FOR SELECT
  USING (is_user_admin(auth.uid()));

CREATE POLICY "Admins can view all notifications"
  ON notifications FOR SELECT
  USING (is_user_admin(auth.uid()));

CREATE POLICY "Admins can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (is_user_admin(auth.uid()));

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_user_admin(UUID) TO authenticated;

