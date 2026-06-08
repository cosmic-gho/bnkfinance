-- ============================================================================
-- COMPLETE DATABASE SCHEMA FOR BNK Finance Bank
-- ============================================================================
-- This file combines all database schema definitions into a single comprehensive
-- schema file that can be run to set up the entire database from scratch.
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
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Accounts table (references auth.users)
-- Note: user_profiles.id references auth.users(id), so accounts are automatically
-- linked to user_profiles through the shared user_id reference to auth.users
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

-- KYC Submissions table for Know Your Customer verification
CREATE TABLE IF NOT EXISTS kyc_submissions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ssn VARCHAR(11), -- Format: XXX-XX-XXXX (should be encrypted/hashed in production)
  id_card_front_url TEXT, -- ImageKit.io URL for front of ID card
  id_card_back_url TEXT, -- ImageKit.io URL for back of ID card
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  zip_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL DEFAULT 'United States',
  phone_number VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL, -- Should match auth.users.email
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  admin_notes TEXT, -- Admin notes when approving/rejecting
  rejection_reason TEXT, -- Reason for rejection
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id), -- Admin who reviewed
  approved_at TIMESTAMP WITH TIME ZONE -- When KYC was approved
);

-- Crypto Wallets table for deposit functionality
CREATE TABLE IF NOT EXISTS crypto_wallets (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL, -- e.g., "Bitcoin", "Ethereum", "USDT"
  symbol VARCHAR(10) NOT NULL, -- e.g., "BTC", "ETH", "USDT"
  wallet_address TEXT NOT NULL, -- The crypto wallet address
  logo_url TEXT, -- URL to the crypto logo image
  network VARCHAR(50), -- e.g., "Bitcoin", "Ethereum", "TRC20", "BEP20"
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0, -- Order for display on deposit page
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deposit Requests table for users to submit crypto deposit proofs
CREATE TABLE IF NOT EXISTS deposit_requests (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  crypto_wallet_id INTEGER NOT NULL REFERENCES crypto_wallets(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  crypto_symbol VARCHAR(10) NOT NULL, -- e.g., BTC, ETH, USDT
  transaction_hash TEXT, -- Optional: blockchain transaction hash
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  admin_notes TEXT, -- Admin notes when approving/rejecting
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id) -- Admin who reviewed
);

-- Card Requests table for users to apply for virtual and physical cards
CREATE TABLE IF NOT EXISTS card_requests (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  card_type VARCHAR(20) NOT NULL CHECK (card_type IN ('virtual', 'physical')),
  card_tier VARCHAR(20) CHECK (card_tier IN ('standard', 'gold', 'platinum')),
  card_number VARCHAR(19), -- Generated dummy CC number (format: XXXX XXXX XXXX XXXX)
  expiry_month VARCHAR(2), -- MM format
  expiry_year VARCHAR(4), -- YYYY format
  cvv VARCHAR(3), -- 3-digit CVV
  card_holder_name TEXT, -- Name to emboss on card
  daily_limit DECIMAL(15, 2), -- Daily spending limit
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'issued')),
  admin_notes TEXT, -- Admin notes when approving/rejecting
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id), -- Admin who reviewed
  issued_at TIMESTAMP WITH TIME ZONE -- When card was issued to user
);

-- ============================================================================
-- 5. COMMENTS ON COLUMNS
-- ============================================================================

COMMENT ON COLUMN user_profiles.profile_picture IS 'ImageKit.io URL for user profile picture';
COMMENT ON COLUMN user_profiles.transfer_pin IS 'Hashed 4-digit PIN for local and wire transfers. Set by admin.';

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

-- Function to update updated_at timestamp (generic)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update KYC submissions updated_at
CREATE OR REPLACE FUNCTION update_kyc_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update card requests updated_at
CREATE OR REPLACE FUNCTION update_card_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- ============================================================================
-- 8. TRIGGERS
-- ============================================================================

-- Trigger to create profile on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

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

-- Trigger for KYC submissions updated_at
DROP TRIGGER IF EXISTS update_kyc_submissions_updated_at ON kyc_submissions;
CREATE TRIGGER update_kyc_submissions_updated_at
  BEFORE UPDATE ON kyc_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_kyc_submissions_updated_at();

-- Trigger for card requests updated_at
DROP TRIGGER IF EXISTS update_card_requests_updated_at ON card_requests;
CREATE TRIGGER update_card_requests_updated_at
  BEFORE UPDATE ON card_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_card_requests_updated_at();

-- ============================================================================
-- 9. INDEXES
-- ============================================================================

-- Transactions indexes
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_status_type ON transactions(status, transaction_type);

-- KYC submissions indexes
CREATE INDEX IF NOT EXISTS idx_kyc_submissions_user_id ON kyc_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_submissions_status ON kyc_submissions(status);
CREATE INDEX IF NOT EXISTS idx_kyc_submissions_created_at ON kyc_submissions(created_at DESC);

-- Deposit requests indexes
CREATE INDEX IF NOT EXISTS idx_deposit_requests_user_id ON deposit_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_deposit_requests_status ON deposit_requests(status);
CREATE INDEX IF NOT EXISTS idx_deposit_requests_created_at ON deposit_requests(created_at DESC);

-- Card requests indexes
CREATE INDEX IF NOT EXISTS idx_card_requests_user_id ON card_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_card_requests_status ON card_requests(status);
CREATE INDEX IF NOT EXISTS idx_card_requests_account_id ON card_requests(account_id);
CREATE INDEX IF NOT EXISTS idx_card_requests_created_at ON card_requests(created_at DESC);

-- Crypto wallets indexes
CREATE INDEX IF NOT EXISTS idx_crypto_wallets_active ON crypto_wallets(is_active, display_order);

-- ============================================================================
-- 10. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- ===== USER_PROFILES POLICIES =====

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all user profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all user profiles" ON user_profiles;

-- User policies
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Admin policies
CREATE POLICY "Admins can view all user profiles"
  ON user_profiles FOR SELECT
  USING (is_user_admin(auth.uid()));

CREATE POLICY "Admins can update all user profiles"
  ON user_profiles FOR UPDATE
  USING (is_user_admin(auth.uid()));

-- ===== ACCOUNTS POLICIES =====

DROP POLICY IF EXISTS "Users can view their own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can insert their own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can update their own accounts" ON accounts;
DROP POLICY IF EXISTS "Admins can view all accounts" ON accounts;
DROP POLICY IF EXISTS "Admins can update all accounts" ON accounts;

CREATE POLICY "Users can view their own accounts"
  ON accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own accounts"
  ON accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts"
  ON accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all accounts"
  ON accounts FOR SELECT
  USING (is_user_admin(auth.uid()));

CREATE POLICY "Admins can update all accounts"
  ON accounts FOR UPDATE
  USING (is_user_admin(auth.uid()));

-- ===== TRANSACTIONS POLICIES =====

DROP POLICY IF EXISTS "Users can view transactions for their accounts" ON transactions;
DROP POLICY IF EXISTS "Users can insert transactions for their accounts" ON transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON transactions;
DROP POLICY IF EXISTS "Admins can update all transactions" ON transactions;

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

CREATE POLICY "Users can insert transactions for their accounts"
  ON transactions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM accounts 
      WHERE accounts.id = transactions.account_id 
      AND accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all transactions"
  ON transactions FOR SELECT
  USING (is_user_admin(auth.uid()));

CREATE POLICY "Admins can update all transactions"
  ON transactions FOR UPDATE
  USING (is_user_admin(auth.uid()));

-- ===== NOTIFICATIONS POLICIES =====

DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can view all notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can create notifications" ON notifications;

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all notifications"
  ON notifications FOR SELECT
  USING (is_user_admin(auth.uid()));

CREATE POLICY "Admins can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (is_user_admin(auth.uid()));

-- ===== KYC SUBMISSIONS POLICIES =====

DROP POLICY IF EXISTS "Users can view their own KYC submissions" ON kyc_submissions;
DROP POLICY IF EXISTS "Users can create KYC submissions" ON kyc_submissions;
DROP POLICY IF EXISTS "Users can update their own pending submissions" ON kyc_submissions;
DROP POLICY IF EXISTS "Admins can view all KYC submissions" ON kyc_submissions;
DROP POLICY IF EXISTS "Admins can update all KYC submissions" ON kyc_submissions;

CREATE POLICY "Users can view their own KYC submissions"
  ON kyc_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create KYC submissions"
  ON kyc_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending submissions"
  ON kyc_submissions FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all KYC submissions"
  ON kyc_submissions FOR SELECT
  USING (is_user_admin(auth.uid()));

CREATE POLICY "Admins can update all KYC submissions"
  ON kyc_submissions FOR UPDATE
  USING (is_user_admin(auth.uid()))
  WITH CHECK (is_user_admin(auth.uid()));

-- ===== CRYPTO WALLETS POLICIES =====

DROP POLICY IF EXISTS "Anyone can view active crypto wallets" ON crypto_wallets;
DROP POLICY IF EXISTS "Admins can view all crypto wallets" ON crypto_wallets;
DROP POLICY IF EXISTS "Admins can insert crypto wallets" ON crypto_wallets;
DROP POLICY IF EXISTS "Admins can update crypto wallets" ON crypto_wallets;
DROP POLICY IF EXISTS "Admins can delete crypto wallets" ON crypto_wallets;

CREATE POLICY "Anyone can view active crypto wallets"
  ON crypto_wallets FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can view all crypto wallets"
  ON crypto_wallets FOR SELECT
  USING (is_user_admin(auth.uid()));

CREATE POLICY "Admins can insert crypto wallets"
  ON crypto_wallets FOR INSERT
  WITH CHECK (is_user_admin(auth.uid()));

CREATE POLICY "Admins can update crypto wallets"
  ON crypto_wallets FOR UPDATE
  USING (is_user_admin(auth.uid()));

CREATE POLICY "Admins can delete crypto wallets"
  ON crypto_wallets FOR DELETE
  USING (is_user_admin(auth.uid()));

-- ===== DEPOSIT REQUESTS POLICIES =====

DROP POLICY IF EXISTS "Users can view their own deposit requests" ON deposit_requests;
DROP POLICY IF EXISTS "Users can create deposit requests" ON deposit_requests;
DROP POLICY IF EXISTS "Users can update their own pending requests" ON deposit_requests;
DROP POLICY IF EXISTS "Admins can view all deposit requests" ON deposit_requests;
DROP POLICY IF EXISTS "Admins can update deposit requests" ON deposit_requests;

CREATE POLICY "Users can view their own deposit requests"
  ON deposit_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create deposit requests"
  ON deposit_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending requests"
  ON deposit_requests FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all deposit requests"
  ON deposit_requests FOR SELECT
  USING (is_user_admin(auth.uid()));

CREATE POLICY "Admins can update deposit requests"
  ON deposit_requests FOR UPDATE
  USING (is_user_admin(auth.uid()));

-- ===== CARD REQUESTS POLICIES =====

DROP POLICY IF EXISTS "Users can view their own card requests" ON card_requests;
DROP POLICY IF EXISTS "Users can create card requests" ON card_requests;
DROP POLICY IF EXISTS "Users can update their own pending requests" ON card_requests;
DROP POLICY IF EXISTS "Admins can view all card requests" ON card_requests;
DROP POLICY IF EXISTS "Admins can update all card requests" ON card_requests;

CREATE POLICY "Users can view their own card requests"
  ON card_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create card requests"
  ON card_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending requests"
  ON card_requests FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all card requests"
  ON card_requests FOR SELECT
  USING (is_user_admin(auth.uid()));

CREATE POLICY "Admins can update all card requests"
  ON card_requests FOR UPDATE
  USING (is_user_admin(auth.uid()))
  WITH CHECK (is_user_admin(auth.uid()));

-- ============================================================================
-- 11. DEFAULT DATA
-- ============================================================================

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

-- ============================================================================
-- 12. OPTIONAL: ADDITIONAL RELATIONSHIPS FOR POSTGREST AUTO-DETECTION
-- ============================================================================
-- 
-- If you want better Supabase PostgREST auto-detection of relationships,
-- you can optionally add an additional foreign key from accounts.user_id 
-- to user_profiles.id. This is technically redundant since both reference 
-- auth.users(id), but can help PostgREST understand the relationship better.
--
-- Uncomment the following if needed:
--
-- DO $$
-- BEGIN
--   IF NOT EXISTS (
--     SELECT 1 
--     FROM information_schema.table_constraints 
--     WHERE constraint_name = 'accounts_user_id_user_profiles_fkey'
--     AND table_name = 'accounts'
--   ) THEN
--     ALTER TABLE accounts
--     ADD CONSTRAINT accounts_user_id_user_profiles_fkey
--     FOREIGN KEY (user_id) 
--     REFERENCES user_profiles(id) 
--     ON DELETE CASCADE;
--   END IF;
-- END $$;
--

-- ============================================================================
-- SCHEMA SETUP COMPLETE
-- ============================================================================
-- 
-- After running this schema:
-- 1. Create your first admin user by running:
--    UPDATE user_profiles SET is_admin = TRUE WHERE id = 'your-user-uuid';
-- 
-- 2. Set up environment variables in your .env.local:
--    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
--    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
-- 
-- 3. Optional: Add crypto wallets via admin panel or SQL:
--    INSERT INTO crypto_wallets (name, symbol, wallet_address, network, display_order)
--    VALUES ('Bitcoin', 'BTC', 'your-btc-address', 'Bitcoin', 1);
-- 
-- 4. The schema includes:
--    - All core tables (user_profiles, accounts, transactions, notifications)
--    - Feature tables (kyc_submissions, deposit_requests, card_requests, crypto_wallets)
--    - Row Level Security (RLS) policies for all tables
--    - Admin helper functions and policies
--    - Automatic profile and account creation on user signup
--    - All necessary indexes for performance
--    - Default account types and transaction categories
-- 
-- ============================================================================
