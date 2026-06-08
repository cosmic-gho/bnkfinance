-- Comprehensive diagnostic and fix script for auto-account creation
-- Run this to check and fix the signup automation

-- Step 1: Check if trigger exists
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Step 2: Check if function exists
SELECT 
  routine_name, 
  routine_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- Step 3: Check if Savings account type exists
SELECT id, name, description 
FROM account_types 
WHERE name = 'Savings';

-- Step 4: If Savings doesn't exist, create it
INSERT INTO account_types (name, description) 
VALUES ('Savings', 'Savings account with interest')
ON CONFLICT (name) DO NOTHING;

-- Step 5: Drop and recreate the trigger function with better error handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create improved function with better error handling and logging
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  savings_account_type_id INTEGER;
  account_number_value VARCHAR(50);
  profile_created BOOLEAN := FALSE;
  max_attempts INTEGER := 10;
  attempt_count INTEGER := 0;
BEGIN
  -- Create user profile first
  BEGIN
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
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
  END;

  -- Get the Savings account type ID
  BEGIN
    SELECT id INTO savings_account_type_id
    FROM account_types
    WHERE name = 'Savings'
    LIMIT 1;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Failed to get Savings account type: %', SQLERRM;
      savings_account_type_id := NULL;
  END;

  -- Only create account if Savings type exists
  IF savings_account_type_id IS NOT NULL THEN
    BEGIN
      -- Generate unique account number with retry logic
      LOOP
        account_number_value := 'SAV-' || 
          TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
          TO_CHAR(EXTRACT(EPOCH FROM NOW())::BIGINT % 1000000, 'FM000000') || '-' ||
          LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
        
        -- Check if it exists
        IF NOT EXISTS (SELECT 1 FROM accounts WHERE account_number = account_number_value) THEN
          EXIT; -- Found unique number
        END IF;
        
        attempt_count := attempt_count + 1;
        IF attempt_count >= max_attempts THEN
          -- Fallback: use UUID-based number
          account_number_value := 'SAV-' || REPLACE(NEW.id::TEXT, '-', '') || '-' || 
            LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
          EXIT;
        END IF;
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
      
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Failed to create account for user %: %', NEW.id, SQLERRM;
    END;
  ELSE
    RAISE WARNING 'Savings account type not found. Account not created for user %', NEW.id;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    RAISE WARNING 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Step 7: Verify the setup
SELECT 
  'Trigger created successfully' as status,
  trigger_name,
  event_object_table
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

SELECT 
  'Function created successfully' as status,
  routine_name
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

SELECT 
  'Savings account type exists' as status,
  id,
  name
FROM account_types 
WHERE name = 'Savings';

-- Step 8: Check recent users and their accounts
SELECT 
  up.id,
  up.username,
  up.first_name,
  up.last_name,
  up.created_at as profile_created,
  COUNT(a.id) as account_count,
  STRING_AGG(a.account_number, ', ') as account_numbers
FROM user_profiles up
LEFT JOIN accounts a ON a.user_id = up.id
WHERE up.created_at > NOW() - INTERVAL '1 day'
GROUP BY up.id, up.username, up.first_name, up.last_name, up.created_at
ORDER BY up.created_at DESC
LIMIT 10;

