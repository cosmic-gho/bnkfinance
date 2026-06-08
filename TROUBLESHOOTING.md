# Troubleshooting: Signup Error 500

## Error: "database error saving user" or 500 error on signup

This error occurs when the database trigger fails during user signup.

## Quick Fix

Run this SQL in your Supabase SQL Editor:

```sql
-- Drop and recreate the trigger function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Recreate with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, username, first_name, last_name, is_admin)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NULL),
    COALESCE(NEW.raw_user_meta_data->>'first_name', NULL),
    COALESCE(NEW.raw_user_meta_data->>'last_name', NULL),
    FALSE
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

## Common Causes

1. **RLS Policy Conflicts**: The trigger uses `SECURITY DEFINER` to bypass RLS, but if there are constraint issues, it might still fail.

2. **Username Uniqueness**: If a username already exists, the UNIQUE constraint will fail. The fix above uses `ON CONFLICT DO NOTHING` to handle this.

3. **NULL Values**: The original trigger might fail if metadata fields are NULL. The fix uses `COALESCE` to handle NULLs properly.

4. **Missing is_admin Column**: If you haven't run the updated schema, the `is_admin` column might not exist. Make sure you've run the full `supabase-schema.sql` script.

## Verify the Fix

1. Try signing up again with a new email
2. Check if the user was created:
   ```sql
   SELECT * FROM user_profiles ORDER BY created_at DESC LIMIT 5;
   ```
3. Check Supabase logs (Dashboard → Logs → Postgres Logs) for any errors

## Alternative: Manual Profile Creation

If the trigger continues to fail, you can manually create profiles for existing users:

```sql
-- For a specific user
INSERT INTO user_profiles (id, username, first_name, last_name, is_admin)
SELECT 
  id,
  raw_user_meta_data->>'username',
  raw_user_meta_data->>'first_name',
  raw_user_meta_data->>'last_name',
  FALSE
FROM auth.users
WHERE id NOT IN (SELECT id FROM user_profiles)
LIMIT 1
ON CONFLICT (id) DO NOTHING;
```

## Still Having Issues?

1. Check Supabase Postgres logs for detailed error messages
2. Verify all tables exist: `SELECT * FROM information_schema.tables WHERE table_schema = 'public';`
3. Verify the trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';`
4. Check RLS is enabled: `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';`


