-- Update transaction types to include local_transfer and wire_transfer
-- Both require PIN verification

-- Step 1: Drop the existing check constraint
ALTER TABLE transactions 
DROP CONSTRAINT IF EXISTS transactions_transaction_type_check;

-- Step 2: Add new constraint with updated transaction types
ALTER TABLE transactions
ADD CONSTRAINT transactions_transaction_type_check 
CHECK (transaction_type IN (
  'deposit', 
  'withdrawal', 
  'transfer', 
  'payment',
  'local_transfer',
  'wire_transfer'
));

-- Step 3: Verify the constraint
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conname = 'transactions_transaction_type_check';

