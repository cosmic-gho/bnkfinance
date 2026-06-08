-- Ensure user profile and account are auto-created on signup
-- Run this to guarantee the trigger is set up correctly

-- Step 1: Ensure Savings account type exists
INSERT INTO account_types (name, description) 
VALUES ('Savings', 'Savings account with interest')
ON CONFLICT (name) DO NOTHING;

-- Step 2: Drop and recreate the trigger function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Step 3: Create the function that creates profile AND account
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  savings_account_type_id INTEGER;
  account_number_value VARCHAR(50);
  max_attempts INTEGER := 20;
  attempt_count INTEGER := 0;
BEGIN
  -- Create user profile FIRST
  BEGIN
    INSERT INTO public.user_profiles (
      id, 
      username, 
      first_name, 
      last_name, 
      is_admin
    )
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'username', NULL),
      COALESCE(NEW.raw_user_meta_data->>'first_name', NULL),
      COALESCE(NEW.raw_user_meta_data->>'last_name', NULL),
      FALSE
    )
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'Profile created for user: %', NEW.id;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Profile creation failed for user %: %', NEW.id, SQLERRM;
      -- Don't fail user creation, just log the error
  END;

  -- Get Savings account type ID
  BEGIN
    SELECT id INTO savings_account_type_id
    FROM public.account_types
    WHERE name = 'Savings'
    LIMIT 1;
    
    IF savings_account_type_id IS NULL THEN
      RAISE WARNING 'Savings account type not found - skipping account creation';
      RETURN NEW;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Error getting Savings account type: %', SQLERRM;
      RETURN NEW;
  END;

  -- Generate unique account number
  LOOP
    account_number_value := 'SAV-' || 
      TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
      LPAD((EXTRACT(EPOCH FROM NOW())::BIGINT % 1000000)::TEXT, 6, '0') || '-' ||
      LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    
    -- Check uniqueness
    IF NOT EXISTS (
      SELECT 1 FROM public.accounts WHERE account_number = account_number_value
    ) THEN
      EXIT;
    END IF;
    
    attempt_count := attempt_count + 1;
    IF attempt_count >= max_attempts THEN
      -- Fallback: use UUID-based number
      account_number_value := 'SAV-' || 
        REPLACE(SUBSTRING(NEW.id::TEXT, 1, 8), '-', '') || '-' ||
        TO_CHAR(EXTRACT(EPOCH FROM NOW())::BIGINT % 100000, 'FM00000');
      EXIT;
    END IF;
  END LOOP;

  -- Create the savings account
  BEGIN
    INSERT INTO public.accounts (
      user_id, 
      account_type_id, 
      account_number, 
      balance, 
      is_active
    )
    VALUES (
      NEW.id,
      savings_account_type_id,
      account_number_value,
      0.00,
      TRUE
    )
    ON CONFLICT (account_number) DO NOTHING;
    
    RAISE NOTICE 'Account created for user: % with number: %', NEW.id, account_number_value;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Account creation failed for user %: %', NEW.id, SQLERRM;
      -- Don't fail user creation, just log the error
  END;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Never fail user creation, just log the error
    RAISE WARNING 'Unexpected error in handle_new_user for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Step 4: Create the trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Step 5: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated;
GRANT ALL ON user_profiles TO postgres, authenticated;
GRANT ALL ON accounts TO postgres, authenticated;
GRANT ALL ON account_types TO postgres, authenticated;

-- Step 6: Verify setup
SELECT 
  '✅ Setup Complete' as status,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_name = 'handle_new_user'
    ) AND EXISTS (
      SELECT 1 FROM information_schema.triggers 
      WHERE trigger_name = 'on_auth_user_created'
      AND event_object_table = 'users'
      AND event_object_schema = 'auth'
    ) THEN 'Trigger is properly configured'
    ELSE '❌ Setup incomplete'
  END as message;

-- Step 7: Show recent signups to verify it's working
SELECT 
  'Recent Signups' as info,
  up.id,
  up.username,
  up.first_name,
  up.last_name,
  up.created_at as profile_created,
  COUNT(a.id) as account_count
FROM user_profiles up
LEFT JOIN accounts a ON a.user_id = up.id
WHERE up.created_at > NOW() - INTERVAL '7 days'
GROUP BY up.id, up.username, up.first_name, up.last_name, up.created_at
ORDER BY up.created_at DESC
LIMIT 10;

