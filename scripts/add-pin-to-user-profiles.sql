-- Add PIN field to user_profiles table for transfer authentication
-- PIN is stored as a hashed value for security

-- Step 1: Add PIN column to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS transfer_pin VARCHAR(255);

-- Step 2: Add comment explaining the PIN field
COMMENT ON COLUMN user_profiles.transfer_pin IS 'Hashed 4-digit PIN for local and wire transfers. Set by admin.';

-- Step 3: Verify the column was added
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_profiles'
  AND column_name = 'transfer_pin';

-- Note: PINs should be hashed before storage
-- Use bcrypt or similar hashing in your application code
-- Example: hashPin('1234') -> '$2b$10$...'

