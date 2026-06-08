-- Create crypto_wallets table for deposit functionality
-- Admin can upload different crypto wallets with logos for users to copy addresses

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

-- Enable RLS
ALTER TABLE crypto_wallets ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read active crypto wallets (for deposit page)
CREATE POLICY "Anyone can view active crypto wallets"
  ON crypto_wallets
  FOR SELECT
  USING (is_active = true);

-- Policy: Only admins can view all crypto wallets (including inactive)
CREATE POLICY "Admins can view all crypto wallets"
  ON crypto_wallets
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Policy: Only admins can insert crypto wallets
CREATE POLICY "Admins can insert crypto wallets"
  ON crypto_wallets
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Policy: Only admins can update crypto wallets
CREATE POLICY "Admins can update crypto wallets"
  ON crypto_wallets
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Policy: Only admins can delete crypto wallets
CREATE POLICY "Admins can delete crypto wallets"
  ON crypto_wallets
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_crypto_wallets_active ON crypto_wallets(is_active, display_order);

-- Insert some example crypto wallets (optional - can be done via admin panel)
-- INSERT INTO crypto_wallets (name, symbol, wallet_address, network, display_order) VALUES
-- ('Bitcoin', 'BTC', 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', 'Bitcoin', 1),
-- ('Ethereum', 'ETH', '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', 'Ethereum', 2),
-- ('Tether USD', 'USDT', 'TXYZabcdefghijklmnopqrstuvwxyz123456', 'TRC20', 3);

