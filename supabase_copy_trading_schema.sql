-- Copy Trading Schema Extensions
-- Add this to your existing database setup

-- Create copy_traders table for trader applications
CREATE TABLE IF NOT EXISTS copy_traders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  trader_name TEXT NOT NULL,
  description TEXT,
  trading_strategy TEXT,
  risk_level INTEGER DEFAULT 5 CHECK (risk_level BETWEEN 1 AND 10),
  minimum_investment DECIMAL(12,2) DEFAULT 100.00,
  maximum_investment DECIMAL(12,2) DEFAULT 10000.00,
  profit_share_percentage DECIMAL(5,2) DEFAULT 10.00,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  performance_return_1m DECIMAL(8,2) DEFAULT 0.00,
  performance_return_3m DECIMAL(8,2) DEFAULT 0.00,
  performance_return_1y DECIMAL(8,2) DEFAULT 0.00,
  win_rate DECIMAL(5,2) DEFAULT 0.00,
  max_drawdown DECIMAL(8,2) DEFAULT 0.00,
  total_followers INTEGER DEFAULT 0,
  total_copiers INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create copy_relationships table for copy trading connections
CREATE TABLE IF NOT EXISTS copy_relationships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  copier_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  trader_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  allocated_amount DECIMAL(12,2) NOT NULL,
  copy_ratio DECIMAL(5,2) DEFAULT 100.00, -- Percentage of trader's position to copy
  max_risk_percentage DECIMAL(5,2) DEFAULT 10.00,
  follow_stop_loss BOOLEAN DEFAULT true,
  follow_take_profit BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'stopped')),
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  total_profit_loss DECIMAL(12,2) DEFAULT 0.00,
  current_value DECIMAL(12,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(copier_user_id, trader_user_id)
);

-- Create copy_trades table for tracking copied trades
CREATE TABLE IF NOT EXISTS copy_trades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  copy_relationship_id UUID REFERENCES copy_relationships(id) ON DELETE CASCADE NOT NULL,
  original_trade_id UUID REFERENCES trades(id) ON DELETE CASCADE NOT NULL,
  copied_trade_id UUID REFERENCES trades(id) ON DELETE CASCADE NOT NULL,
  copy_ratio DECIMAL(5,2) NOT NULL,
  original_amount DECIMAL(12,2) NOT NULL,
  copied_amount DECIMAL(12,2) NOT NULL,
  profit_share_amount DECIMAL(12,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trader_performance_history for tracking trader stats
CREATE TABLE IF NOT EXISTS trader_performance_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trader_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  daily_return DECIMAL(8,4) DEFAULT 0.00,
  total_trades INTEGER DEFAULT 0,
  winning_trades INTEGER DEFAULT 0,
  portfolio_value DECIMAL(12,2) DEFAULT 0.00,
  followers_count INTEGER DEFAULT 0,
  copiers_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trader_user_id, date)
);

-- Create profit_sharing_transactions for 10% profit distribution
CREATE TABLE IF NOT EXISTS profit_sharing_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  copy_relationship_id UUID REFERENCES copy_relationships(id) ON DELETE CASCADE NOT NULL,
  trader_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  copier_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  trade_id UUID REFERENCES trades(id) ON DELETE CASCADE NOT NULL,
  profit_amount DECIMAL(12,2) NOT NULL,
  sharing_percentage DECIMAL(5,2) DEFAULT 10.00,
  trader_share DECIMAL(12,2) NOT NULL,
  transaction_date TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE copy_traders ENABLE ROW LEVEL SECURITY;
ALTER TABLE copy_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE copy_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE trader_performance_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE profit_sharing_transactions ENABLE ROW LEVEL SECURITY;

-- Copy Traders Policies
CREATE POLICY "Users can view approved copy traders" ON copy_traders
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Users can apply to become copy traders" ON copy_traders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trader profile" ON copy_traders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admin can manage all copy traders" ON copy_traders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_role IN ('admin', 'super_admin')
    )
  );

-- Copy Relationships Policies
CREATE POLICY "Users can view their own copy relationships" ON copy_relationships
  FOR SELECT USING (auth.uid() = copier_user_id OR auth.uid() = trader_user_id);

CREATE POLICY "Users can create copy relationships as copier" ON copy_relationships
  FOR INSERT WITH CHECK (auth.uid() = copier_user_id);

CREATE POLICY "Users can update their own copy relationships" ON copy_relationships
  FOR UPDATE USING (auth.uid() = copier_user_id);

-- Copy Trades Policies
CREATE POLICY "Users can view copy trades they're involved in" ON copy_trades
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM copy_relationships cr
      WHERE cr.id = copy_relationship_id
      AND (cr.copier_user_id = auth.uid() OR cr.trader_user_id = auth.uid())
    )
  );

-- Trader Performance Policies
CREATE POLICY "Public can view trader performance" ON trader_performance_history
  FOR SELECT USING (true);

CREATE POLICY "Traders can insert their own performance" ON trader_performance_history
  FOR INSERT WITH CHECK (auth.uid() = trader_user_id);

-- Profit Sharing Policies
CREATE POLICY "Users can view their own profit sharing" ON profit_sharing_transactions
  FOR SELECT USING (
    auth.uid() = trader_user_id OR auth.uid() = copier_user_id
  );

-- Functions for copy trading automation

-- Function to automatically copy trades
CREATE OR REPLACE FUNCTION auto_copy_trade()
RETURNS TRIGGER AS $$
DECLARE
  copy_rel RECORD;
  copied_amount DECIMAL(12,2);
  new_trade_id UUID;
BEGIN
  -- Only copy open trades
  IF NEW.status != 'open' THEN
    RETURN NEW;
  END IF;

  -- Find all active copy relationships for this trader
  FOR copy_rel IN 
    SELECT * FROM copy_relationships 
    WHERE trader_user_id = NEW.user_id 
    AND status = 'active'
  LOOP
    -- Calculate copied amount based on copy ratio
    copied_amount := NEW.amount * (copy_rel.copy_ratio / 100.0);
    
    -- Check if copier has sufficient funds
    IF copied_amount <= (
      SELECT free_margin FROM trading_accounts 
      WHERE user_id = copy_rel.copier_user_id 
      AND is_primary = true 
      LIMIT 1
    ) THEN
      -- Create copied trade
      INSERT INTO trades (
        user_id,
        trading_account_id,
        symbol,
        type,
        amount,
        open_price,
        current_price,
        leverage,
        stop_loss,
        take_profit,
        status
      )
      SELECT 
        copy_rel.copier_user_id,
        ta.id,
        NEW.symbol,
        NEW.type,
        copied_amount,
        NEW.open_price,
        NEW.current_price,
        NEW.leverage,
        CASE WHEN copy_rel.follow_stop_loss THEN NEW.stop_loss ELSE NULL END,
        CASE WHEN copy_rel.follow_take_profit THEN NEW.take_profit ELSE NULL END,
        'open'
      FROM trading_accounts ta
      WHERE ta.user_id = copy_rel.copier_user_id 
      AND ta.is_primary = true
      RETURNING id INTO new_trade_id;
      
      -- Record the copy relationship
      INSERT INTO copy_trades (
        copy_relationship_id,
        original_trade_id,
        copied_trade_id,
        copy_ratio,
        original_amount,
        copied_amount
      ) VALUES (
        copy_rel.id,
        NEW.id,
        new_trade_id,
        copy_rel.copy_ratio,
        NEW.amount,
        copied_amount
      );
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for auto-copying trades
CREATE TRIGGER auto_copy_trades_trigger
  AFTER INSERT ON trades
  FOR EACH ROW EXECUTE FUNCTION auto_copy_trade();

-- Function to calculate and distribute profit sharing
CREATE OR REPLACE FUNCTION process_profit_sharing()
RETURNS TRIGGER AS $$
DECLARE
  copy_trade_rec RECORD;
  profit_share DECIMAL(12,2);
  trader_share DECIMAL(12,2);
BEGIN
  -- Only process when trade is closed and profitable
  IF NEW.status = 'closed' AND NEW.pnl > 0 THEN
    -- Find if this is a copied trade
    SELECT ct.*, cr.trader_user_id, cr.copier_user_id, ct_rel.profit_share_percentage
    INTO copy_trade_rec
    FROM copy_trades ct
    JOIN copy_relationships cr ON ct.copy_relationship_id = cr.id
    JOIN copy_traders ct_rel ON cr.trader_user_id = ct_rel.user_id
    WHERE ct.copied_trade_id = NEW.id;
    
    IF FOUND THEN
      -- Calculate profit sharing (10% to trader)
      profit_share := NEW.pnl * (copy_trade_rec.profit_share_percentage / 100.0);
      trader_share := profit_share;
      
      -- Record profit sharing transaction
      INSERT INTO profit_sharing_transactions (
        copy_relationship_id,
        trader_user_id,
        copier_user_id,
        trade_id,
        profit_amount,
        sharing_percentage,
        trader_share,
        status
      ) VALUES (
        copy_trade_rec.copy_relationship_id,
        copy_trade_rec.trader_user_id,
        copy_trade_rec.copier_user_id,
        NEW.id,
        NEW.pnl,
        copy_trade_rec.profit_share_percentage,
        trader_share,
        'pending'
      );
      
      -- Update trader's balance (add profit share)
      UPDATE trading_accounts 
      SET balance = balance + trader_share
      WHERE user_id = copy_trade_rec.trader_user_id 
      AND is_primary = true;
      
      -- Update copier's balance (deduct profit share)
      UPDATE trading_accounts 
      SET balance = balance - trader_share
      WHERE user_id = copy_trade_rec.copier_user_id 
      AND is_primary = true;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for profit sharing
CREATE TRIGGER profit_sharing_trigger
  AFTER UPDATE ON trades
  FOR EACH ROW EXECUTE FUNCTION process_profit_sharing();

-- Add updated_at triggers
CREATE TRIGGER copy_traders_updated_at
  BEFORE UPDATE ON copy_traders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER copy_relationships_updated_at
  BEFORE UPDATE ON copy_relationships
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable realtime for copy trading tables
ALTER PUBLICATION supabase_realtime ADD TABLE copy_traders;
ALTER PUBLICATION supabase_realtime ADD TABLE copy_relationships;
ALTER PUBLICATION supabase_realtime ADD TABLE copy_trades;
ALTER PUBLICATION supabase_realtime ADD TABLE trader_performance_history;
ALTER PUBLICATION supabase_realtime ADD TABLE profit_sharing_transactions;