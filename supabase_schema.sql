
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  account_type TEXT DEFAULT 'standard' CHECK (account_type IN ('standard', 'premium', 'vip')),
  user_role TEXT DEFAULT 'user' CHECK (user_role IN ('user', 'admin', 'super_admin')),
  balance DECIMAL(12,2) DEFAULT 10000.00,
  equity DECIMAL(12,2) DEFAULT 10000.00,
  margin DECIMAL(12,2) DEFAULT 0.00,
  free_margin DECIMAL(12,2) DEFAULT 10000.00,
  kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
  is_affiliate BOOLEAN DEFAULT false,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trading_accounts table for multi-account management
CREATE TABLE IF NOT EXISTS trading_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_number TEXT UNIQUE NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('demo', 'micro', 'standard', 'zero', 'ultra_low')),
  platform TEXT NOT NULL CHECK (platform IN ('MT4', 'MT5', 'WebTrader')),
  currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'EUR', 'GBP', 'JPY', 'AUD')),
  leverage INTEGER DEFAULT 100,
  balance DECIMAL(12,2) DEFAULT 10000.00,
  equity DECIMAL(12,2) DEFAULT 10000.00,
  margin DECIMAL(12,2) DEFAULT 0.00,
  free_margin DECIMAL(12,2) DEFAULT 10000.00,
  is_active BOOLEAN DEFAULT true,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trades table
CREATE TABLE IF NOT EXISTS trades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  trading_account_id UUID REFERENCES trading_accounts(id) ON DELETE CASCADE NOT NULL,
  symbol TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('buy', 'sell')),
  amount DECIMAL(12,2) NOT NULL,
  open_price DECIMAL(12,8) NOT NULL,
  current_price DECIMAL(12,8) NOT NULL,
  leverage INTEGER NOT NULL,
  stop_loss DECIMAL(12,8),
  take_profit DECIMAL(12,8),
  pnl DECIMAL(12,2) DEFAULT 0.00,
  commission DECIMAL(12,2) DEFAULT 0.00,
  swap_charges DECIMAL(12,2) DEFAULT 0.00,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

-- Create affiliate_commissions table
CREATE TABLE IF NOT EXISTS affiliate_commissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  referred_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  commission_type TEXT NOT NULL CHECK (commission_type IN ('signup_bonus', 'revenue_share', 'trading_volume')),
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  trade_id UUID REFERENCES trades(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

-- Create affiliate_payouts table
CREATE TABLE IF NOT EXISTS affiliate_payouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  payment_method TEXT,
  payment_details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Create support_tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ticket_number TEXT UNIQUE NOT NULL,
  subject TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('trading', 'account', 'deposits', 'platform', 'verification', 'other')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_response', 'resolved', 'closed')),
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Create support_messages table
CREATE TABLE IF NOT EXISTS support_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  is_staff BOOLEAN DEFAULT false,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create support_categories table for dynamic categories
CREATE TABLE IF NOT EXISTS support_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_categories ENABLE ROW LEVEL SECURITY;

-- Row Level Security Policies for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Row Level Security Policies for trades
DROP POLICY IF EXISTS "Users can view their own trades" ON trades;
CREATE POLICY "Users can view their own trades" ON trades
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own trades" ON trades;
CREATE POLICY "Users can insert their own trades" ON trades
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own trades" ON trades;
CREATE POLICY "Users can update their own trades" ON trades
  FOR UPDATE USING (auth.uid() = user_id);

-- Trading Accounts Policies
DROP POLICY IF EXISTS "Users can view their own trading accounts" ON trading_accounts;
CREATE POLICY "Users can view their own trading accounts" ON trading_accounts
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own trading accounts" ON trading_accounts;
CREATE POLICY "Users can insert their own trading accounts" ON trading_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own trading accounts" ON trading_accounts;
CREATE POLICY "Users can update their own trading accounts" ON trading_accounts
  FOR UPDATE USING (auth.uid() = user_id);

-- Affiliate Commissions Policies
DROP POLICY IF EXISTS "Affiliates can view their own commissions" ON affiliate_commissions;
CREATE POLICY "Affiliates can view their own commissions" ON affiliate_commissions
  FOR SELECT USING (auth.uid() = affiliate_id);

-- Affiliate Payouts Policies
DROP POLICY IF EXISTS "Affiliates can view their own payouts" ON affiliate_payouts;
CREATE POLICY "Affiliates can view their own payouts" ON affiliate_payouts
  FOR SELECT USING (auth.uid() = affiliate_id);

DROP POLICY IF EXISTS "Affiliates can insert payout requests" ON affiliate_payouts;
CREATE POLICY "Affiliates can insert payout requests" ON affiliate_payouts
  FOR INSERT WITH CHECK (auth.uid() = affiliate_id);

-- Create function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate triggers for updated_at
DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trading_accounts_updated_at ON trading_accounts;
CREATE TRIGGER trading_accounts_updated_at
  BEFORE UPDATE ON trading_accounts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
BEGIN
  RETURN 'XM-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
END;
$$ LANGUAGE plpgsql;

-- Function to create default trading account
CREATE OR REPLACE FUNCTION create_default_trading_account()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO trading_accounts (
    user_id,
    account_number,
    account_type,
    platform,
    is_primary
  ) VALUES (
    NEW.id,
    'XM' || LPAD((RANDOM() * 99999999)::INTEGER::TEXT, 8, '0'),
    'demo',
    'MT5',
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate trigger for default account creation
DROP TRIGGER IF EXISTS create_default_account ON profiles;
CREATE TRIGGER create_default_account
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION create_default_trading_account();

-- Support ticket policies
DROP POLICY IF EXISTS "Users can view their own tickets" ON support_tickets;
CREATE POLICY "Users can view their own tickets" ON support_tickets
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create tickets" ON support_tickets;
CREATE POLICY "Users can create tickets" ON support_tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Staff can view all tickets" ON support_tickets;
CREATE POLICY "Staff can view all tickets" ON support_tickets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Staff can update tickets" ON support_tickets;
CREATE POLICY "Staff can update tickets" ON support_tickets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_role IN ('admin', 'super_admin')
    )
  );

-- Support messages policies
DROP POLICY IF EXISTS "Users can view messages for their tickets" ON support_messages;
CREATE POLICY "Users can view messages for their tickets" ON support_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM support_tickets 
      WHERE id = ticket_id 
      AND user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Users can create messages for their tickets" ON support_messages;
CREATE POLICY "Users can create messages for their tickets" ON support_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    (
      EXISTS (
        SELECT 1 FROM support_tickets 
        WHERE id = ticket_id 
        AND user_id = auth.uid()
      )
      OR
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND user_role IN ('admin', 'super_admin')
      )
    )
  );

-- Function to generate ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'SUP-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
END;
$$ LANGUAGE plpgsql;

-- Function to auto-assign ticket number
CREATE OR REPLACE FUNCTION auto_assign_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_number IS NULL THEN
    NEW.ticket_number := generate_ticket_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for ticket number assignment
DROP TRIGGER IF EXISTS assign_ticket_number ON support_tickets;
CREATE TRIGGER assign_ticket_number
  BEFORE INSERT ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION auto_assign_ticket_number();

-- Add updated_at triggers for support tables
DROP TRIGGER IF EXISTS support_tickets_updated_at ON support_tickets;
CREATE TRIGGER support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert default support categories
INSERT INTO support_categories (name, description, sort_order) VALUES 
  ('Trading Issues', 'Problems with placing or managing trades', 1),
  ('Account Management', 'Account settings, verification, and profile issues', 2),
  ('Deposits & Withdrawals', 'Funding and withdrawal related questions', 3),
  ('Platform Technical Issues', 'Technical problems with the trading platform', 4),
  ('Account Verification', 'KYC and document verification support', 5),
  ('Other', 'General inquiries and other issues', 6)
ON CONFLICT (name) DO NOTHING;

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE trades;
ALTER PUBLICATION supabase_realtime ADD TABLE trading_accounts;
ALTER PUBLICATION supabase_realtime ADD TABLE affiliate_commissions;
ALTER PUBLICATION supabase_realtime ADD TABLE affiliate_payouts;
ALTER PUBLICATION supabase_realtime ADD TABLE support_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE support_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE support_categories;
