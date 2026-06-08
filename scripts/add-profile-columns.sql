-- Add missing columns to user_profiles table
-- Run this if your user_profiles table doesn't have phone_number, address, date_of_birth

-- Add phone_number column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN phone_number VARCHAR(20);
  END IF;
END $$;

-- Add address column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name = 'address'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN address TEXT;
  END IF;
END $$;

-- Add date_of_birth column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name = 'date_of_birth'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN date_of_birth DATE;
  END IF;
END $$;

-- Verify columns were added
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'user_profiles'
ORDER BY ordinal_position;

