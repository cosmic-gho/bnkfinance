-- Add currency column to user_profiles table
-- This allows users to have a preferred currency (USD, EUR, GBP, etc.)

-- Step 1: Add currency column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name = 'currency'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN currency VARCHAR(3) DEFAULT 'USD';
  END IF;
END $$;

-- Step 2: Add check constraint for valid currency codes
ALTER TABLE user_profiles
DROP CONSTRAINT IF EXISTS user_profiles_currency_check;

ALTER TABLE user_profiles
ADD CONSTRAINT user_profiles_currency_check 
CHECK (currency IN ('USD', 'EUR', 'GBP', 'JPY', 'CNY', 'AUD', 'CAD', 'CHF', 'HKD', 'SGD'));

-- Step 3: Update existing users to have USD as default if currency is NULL
UPDATE user_profiles 
SET currency = 'USD' 
WHERE currency IS NULL OR currency = '';

-- Step 4: Verify the column was added
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_profiles'
  AND column_name = 'currency';
