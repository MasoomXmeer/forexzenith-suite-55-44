
-- Admin Panel Database Setup
-- This file contains additional tables and configurations for the admin panel

-- Create markets table for trading pairs management
CREATE TABLE IF NOT EXISTS markets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  base_price DECIMAL(12,8) NOT NULL,
  current_price DECIMAL(12,8) NOT NULL DEFAULT 0,
  spread DECIMAL(6,2) NOT NULL DEFAULT 1.0,
  is_active BOOLEAN DEFAULT true,
  market_hours_start TIME DEFAULT '00:00:00',
  market_hours_end TIME DEFAULT '23:59:59',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create payment methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  provider TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create transactions table for payment tracking
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'commission')),
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  payment_method_id UUID REFERENCES payment_methods(id),
  transaction_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create platform settings table for admin configuration
CREATE TABLE IF NOT EXISTS platform_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Row Level Security Policies

-- Markets table policies
DROP POLICY IF EXISTS "Anyone can view markets" ON markets;
CREATE POLICY "Anyone can view markets" ON markets
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can modify markets" ON markets;
CREATE POLICY "Only admins can modify markets" ON markets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.account_type = 'premium'
    )
  );

-- Payment methods table policies
DROP POLICY IF EXISTS "Anyone can view enabled payment methods" ON payment_methods;
CREATE POLICY "Anyone can view enabled payment methods" ON payment_methods
  FOR SELECT USING (is_enabled = true);

DROP POLICY IF EXISTS "Only admins can modify payment methods" ON payment_methods;
CREATE POLICY "Only admins can modify payment methods" ON payment_methods
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.account_type = 'premium'
    )
  );

-- Transactions table policies
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own transactions" ON transactions;
CREATE POLICY "Users can insert their own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all transactions" ON transactions;
CREATE POLICY "Admins can view all transactions" ON transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.account_type = 'premium'
    )
  );

-- Platform settings policies
DROP POLICY IF EXISTS "Only admins can access platform settings" ON platform_settings;
CREATE POLICY "Only admins can access platform settings" ON platform_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.account_type = 'premium'
    )
  );

-- Triggers for updated_at timestamps
DROP TRIGGER IF EXISTS markets_updated_at ON markets;
CREATE TRIGGER markets_updated_at
  BEFORE UPDATE ON markets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS payment_methods_updated_at ON payment_methods;
CREATE TRIGGER payment_methods_updated_at
  BEFORE UPDATE ON payment_methods
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS transactions_updated_at ON transactions;
CREATE TRIGGER transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS platform_settings_updated_at ON platform_settings;
CREATE TRIGGER platform_settings_updated_at
  BEFORE UPDATE ON platform_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable realtime for admin tables
ALTER PUBLICATION supabase_realtime ADD TABLE markets;
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;

-- Insert default platform settings using the unique 'key' column
INSERT INTO platform_settings (key, value, description) 
SELECT * FROM (VALUES
  ('commission_rate', '0.1', 'Commission rate percentage'),
  ('minimum_deposit', '100', 'Minimum deposit amount in USD'),
  ('maximum_leverage', '1:500', 'Maximum leverage allowed'),
  ('spread_multiplier', '1.0', 'Spread multiplier for pricing'),
  ('kyc_required', 'true', 'Whether KYC verification is required'),
  ('maintenance_mode', 'false', 'Platform maintenance mode status')
) AS v(key, value, description)
WHERE NOT EXISTS (
  SELECT 1 FROM platform_settings WHERE platform_settings.key = v.key
);

-- Insert default payment methods using the unique 'name' column
INSERT INTO payment_methods (name, provider, is_enabled, configuration)
SELECT * FROM (VALUES
  ('Credit Card', 'Stripe', true, '{"supported_currencies": ["USD", "EUR", "GBP"]}'::jsonb),
  ('Bank Transfer', 'Manual', true, '{"processing_time": "1-3 business days"}'::jsonb),
  ('PayPal', 'PayPal API', false, '{"sandbox_mode": true}'::jsonb),
  ('Cryptocurrency', 'Coinbase', false, '{"supported_coins": ["BTC", "ETH", "USDC"]}'::jsonb)
) AS v(name, provider, is_enabled, configuration)
WHERE NOT EXISTS (
  SELECT 1 FROM payment_methods WHERE payment_methods.name = v.name
);

-- Insert default market data using the unique 'symbol' column
INSERT INTO markets (symbol, name, base_price, current_price, spread, is_active)
SELECT * FROM (VALUES
  ('EUR/USD', 'Euro / US Dollar', 1.0847, 1.0847, 0.8, true),
  ('GBP/USD', 'British Pound / US Dollar', 1.2634, 1.2634, 1.2, true),
  ('USD/JPY', 'US Dollar / Japanese Yen', 149.87, 149.87, 0.5, true),
  ('USD/CHF', 'US Dollar / Swiss Franc', 0.8756, 0.8756, 1.1, true),
  ('AUD/USD', 'Australian Dollar / US Dollar', 0.6543, 0.6543, 1.5, true),
  ('USD/CAD', 'US Dollar / Canadian Dollar', 1.3789, 1.3789, 1.3, true),
  ('NZD/USD', 'New Zealand Dollar / US Dollar', 0.5987, 0.5987, 1.8, false),
  ('EUR/GBP', 'Euro / British Pound', 0.8589, 0.8589, 1.4, true)
) AS v(symbol, name, base_price, current_price, spread, is_active)
WHERE NOT EXISTS (
  SELECT 1 FROM markets WHERE markets.symbol = v.symbol
);

-- Function to get real-time statistics for admin dashboard
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS TABLE(
  total_users BIGINT,
  active_trades BIGINT,
  total_volume DECIMAL,
  total_commission DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM profiles) as total_users,
    (SELECT COUNT(*) FROM trades WHERE status = 'open') as active_trades,
    (SELECT COALESCE(SUM(amount), 0) FROM trades) as total_volume,
    (SELECT COALESCE(SUM(amount * 0.001), 0) FROM trades WHERE status = 'closed') as total_commission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update market prices (for demo purposes)
CREATE OR REPLACE FUNCTION update_market_prices()
RETURNS void AS $$
BEGIN
  UPDATE markets 
  SET 
    current_price = base_price + (random() - 0.5) * base_price * 0.02,
    updated_at = NOW()
  WHERE is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
