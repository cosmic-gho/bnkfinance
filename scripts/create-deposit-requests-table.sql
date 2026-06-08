-- Create deposit_requests table for users to submit crypto deposit proofs
-- Admin can review and approve/reject these requests

CREATE TABLE IF NOT EXISTS deposit_requests (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  crypto_wallet_id INTEGER NOT NULL REFERENCES crypto_wallets(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  crypto_symbol VARCHAR(10) NOT NULL, -- e.g., BTC, ETH, USDT
  transaction_hash TEXT, -- Optional: blockchain transaction hash
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  admin_notes TEXT, -- Admin can add notes when approving/rejecting
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id) -- Admin who reviewed
);

-- Enable RLS
ALTER TABLE deposit_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own deposit requests
CREATE POLICY "Users can view their own deposit requests"
  ON deposit_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own deposit requests
CREATE POLICY "Users can create deposit requests"
  ON deposit_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own pending deposit requests (to cancel)
CREATE POLICY "Users can update their own pending requests"
  ON deposit_requests
  FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can view all deposit requests
CREATE POLICY "Admins can view all deposit requests"
  ON deposit_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Policy: Admins can update deposit requests (approve/reject)
CREATE POLICY "Admins can update deposit requests"
  ON deposit_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_deposit_requests_user_id ON deposit_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_deposit_requests_status ON deposit_requests(status);
CREATE INDEX IF NOT EXISTS idx_deposit_requests_created_at ON deposit_requests(created_at DESC);

