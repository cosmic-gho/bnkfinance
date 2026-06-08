-- Create card_requests table for users to apply for virtual and physical cards
-- Admin can review and approve/reject these requests
-- System automatically generates dummy CC numbers for admin review

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
  admin_notes TEXT, -- Admin can add notes when approving/rejecting
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id), -- Admin who reviewed
  issued_at TIMESTAMP WITH TIME ZONE -- When card was issued to user
);

-- Enable RLS
ALTER TABLE card_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own card requests
CREATE POLICY "Users can view their own card requests"
  ON card_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own card requests
CREATE POLICY "Users can create card requests"
  ON card_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own pending card requests (to cancel)
CREATE POLICY "Users can update their own pending requests"
  ON card_requests
  FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can view all card requests
CREATE POLICY "Admins can view all card requests"
  ON card_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Policy: Admins can update all card requests
CREATE POLICY "Admins can update all card requests"
  ON card_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_card_requests_user_id ON card_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_card_requests_status ON card_requests(status);
CREATE INDEX IF NOT EXISTS idx_card_requests_account_id ON card_requests(account_id);
CREATE INDEX IF NOT EXISTS idx_card_requests_created_at ON card_requests(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_card_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_card_requests_updated_at
  BEFORE UPDATE ON card_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_card_requests_updated_at();

