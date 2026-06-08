-- Add profile_picture column to user_profiles table
-- This will store ImageKit.io URLs for user profile pictures

-- Check if column exists, if not add it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name = 'profile_picture'
  ) THEN
    ALTER TABLE user_profiles 
    ADD COLUMN profile_picture TEXT;
    
    COMMENT ON COLUMN user_profiles.profile_picture IS 'ImageKit.io URL for user profile picture';
  END IF;
END $$;

