-- Add can_transfer boolean column to user_profiles table
-- This allows admins to disable transfer functionality for specific users

-- Step 1: Add can_transfer column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name = 'can_transfer'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN can_transfer BOOLEAN DEFAULT TRUE;
  END IF;
END $$;

-- Step 2: Update existing users to have can_transfer = TRUE by default
UPDATE user_profiles 
SET can_transfer = TRUE 
WHERE can_transfer IS NULL;

-- Step 3: Set NOT NULL constraint (after updating NULLs)
ALTER TABLE user_profiles
ALTER COLUMN can_transfer SET NOT NULL;

ALTER TABLE user_profiles
ALTER COLUMN can_transfer SET DEFAULT TRUE;

-- Step 4: Verify the column was added
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_profiles'
  AND column_name = 'can_transfer';
