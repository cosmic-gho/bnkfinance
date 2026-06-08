-- ============================================================================
-- COMPLETE DATABASE SCHEMA FOR BNK Finance Bank
-- ============================================================================
-- This file combines all database schema definitions into a single comprehensive
-- schema file that can be run to set up the entire database from scratch.
-- It is idempotent: it can be run multiple times safely.
-- 
-- Run this in your Supabase SQL Editor to set up the complete database schema.
-- ============================================================================

-- ============================================================================
-- 1. EXTENSIONS
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 2. CORE TABLES
-- ============================================================================

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

-- ============================================================================
-- 3. MAIN TABLES
-- ============================================================================

-- User Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(150) UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone_number VARCHAR(20),
  address TEXT,
  date_of_birth DATE,
  profile_picture TEXT, -- ImageKit.io URL for user profile picture
  transfer_pin VARCHAR(255), -- Hashed 4-digit PIN for local and wire transfers
  transfer_pin_2 VARCHAR(255), -- Second PIN for high security
  can_transfer BOOLEAN DEFAULT TRUE,
  currency VARCHAR(3) DEFAULT 'USD',
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Accounts table (references auth.users)
CREATE TABLE IF NOT EXISTS accounts (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_type_id INTEGER NOT NULL REFERENCES account_types(id),
  account_number VARCHAR(50) NOT NULL UNIQUE,
  balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  transaction_limit DECIMAL(15, 2) DEFAULT 500000.00,
  daily_limit DECIMAL(15, 2) DEFAULT 10000.00,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN (
    'deposit', 
    'withdrawal', 
    'transfer', 
    'payment',
    'local_transfer',
    'wire_transfer'
  )),
  amount DECIMAL(15, 2) NOT NULL,
  description TEXT,
  category_id INTEGER REFERENCES transaction_categories(id) ON DELETE SET NULL,
  recipient_account_id INTEGER REFERENCES accounts(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  verification_step INTEGER DEFAULT 0,
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

-- ============================================================================
-- 4. ADDITIONAL FEATURE TABLES
-- ============================================================================

-- KYC Submissions table
CREATE TABLE IF NOT EXISTS kyc_submissions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ssn VARCHAR(11),
  id_card_front_url TEXT,
  id_card_back_url TEXT,
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  zip_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL DEFAULT 'United States',
  phone_number VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  admin_notes TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE
);

-- Crypto Wallets table
CREATE TABLE IF NOT EXISTS crypto_wallets (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  wallet_address TEXT NOT NULL,
  logo_url TEXT,
  network VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deposit Requests table
CREATE TABLE IF NOT EXISTS deposit_requests (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  crypto_wallet_id INTEGER NOT NULL REFERENCES crypto_wallets(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  crypto_symbol VARCHAR(10) NOT NULL,
  transaction_hash TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id)
);

-- Card Requests table
CREATE TABLE IF NOT EXISTS card_requests (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  card_type VARCHAR(20) NOT NULL CHECK (card_type IN ('virtual', 'physical')),
  card_tier VARCHAR(20) CHECK (card_tier IN ('standard', 'gold', 'platinum')),
  card_number VARCHAR(19),
  expiry_month VARCHAR(2),
  expiry_year VARCHAR(4),
  cvv VARCHAR(3),
  card_holder_name TEXT,
  daily_limit DECIMAL(15, 2),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'issued')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  issued_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- 5. IDEMPOTENT COLUMN ADDITIONS (For updates)
-- ============================================================================

-- Add transfer_pin_2 to user_profiles
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'transfer_pin_2') THEN
    ALTER TABLE user_profiles ADD COLUMN transfer_pin_2 VARCHAR(255);
  END IF;
END $$;

-- Add can_transfer to user_profiles
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'can_transfer') THEN
    ALTER TABLE user_profiles ADD COLUMN can_transfer BOOLEAN DEFAULT TRUE;
  END IF;
END $$;

-- Add currency to user_profiles
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'currency') THEN
    ALTER TABLE user_profiles ADD COLUMN currency VARCHAR(3) DEFAULT 'USD';
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_currency_check CHECK (currency IN ('USD', 'EUR', 'GBP', 'JPY', 'CNY', 'AUD', 'CAD', 'CHF', 'HKD', 'SGD'));
  END IF;
END $$;

-- Add login OTP columns to user_profiles
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'login_otp_code') THEN
    ALTER TABLE user_profiles ADD COLUMN login_otp_code VARCHAR(10);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'login_otp_expires') THEN
    ALTER TABLE user_profiles ADD COLUMN login_otp_expires TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Add limits to accounts
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'transaction_limit') THEN
    ALTER TABLE accounts ADD COLUMN transaction_limit DECIMAL(15, 2) DEFAULT 500000.00;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'daily_limit') THEN
    ALTER TABLE accounts ADD COLUMN daily_limit DECIMAL(15, 2) DEFAULT 10000.00;
  END IF;
END $$;

-- Add status and verification_step to transactions
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'status') THEN
    ALTER TABLE transactions ADD COLUMN status VARCHAR(20) DEFAULT 'approved';
    ALTER TABLE transactions ADD CONSTRAINT transactions_status_check CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'verification_step') THEN
    ALTER TABLE transactions ADD COLUMN verification_step INTEGER DEFAULT 0;
  END IF;
END $$;

-- ============================================================================
-- 6. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposit_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_requests ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 7. HELPER FUNCTIONS
-- ============================================================================

-- Function to check admin status
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

GRANT EXECUTE ON FUNCTION is_user_admin(UUID) TO authenticated;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 8. RLS POLICIES
-- ============================================================================

-- ===== USER_PROFILES =====
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all user profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all user profiles" ON user_profiles;

CREATE POLICY "Users can view their own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can view all user profiles" ON user_profiles FOR SELECT USING (is_user_admin(auth.uid()));
CREATE POLICY "Admins can update all user profiles" ON user_profiles FOR UPDATE USING (is_user_admin(auth.uid()));

-- ===== ACCOUNTS =====
DROP POLICY IF EXISTS "Users can view their own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can insert their own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can update their own accounts" ON accounts;
DROP POLICY IF EXISTS "Admins can view all accounts" ON accounts;
DROP POLICY IF EXISTS "Admins can update all accounts" ON accounts;

CREATE POLICY "Users can view their own accounts" ON accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own accounts" ON accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own accounts" ON accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all accounts" ON accounts FOR SELECT USING (is_user_admin(auth.uid()));
CREATE POLICY "Admins can update all accounts" ON accounts FOR UPDATE USING (is_user_admin(auth.uid()));

-- ===== TRANSACTIONS =====
DROP POLICY IF EXISTS "Users can view transactions for their accounts" ON transactions;
DROP POLICY IF EXISTS "Users can insert transactions for their accounts" ON transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON transactions;
DROP POLICY IF EXISTS "Admins can update all transactions" ON transactions;

CREATE POLICY "Users can view transactions for their accounts" ON transactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM accounts WHERE accounts.id = transactions.account_id AND accounts.user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM accounts WHERE accounts.id = transactions.recipient_account_id AND accounts.user_id = auth.uid())
);
CREATE POLICY "Users can insert transactions for their accounts" ON transactions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM accounts WHERE accounts.id = transactions.account_id AND accounts.user_id = auth.uid())
);
CREATE POLICY "Admins can insert transactions" ON transactions FOR INSERT WITH CHECK (is_user_admin(auth.uid()));
CREATE POLICY "Admins can view all transactions" ON transactions FOR SELECT USING (is_user_admin(auth.uid()));
CREATE POLICY "Admins can update all transactions" ON transactions FOR UPDATE USING (is_user_admin(auth.uid()));

-- ===== NOTIFICATIONS =====
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can view all notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can create notifications" ON notifications;

CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all notifications" ON notifications FOR SELECT USING (is_user_admin(auth.uid()));
CREATE POLICY "Admins can create notifications" ON notifications FOR INSERT WITH CHECK (is_user_admin(auth.uid()));

-- ===== KYC SUBMISSIONS =====
DROP POLICY IF EXISTS "Users can view their own KYC submissions" ON kyc_submissions;
DROP POLICY IF EXISTS "Users can create KYC submissions" ON kyc_submissions;
DROP POLICY IF EXISTS "Users can update their own pending submissions" ON kyc_submissions;
DROP POLICY IF EXISTS "Admins can view all KYC submissions" ON kyc_submissions;
DROP POLICY IF EXISTS "Admins can update all KYC submissions" ON kyc_submissions;

CREATE POLICY "Users can view their own KYC submissions" ON kyc_submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create KYC submissions" ON kyc_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own pending submissions" ON kyc_submissions FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');
CREATE POLICY "Admins can view all KYC submissions" ON kyc_submissions FOR SELECT USING (is_user_admin(auth.uid()));
CREATE POLICY "Admins can update all KYC submissions" ON kyc_submissions FOR UPDATE USING (is_user_admin(auth.uid()));

-- ===== CRYPTO WALLETS =====
DROP POLICY IF EXISTS "Anyone can view active crypto wallets" ON crypto_wallets;
DROP POLICY IF EXISTS "Admins can view all crypto wallets" ON crypto_wallets;
DROP POLICY IF EXISTS "Admins can insert crypto wallets" ON crypto_wallets;
DROP POLICY IF EXISTS "Admins can update crypto wallets" ON crypto_wallets;
DROP POLICY IF EXISTS "Admins can delete crypto wallets" ON crypto_wallets;

CREATE POLICY "Anyone can view active crypto wallets" ON crypto_wallets FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can view all crypto wallets" ON crypto_wallets FOR SELECT USING (is_user_admin(auth.uid()));
CREATE POLICY "Admins can insert crypto wallets" ON crypto_wallets FOR INSERT WITH CHECK (is_user_admin(auth.uid()));
CREATE POLICY "Admins can update crypto wallets" ON crypto_wallets FOR UPDATE USING (is_user_admin(auth.uid()));
CREATE POLICY "Admins can delete crypto wallets" ON crypto_wallets FOR DELETE USING (is_user_admin(auth.uid()));

-- ===== DEPOSIT REQUESTS =====
DROP POLICY IF EXISTS "Users can view their own deposit requests" ON deposit_requests;
DROP POLICY IF EXISTS "Users can create deposit requests" ON deposit_requests;
DROP POLICY IF EXISTS "Users can update their own pending requests" ON deposit_requests;
DROP POLICY IF EXISTS "Admins can view all deposit requests" ON deposit_requests;
DROP POLICY IF EXISTS "Admins can update deposit requests" ON deposit_requests;

CREATE POLICY "Users can view their own deposit requests" ON deposit_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create deposit requests" ON deposit_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own pending requests" ON deposit_requests FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');
CREATE POLICY "Admins can view all deposit requests" ON deposit_requests FOR SELECT USING (is_user_admin(auth.uid()));
CREATE POLICY "Admins can update deposit requests" ON deposit_requests FOR UPDATE USING (is_user_admin(auth.uid()));

-- ===== CARD REQUESTS =====
DROP POLICY IF EXISTS "Users can view their own card requests" ON card_requests;
DROP POLICY IF EXISTS "Users can create card requests" ON card_requests;
DROP POLICY IF EXISTS "Users can update their own pending requests" ON card_requests;
DROP POLICY IF EXISTS "Admins can view all card requests" ON card_requests;
DROP POLICY IF EXISTS "Admins can update all card requests" ON card_requests;

CREATE POLICY "Users can view their own card requests" ON card_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create card requests" ON card_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own pending requests" ON card_requests FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');
CREATE POLICY "Admins can view all card requests" ON card_requests FOR SELECT USING (is_user_admin(auth.uid()));
CREATE POLICY "Admins can update all card requests" ON card_requests FOR UPDATE USING (is_user_admin(auth.uid()));

-- ============================================================================
-- 9. TRIGGERS
-- ============================================================================

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
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Profile creation failed for user %: %', NEW.id, SQLERRM;
  END;

  -- Get the Savings account type ID
  SELECT id INTO savings_account_type_id FROM account_types WHERE name = 'Savings' LIMIT 1;
  IF savings_account_type_id IS NULL THEN RETURN NEW; END IF;

  -- Generate unique account number
  LOOP
    account_number_value := 'SAV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD((EXTRACT(EPOCH FROM NOW())::BIGINT % 1000000)::TEXT, 6, '0') || '-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    IF NOT EXISTS (SELECT 1 FROM accounts WHERE account_number = account_number_value) THEN EXIT; END IF;
    attempt_count := attempt_count + 1;
    IF attempt_count >= max_attempts THEN
      account_number_value := 'SAV-' || REPLACE(SUBSTRING(NEW.id::TEXT, 1, 8), '-', '') || '-' || TO_CHAR(EXTRACT(EPOCH FROM NOW())::BIGINT % 100000, 'FM00000');
      EXIT;
    END IF;
  END LOOP;

  -- Create the savings account
  INSERT INTO accounts (user_id, account_type_id, account_number, balance, is_active)
  VALUES (NEW.id, savings_account_type_id, account_number_value, 0.00, TRUE)
  ON CONFLICT (account_number) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Unexpected error in handle_new_user for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

DROP TRIGGER IF EXISTS update_accounts_updated_at ON accounts;
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_kyc_submissions_updated_at ON kyc_submissions;
CREATE TRIGGER update_kyc_submissions_updated_at BEFORE UPDATE ON kyc_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_card_requests_updated_at ON card_requests;
CREATE TRIGGER update_card_requests_updated_at BEFORE UPDATE ON card_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 10. INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_status_type ON transactions(status, transaction_type);
CREATE INDEX IF NOT EXISTS idx_kyc_submissions_user_id ON kyc_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_submissions_status ON kyc_submissions(status);
CREATE INDEX IF NOT EXISTS idx_deposit_requests_user_id ON deposit_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_deposit_requests_status ON deposit_requests(status);
CREATE INDEX IF NOT EXISTS idx_card_requests_user_id ON card_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_card_requests_status ON card_requests(status);

-- ============================================================================
-- 11. DEFAULT DATA
-- ============================================================================

INSERT INTO account_types (name, description) VALUES
  ('Checking', 'Standard checking account'),
  ('Savings', 'Savings account with interest'),
  ('Business', 'Business account')
ON CONFLICT (name) DO NOTHING;

INSERT INTO transaction_categories (name, description) VALUES
  ('Food & Dining', 'Restaurants, groceries, food delivery'),
  ('Transportation', 'Gas, public transport, rideshare'),
  ('Shopping', 'Retail purchases, online shopping'),
  ('Bills & Utilities', 'Rent, utilities, subscriptions'),
  ('Entertainment', 'Movies, games, events'),
  ('Healthcare', 'Medical expenses, pharmacy'),
  ('Income', 'Salary, freelance, refunds')
ON CONFLICT (name) DO NOTHING;
