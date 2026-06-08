-- Add limit fields to accounts table
-- This allows admins to set transaction limits and daily limits per account

-- Step 1: Add transaction_limit column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'accounts' 
    AND column_name = 'transaction_limit'
  ) THEN
    ALTER TABLE accounts ADD COLUMN transaction_limit DECIMAL(15, 2) DEFAULT 500000.00;
  END IF;
END $$;

-- Step 2: Add daily_limit column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'accounts' 
    AND column_name = 'daily_limit'
  ) THEN
    ALTER TABLE accounts ADD COLUMN daily_limit DECIMAL(15, 2) DEFAULT 10000.00;
  END IF;
END $$;

-- Step 3: Update existing accounts to have default limits if NULL
UPDATE accounts 
SET transaction_limit = 500000.00 
WHERE transaction_limit IS NULL;

UPDATE accounts 
SET daily_limit = 10000.00 
WHERE daily_limit IS NULL;

-- Step 4: Set NOT NULL constraints (after updating NULLs)
ALTER TABLE accounts
ALTER COLUMN transaction_limit SET NOT NULL;

ALTER TABLE accounts
ALTER COLUMN daily_limit SET NOT NULL;

ALTER TABLE accounts
ALTER COLUMN transaction_limit SET DEFAULT 500000.00;

ALTER TABLE accounts
ALTER COLUMN daily_limit SET DEFAULT 10000.00;

-- Step 5: Verify the columns were added
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'accounts'
  AND column_name IN ('transaction_limit', 'daily_limit')
ORDER BY column_name;
