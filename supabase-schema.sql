-- Supabase Database Schema for Banking App
-- Run this in your Supabase SQL Editor to set up the database schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Account Types table
CREATE TABLE IF NOT EXISTS account_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transaction Categories table
CREATE TABLE IF NOT EXISTS transaction_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Accounts table (references auth.users)
CREATE TABLE IF NOT EXISTS accounts (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_type_id INTEGER NOT NULL REFERENCES account_types(id),
  account_number VARCHAR(50) NOT NULL UNIQUE,
  balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'transfer', 'payment')),
  amount DECIMAL(15, 2) NOT NULL,
  description TEXT,
  category_id INTEGER REFERENCES transaction_categories(id) ON DELETE SET NULL,
  recipient_account_id INTEGER REFERENCES accounts(id) ON DELETE SET NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(150) UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone_number VARCHAR(20),
  address TEXT,
  date_of_birth DATE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Accounts
DROP POLICY IF EXISTS "Users can view their own accounts" ON accounts;
CREATE POLICY "Users can view their own accounts"
  ON accounts FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own accounts" ON accounts;
CREATE POLICY "Users can insert their own accounts"
  ON accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own accounts" ON accounts;
CREATE POLICY "Users can update their own accounts"
  ON accounts FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for Transactions
DROP POLICY IF EXISTS "Users can view transactions for their accounts" ON transactions;
CREATE POLICY "Users can view transactions for their accounts"
  ON transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM accounts 
      WHERE accounts.id = transactions.account_id 
      AND accounts.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM accounts 
      WHERE accounts.id = transactions.recipient_account_id 
      AND accounts.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert transactions for their accounts" ON transactions;
CREATE POLICY "Users can insert transactions for their accounts"
  ON transactions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM accounts 
      WHERE accounts.id = transactions.account_id 
      AND accounts.user_id = auth.uid()
    )
  );

-- RLS Policies for Notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for User Profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Function to check admin status (bypasses RLS to prevent infinite recursion)
CREATE OR REPLACE FUNCTION is_user_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = user_id AND is_admin = TRUE
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_user_admin(UUID) TO authenticated;

-- Admin policies (bypass RLS for admins using the function)
DROP POLICY IF EXISTS "Admins can view all user profiles" ON user_profiles;
CREATE POLICY "Admins can view all user profiles"
  ON user_profiles FOR SELECT
  USING (is_user_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update all user profiles" ON user_profiles;
CREATE POLICY "Admins can update all user profiles"
  ON user_profiles FOR UPDATE
  USING (is_user_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can view all accounts" ON accounts;
CREATE POLICY "Admins can view all accounts"
  ON accounts FOR SELECT
  USING (is_user_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update all accounts" ON accounts;
CREATE POLICY "Admins can update all accounts"
  ON accounts FOR UPDATE
  USING (is_user_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can view all transactions" ON transactions;
CREATE POLICY "Admins can view all transactions"
  ON transactions FOR SELECT
  USING (is_user_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can view all notifications" ON notifications;
CREATE POLICY "Admins can view all notifications"
  ON notifications FOR SELECT
  USING (is_user_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can create notifications" ON notifications;
CREATE POLICY "Admins can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (is_user_admin(auth.uid()));

-- Functions and Triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for accounts updated_at
DROP TRIGGER IF EXISTS update_accounts_updated_at ON accounts;
CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_profiles updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile and savings account on signup
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
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Profile creation failed for user %: %', NEW.id, SQLERRM;
  END;

  -- Get the Savings account type ID
  BEGIN
    SELECT id INTO savings_account_type_id
    FROM account_types
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
      SELECT 1 FROM accounts WHERE account_number = account_number_value
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

-- Trigger to create profile on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Insert default account types
INSERT INTO account_types (name, description) VALUES
  ('Checking', 'Standard checking account'),
  ('Savings', 'Savings account with interest'),
  ('Business', 'Business account')
ON CONFLICT (name) DO NOTHING;

-- Insert default transaction categories
INSERT INTO transaction_categories (name, description) VALUES
  ('Food & Dining', 'Restaurants, groceries, food delivery'),
  ('Transportation', 'Gas, public transport, rideshare'),
  ('Shopping', 'Retail purchases, online shopping'),
  ('Bills & Utilities', 'Rent, utilities, subscriptions'),
  ('Entertainment', 'Movies, games, events'),
  ('Healthcare', 'Medical expenses, pharmacy'),
  ('Income', 'Salary, freelance, refunds')
ON CONFLICT (name) DO NOTHING;
