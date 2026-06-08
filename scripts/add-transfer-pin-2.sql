-- Add transfer_pin_2 column to user_profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns   
    WHERE table_schema = 'public'
    AND table_name = 'user_profiles'
    AND column_name = 'transfer_pin_2'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN transfer_pin_2 VARCHAR(255);
  END IF;
END $$;
