-- Script to set a user as admin
-- Replace 'your-email@example.com' with the email of the user you want to make admin

-- Option 1: Set admin by email
UPDATE user_profiles 
SET is_admin = TRUE 
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com'
);

-- Option 2: Set admin by user ID (if you know the UUID)
-- UPDATE user_profiles 
-- SET is_admin = TRUE 
-- WHERE id = 'user-uuid-here';

-- Verify the update
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

