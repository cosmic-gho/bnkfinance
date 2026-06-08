-- FIX: Auto-create profile and savings account on signup
-- Run this in your Supabase SQL Editor to fix the automation

-- Step 1: Ensure Savings account type exists
INSERT INTO account_types (name, description) 
VALUES ('Savings', 'Savings account with interest')
ON CONFLICT (name) DO NOTHING;

-- Step 2: Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Step 3: Create the function with comprehensive error handling
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
  -- Create user profile
  BEGIN
    INSERT INTO public.user_profiles (id, username, first_name, last_name, is_admin)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'username', NULL),
      COALESCE(NEW.raw_user_meta_data->>'first_name', NULL),
      COALESCE(NEW.raw_user_meta_data->>'last_name', NULL),
      FALSE
    )
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION
    WHEN OTHERS THEN
      -- Log but continue
      RAISE WARNING 'Profile creation failed for user %: %', NEW.id, SQLERRM;
  END;

  -- Get Savings account type ID
  BEGIN
    SELECT id INTO savings_account_type_id
    FROM public.account_types
    WHERE name = 'Savings'
    LIMIT 1;
    
    IF savings_account_type_id IS NULL THEN
      RAISE WARNING 'Savings account type not found';
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
    INSERT INTO public.accounts (user_id, account_type_id, account_number, balance, is_active)
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
      RAISE WARNING 'Account creation failed for user %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Never fail user creation, just log the error
    RAISE WARNING 'Unexpected error in handle_new_user for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Step 4: Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Step 5: Verify setup
DO $$
BEGIN
  RAISE NOTICE 'Setup complete!';
  RAISE NOTICE 'Trigger: on_auth_user_created';
  RAISE NOTICE 'Function: handle_new_user()';
  RAISE NOTICE 'Next signup will automatically create profile and savings account';
END $$;

-- Step 6: Check if everything is set up correctly
SELECT 
  '✅ Trigger Status' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.triggers 
      WHERE trigger_name = 'on_auth_user_created'
    ) THEN 'Trigger exists'
    ELSE '❌ Trigger missing'
  END as status;

SELECT 
  '✅ Function Status' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_name = 'handle_new_user'
    ) THEN 'Function exists'
    ELSE '❌ Function missing'
  END as status;

SELECT 
  '✅ Savings Account Type' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM account_types WHERE name = 'Savings'
    ) THEN 'Savings type exists'
    ELSE '❌ Savings type missing'
  END as status;

