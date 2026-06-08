-- Add verification_step column to transactions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns   
    WHERE table_schema = 'public'
    AND table_name = 'transactions'
    AND column_name = 'verification_step'
  ) THEN
    ALTER TABLE transactions ADD COLUMN verification_step INTEGER DEFAULT 0;
  END IF;
END $$;
