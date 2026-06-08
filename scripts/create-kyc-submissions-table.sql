-- Create kyc_submissions table for KYC (Know Your Customer) verification
-- Users submit SSN, ID Card, Address, Phone, Email for verification
-- Admin reviews and approves/rejects KYC submissions
-- ID Card images are stored via ImageKit.io

CREATE TABLE IF NOT EXISTS kyc_submissions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ssn VARCHAR(11), -- Format: XXX-XX-XXXX (stored encrypted/hashed in production)
  id_card_front_url TEXT, -- ImageKit.io URL for front of ID card
  id_card_back_url TEXT, -- ImageKit.io URL for back of ID card
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  zip_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL DEFAULT 'United States',
  phone_number VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL, -- User email (should match auth.users.email)
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  admin_notes TEXT, -- Admin can add notes when approving/rejecting
  rejection_reason TEXT, -- Reason for rejection
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id), -- Admin who reviewed
  approved_at TIMESTAMP WITH TIME ZONE -- When KYC was approved
);

-- Enable RLS
ALTER TABLE kyc_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own KYC submissions
CREATE POLICY "Users can view their own KYC submissions"
  ON kyc_submissions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own KYC submissions
CREATE POLICY "Users can create KYC submissions"
  ON kyc_submissions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own pending KYC submissions
CREATE POLICY "Users can update their own pending submissions"
  ON kyc_submissions
  FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can view all KYC submissions
CREATE POLICY "Admins can view all KYC submissions"
  ON kyc_submissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Policy: Admins can update all KYC submissions
CREATE POLICY "Admins can update all KYC submissions"
  ON kyc_submissions
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
CREATE INDEX IF NOT EXISTS idx_kyc_submissions_user_id ON kyc_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_submissions_status ON kyc_submissions(status);
CREATE INDEX IF NOT EXISTS idx_kyc_submissions_created_at ON kyc_submissions(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_kyc_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_kyc_submissions_updated_at
  BEFORE UPDATE ON kyc_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_kyc_submissions_updated_at();

