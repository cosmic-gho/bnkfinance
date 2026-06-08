# Troubleshooting: Auto-Account Creation Not Working

If new user signups are not automatically creating profiles and savings accounts, follow these steps:

## Quick Fix

Run this SQL script in your Supabase SQL Editor:
**File: `scripts/fix-auto-account-creation.sql`**

This will:
1. Ensure the Savings account type exists
2. Drop and recreate the trigger function
3. Set up the trigger correctly
4. Verify everything is working

## Step-by-Step Diagnosis

### 1. Check if the Trigger Exists

Run this in Supabase SQL Editor:
```sql
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

**Expected:** Should return one row with the trigger name.

**If empty:** The trigger doesn't exist. Run the fix script above.

### 2. Check if the Function Exists

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';
```

**Expected:** Should return one row.

**If empty:** The function doesn't exist. Run the fix script above.

### 3. Check if Savings Account Type Exists

```sql
SELECT * FROM account_types WHERE name = 'Savings';
```

**Expected:** Should return one row with id, name='Savings'.

**If empty:** Run this:
```sql
INSERT INTO account_types (name, description) 
VALUES ('Savings', 'Savings account with interest')
ON CONFLICT (name) DO NOTHING;
```

### 4. Check Recent Signups

```sql
-- Check recent users
SELECT 
  up.id,
  up.username,
  up.created_at,
  COUNT(a.id) as account_count
FROM user_profiles up
LEFT JOIN accounts a ON a.user_id = up.id
WHERE up.created_at > NOW() - INTERVAL '24 hours'
GROUP BY up.id, up.username, up.created_at
ORDER BY up.created_at DESC;
```

**Expected:** Recent users should have `account_count = 1` or more.

**If account_count = 0:** The trigger isn't working. Check logs (see below).

### 5. Check Supabase Logs

1. Go to your Supabase Dashboard
2. Navigate to **Logs** → **Postgres Logs**
3. Look for entries with `handle_new_user` or `WARNING`
4. Check for any error messages

Common errors:
- `Savings account type not found` → Run Step 3 above
- `permission denied` → RLS policy issue (see below)
- `duplicate key value` → Account number collision (should be handled, but check)

### 6. Check RLS Policies

The trigger uses `SECURITY DEFINER` which should bypass RLS, but verify:

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('user_profiles', 'accounts', 'account_types');
```

All should have `rowsecurity = true`.

### 7. Test the Function Manually

**⚠️ WARNING: Only for testing with a test user**

```sql
-- Get a test user ID (replace with actual test user ID)
-- This simulates what happens during signup
DO $$
DECLARE
  test_user_id UUID := 'YOUR_TEST_USER_ID_HERE';
  result INTEGER;
BEGIN
  -- This won't actually create a user, but tests the logic
  SELECT handle_new_user() FROM (SELECT test_user_id::uuid as id) as test;
END $$;
```

## Common Issues and Solutions

### Issue 1: Trigger Not Firing

**Symptoms:** Profile created but no account

**Solution:** 
- Run `scripts/fix-auto-account-creation.sql`
- Verify trigger exists (Step 1 above)

### Issue 2: Savings Account Type Missing

**Symptoms:** Profile created, but account creation fails silently

**Solution:**
```sql
INSERT INTO account_types (name, description) 
VALUES ('Savings', 'Savings account with interest')
ON CONFLICT (name) DO NOTHING;
```

### Issue 3: RLS Blocking Account Creation

**Symptoms:** Errors in logs about permissions

**Solution:** The function uses `SECURITY DEFINER` which should bypass RLS. If issues persist:
```sql
-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres;
GRANT ALL ON account_types TO postgres;
GRANT ALL ON accounts TO postgres;
GRANT ALL ON user_profiles TO postgres;
```

### Issue 4: Account Number Collision

**Symptoms:** Rare, but possible if many users sign up simultaneously

**Solution:** The function has retry logic. If it still fails, the fallback uses UUID-based numbers.

## Manual Fix for Existing Users

If you have users who signed up before the automation was fixed:

```sql
-- Create accounts for users without any accounts
INSERT INTO accounts (user_id, account_type_id, account_number, balance, is_active)
SELECT 
  up.id,
  (SELECT id FROM account_types WHERE name = 'Savings' LIMIT 1),
  'SAV-' || 
    TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
    LPAD((EXTRACT(EPOCH FROM NOW())::BIGINT % 1000000)::TEXT, 6, '0') || '-' ||
    LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0'),
  0.00,
  TRUE
FROM user_profiles up
WHERE NOT EXISTS (
  SELECT 1 FROM accounts WHERE accounts.user_id = up.id
)
ON CONFLICT (account_number) DO NOTHING;
```

## Verification After Fix

After running the fix script, test by:

1. **Create a test account** (use a new email)
2. **Check if profile was created:**
   ```sql
   SELECT * FROM user_profiles 
   WHERE email = 'test@example.com' 
   ORDER BY created_at DESC LIMIT 1;
   ```
3. **Check if account was created:**
   ```sql
   SELECT a.*, at.name as account_type
   FROM accounts a
   JOIN account_types at ON at.id = a.account_type_id
   JOIN user_profiles up ON up.id = a.user_id
   WHERE up.email = 'test@example.com';
   ```

## Still Not Working?

1. Check Supabase Dashboard → Logs → Postgres Logs for errors
2. Verify you ran the complete fix script
3. Check that the trigger is on `auth.users` table (not `public.users`)
4. Ensure you're using Supabase Auth (not custom auth)

