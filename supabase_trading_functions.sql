-- SQL Functions for Trading Logic

-- Function to update account after opening a trade
CREATE OR REPLACE FUNCTION update_account_after_trade(
  p_account_id UUID,
  p_margin_change DECIMAL,
  p_commission DECIMAL
)
RETURNS VOID AS $$
BEGIN
  UPDATE trading_accounts
  SET 
    margin = margin + p_margin_change,
    free_margin = free_margin - p_margin_change,
    balance = balance - p_commission,
    equity = balance + COALESCE((
      SELECT SUM(pnl) 
      FROM trades 
      WHERE trading_account_id = p_account_id 
      AND status = 'open'
    ), 0)
  WHERE id = p_account_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update account after closing a position
CREATE OR REPLACE FUNCTION close_position_update_account(
  p_account_id UUID,
  p_margin_release DECIMAL,
  p_pnl DECIMAL
)
RETURNS VOID AS $$
BEGIN
  UPDATE trading_accounts
  SET 
    margin = margin - p_margin_release,
    free_margin = free_margin + p_margin_release,
    balance = balance + p_pnl,
    equity = balance + COALESCE((
      SELECT SUM(pnl) 
      FROM trades 
      WHERE trading_account_id = p_account_id 
      AND status = 'open'
    ), 0)
  WHERE id = p_account_id;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate account equity
CREATE OR REPLACE FUNCTION calculate_account_equity(p_account_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_balance DECIMAL;
  v_open_pnl DECIMAL;
BEGIN
  SELECT balance INTO v_balance
  FROM trading_accounts
  WHERE id = p_account_id;
  
  SELECT COALESCE(SUM(pnl), 0) INTO v_open_pnl
  FROM trades
  WHERE trading_account_id = p_account_id
  AND status = 'open';
  
  RETURN v_balance + v_open_pnl;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update account equity on trade changes
CREATE OR REPLACE FUNCTION update_account_equity_trigger()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE trading_accounts
  SET equity = calculate_account_equity(NEW.trading_account_id)
  WHERE id = NEW.trading_account_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trades_update_equity
AFTER INSERT OR UPDATE OR DELETE ON trades
FOR EACH ROW
EXECUTE FUNCTION update_account_equity_trigger();

-- Add margin field to trades table if not exists
ALTER TABLE trades 
ADD COLUMN IF NOT EXISTS margin DECIMAL DEFAULT 0;

ALTER TABLE trades 
ADD COLUMN IF NOT EXISTS commission DECIMAL DEFAULT 0;

ALTER TABLE trades 
ADD COLUMN IF NOT EXISTS swap DECIMAL DEFAULT 0;

ALTER TABLE trades 
ADD COLUMN IF NOT EXISTS close_reason VARCHAR(20);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_trades_status_account 
ON trades(trading_account_id, status);

CREATE INDEX IF NOT EXISTS idx_trades_symbol_status 
ON trades(symbol, status);