-- Add foreign key relationship between accounts and user_profiles
-- This allows Supabase to auto-detect the relationship for joins
-- Note: accounts.user_id already references auth.users(id), 
-- but we also need it to reference user_profiles(id) for Supabase PostgREST

-- First, check if the foreign key already exists
DO $$
BEGIN
  -- Check if foreign key constraint already exists
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'accounts_user_id_user_profiles_fkey'
    AND table_name = 'accounts'
  ) THEN
    -- Add foreign key constraint from accounts.user_id to user_profiles.id
    -- This is in addition to the existing foreign key to auth.users
    ALTER TABLE accounts
    ADD CONSTRAINT accounts_user_id_user_profiles_fkey
    FOREIGN KEY (user_id) 
    REFERENCES user_profiles(id) 
    ON DELETE CASCADE;
    
    RAISE NOTICE 'Foreign key constraint added successfully';
  ELSE
    RAISE NOTICE 'Foreign key constraint already exists';
  END IF;
END $$;

-- Verify the constraint was created
SELECT 
  'Foreign Key Constraints on accounts.user_id:' as info,
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'accounts'
  AND kcu.column_name = 'user_id'
  AND tc.constraint_type = 'FOREIGN KEY';

