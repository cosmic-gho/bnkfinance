-- Update handle_new_user function to automatically create user profile and savings account
-- This will run when a new user signs up

-- Drop the old trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create updated function that creates profile AND savings account
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  savings_account_type_id INTEGER;
  account_number_value VARCHAR(50);
  profile_created BOOLEAN := FALSE;
BEGIN
  -- Create user profile first
  INSERT INTO user_profiles (id, username, first_name, last_name, is_admin)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NULL),
    COALESCE(NEW.raw_user_meta_data->>'first_name', NULL),
    COALESCE(NEW.raw_user_meta_data->>'last_name', NULL),
    FALSE
  )
  ON CONFLICT (id) DO NOTHING
  RETURNING TRUE INTO profile_created;

  -- Get the Savings account type ID
  SELECT id INTO savings_account_type_id
  FROM account_types
  WHERE name = 'Savings'
  LIMIT 1;

  -- Only create account if Savings type exists
  IF savings_account_type_id IS NOT NULL THEN
    -- Generate unique account number: SAV + timestamp + random 6 digits
    -- Format: SAV-YYYYMMDD-HHMMSS-XXXXXX
    account_number_value := 'SAV-' || 
      TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
      TO_CHAR(NOW(), 'HH24MISS') || '-' ||
      LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');

    -- Ensure uniqueness by checking and regenerating if needed
    WHILE EXISTS (SELECT 1 FROM accounts WHERE account_number = account_number_value) LOOP
      account_number_value := 'SAV-' || 
        TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
        TO_CHAR(NOW(), 'HH24MISS') || '-' ||
        LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    END LOOP;

    -- Create the savings account
    INSERT INTO accounts (user_id, account_type_id, account_number, balance, is_active)
    VALUES (
      NEW.id,
      savings_account_type_id,
      account_number_value,
      0.00,
      TRUE
    )
    ON CONFLICT (account_number) DO NOTHING;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    RAISE WARNING 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Note: This will automatically create a savings account for all NEW users
-- For existing users without accounts, you can run:
-- 
-- INSERT INTO accounts (user_id, account_type_id, account_number, balance, is_active)
-- SELECT 
--   up.id,
--   (SELECT id FROM account_types WHERE name = 'Savings' LIMIT 1),
--   'SAV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || TO_CHAR(NOW(), 'HH24MISS') || '-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0'),
--   0.00,
--   TRUE
-- FROM user_profiles up
-- WHERE NOT EXISTS (
--   SELECT 1 FROM accounts WHERE accounts.user_id = up.id
-- );

