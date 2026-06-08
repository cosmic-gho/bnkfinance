-- Add status field to transactions table for pending/approved transactions
-- This allows transactions to be created without debiting accounts until approved

-- Step 1: Add status column
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'approved';

-- Step 2: Add check constraint for status values
ALTER TABLE transactions
DROP CONSTRAINT IF EXISTS transactions_status_check;

ALTER TABLE transactions
ADD CONSTRAINT transactions_status_check 
CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled'));

-- Step 3: Update existing transactions to approved status
UPDATE transactions 
SET status = 'approved' 
WHERE status IS NULL OR status = '';

-- Step 4: Set default to pending for new transactions (can be changed per transaction type)
-- Note: We'll handle this in application code, but default is 'approved' for backward compatibility

-- Step 5: Verify the column was added
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'transactions'
  AND column_name = 'status';

-- Step 6: Add index for faster queries on pending transactions
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_status_type ON transactions(status, transaction_type);

