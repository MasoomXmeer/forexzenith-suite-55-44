-- Additional tables for admin functionality

-- Create markets table
CREATE TABLE IF NOT EXISTS markets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  base_price DECIMAL(12,8) NOT NULL,
  current_price DECIMAL(12,8) NOT NULL,
  spread DECIMAL(10,2) DEFAULT 1.0,
  is_active BOOLEAN DEFAULT true,
  market_hours_start TIME DEFAULT '00:00:00',
  market_hours_end TIME DEFAULT '23:59:59',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create transactions table
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

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create platform_settings table
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
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Markets Policies
CREATE POLICY "Public can view active markets" ON markets
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin can manage markets" ON markets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_role IN ('admin', 'super_admin')
    )
  );

-- Transactions Policies
CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can view all transactions" ON transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admin can update transactions" ON transactions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_role IN ('admin', 'super_admin')
    )
  );

-- Payment Methods Policies
CREATE POLICY "Public can view enabled payment methods" ON payment_methods
  FOR SELECT USING (is_enabled = true);

CREATE POLICY "Admin can manage payment methods" ON payment_methods
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_role IN ('admin', 'super_admin')
    )
  );

-- Platform Settings Policies
CREATE POLICY "Admin can view settings" ON platform_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admin can manage settings" ON platform_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_role IN ('admin', 'super_admin')
    )
  );

-- Add triggers for updated_at
CREATE TRIGGER markets_updated_at
  BEFORE UPDATE ON markets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER payment_methods_updated_at
  BEFORE UPDATE ON payment_methods
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER platform_settings_updated_at
  BEFORE UPDATE ON platform_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert default payment methods
INSERT INTO payment_methods (name, provider, is_enabled) VALUES 
  ('Bank Transfer', 'bank_transfer', true),
  ('Credit Card', 'stripe', true),
  ('Cryptocurrency', 'crypto', true),
  ('E-Wallet', 'ewallet', true)
ON CONFLICT DO NOTHING;

-- Insert default platform settings
INSERT INTO platform_settings (key, value, description) VALUES 
  ('maintenance_mode', 'false', 'Enable maintenance mode'),
  ('allow_new_registrations', 'true', 'Allow new user registrations'),
  ('default_leverage', '1:100', 'Default leverage for new accounts'),
  ('minimum_deposit', '100', 'Minimum deposit amount in USD'),
  ('commission_rate', '0.001', 'Trading commission rate')
ON CONFLICT (key) DO NOTHING;

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE markets;
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE payment_methods;
ALTER PUBLICATION supabase_realtime ADD TABLE platform_settings;