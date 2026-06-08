# How to Create an Admin User

## Quick Steps

1. **Sign up/Login**: First, create a regular user account by signing up on your app
2. **Open Supabase Dashboard**: Go to your Supabase project dashboard
3. **Open SQL Editor**: Click on "SQL Editor" in the left sidebar
4. **Run the SQL**: Copy and paste one of the queries below

## SQL Queries

### Option 1: Set Admin by Email (Easiest)

```sql
UPDATE user_profiles 
SET is_admin = TRUE 
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com'
);
```

Replace `'your-email@example.com'` with your actual email address.

### Option 2: Set Admin by User ID

If you know your user ID (UUID), you can use:

```sql
UPDATE user_profiles 
SET is_admin = TRUE 
WHERE id = 'your-user-uuid-here';
```

### Option 3: Find Your User ID First

If you're not sure of your user ID, run this to see all users:

```sql
SELECT 
  au.id,
  au.email,
  up.username,
  up.first_name,
  up.last_name,
  up.is_admin
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
ORDER BY au.created_at DESC;
```

Then use the `id` from the result in Option 2.

## Verify Admin Status

After running the UPDATE query, verify it worked:

```sql
SELECT 
  up.id,
  up.username,
  up.first_name,
  up.last_name,
  up.is_admin,
  au.email
FROM user_profiles up
JOIN auth.users au ON up.id = au.id
WHERE up.is_admin = TRUE;
```

This will show all admin users. You should see your user with `is_admin = true`.

## Test Admin Access

1. Log out of your app (if logged in)
2. Log back in with your admin account
3. Navigate to `/admin` in your browser
4. You should see the admin panel!

## Troubleshooting

### "No rows affected"
- Make sure the email/user ID is correct
- Make sure you've signed up first (user profile exists)
- Check that the user_profiles table was created correctly

### "Permission denied"
- Make sure you're running this in the Supabase SQL Editor
- The SQL Editor uses service role permissions and should work

### Still can't access admin panel
- Clear your browser cache/cookies
- Make sure you're logged in with the correct account
- Check browser console for any errors
- Verify `is_admin = TRUE` in the database using the verification query above


