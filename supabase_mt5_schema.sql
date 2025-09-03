-- MT5 Integration Schema
-- Run this in your Supabase SQL editor to set up the required tables

-- Table to store MT5 connection configurations
CREATE TABLE IF NOT EXISTS mt5_connections (
    id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL,
    server TEXT NOT NULL,
    is_demo BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'disconnected',
    connected_at TIMESTAMP WITH TIME ZONE,
    last_heartbeat TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table to store real-time market data (optional, for caching)
CREATE TABLE IF NOT EXISTS mt5_market_data (
    id SERIAL PRIMARY KEY,
    symbol TEXT NOT NULL,
    bid DECIMAL(10,5) NOT NULL,
    ask DECIMAL(10,5) NOT NULL,
    spread DECIMAL(10,5),
    volume INTEGER,
    timestamp BIGINT NOT NULL,
    source TEXT DEFAULT 'mt5',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table to store symbol configurations
CREATE TABLE IF NOT EXISTS mt5_symbols (
    symbol TEXT PRIMARY KEY,
    description TEXT,
    category TEXT DEFAULT 'Forex',
    digits INTEGER DEFAULT 5,
    contract_size INTEGER DEFAULT 100000,
    margin_required DECIMAL(5,2) DEFAULT 0.5,
    base_spread DECIMAL(5,1) DEFAULT 1.0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default symbols
INSERT INTO mt5_symbols (symbol, description, category, digits, contract_size, base_spread) VALUES
('EURUSD', 'Euro vs US Dollar', 'Forex', 5, 100000, 1.5),
('GBPUSD', 'British Pound vs US Dollar', 'Forex', 5, 100000, 2.0),
('USDJPY', 'US Dollar vs Japanese Yen', 'Forex', 3, 100000, 1.5),
('AUDUSD', 'Australian Dollar vs US Dollar', 'Forex', 5, 100000, 1.8),
('USDCAD', 'US Dollar vs Canadian Dollar', 'Forex', 5, 100000, 2.5),
('USDCHF', 'US Dollar vs Swiss Franc', 'Forex', 5, 100000, 2.0),
('NZDUSD', 'New Zealand Dollar vs US Dollar', 'Forex', 5, 100000, 2.5),
('EURGBP', 'Euro vs British Pound', 'Forex', 5, 100000, 2.5),
('EURJPY', 'Euro vs Japanese Yen', 'Forex', 3, 100000, 2.5),
('GBPJPY', 'British Pound vs Japanese Yen', 'Forex', 3, 100000, 3.5),
('XAUUSD', 'Gold vs US Dollar', 'Metals', 2, 100, 50),
('XAGUSD', 'Silver vs US Dollar', 'Metals', 3, 5000, 2.5),
('USOIL', 'US Oil', 'Commodities', 2, 1000, 3.0),
('UKOIL', 'UK Brent Oil', 'Commodities', 2, 1000, 3.0),
('US30', 'Dow Jones', 'Indices', 1, 1, 2.0),
('US500', 'S&P 500', 'Indices', 1, 1, 0.5),
('NAS100', 'NASDAQ 100', 'Indices', 1, 1, 2.0),
('GER30', 'DAX 30', 'Indices', 1, 1, 2.5),
('UK100', 'FTSE 100', 'Indices', 1, 1, 1.5),
('JPN225', 'Nikkei 225', 'Indices', 1, 1, 5.0)
ON CONFLICT (symbol) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE mt5_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE mt5_market_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE mt5_symbols ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your security requirements)
CREATE POLICY "Allow all operations on mt5_connections" ON mt5_connections FOR ALL USING (true);
CREATE POLICY "Allow all operations on mt5_market_data" ON mt5_market_data FOR ALL USING (true);
CREATE POLICY "Allow read on mt5_symbols" ON mt5_symbols FOR SELECT USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mt5_market_data_symbol_timestamp ON mt5_market_data(symbol, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_mt5_connections_status ON mt5_connections(status);
CREATE INDEX IF NOT EXISTS idx_mt5_symbols_category ON mt5_symbols(category);

-- Function to clean old market data (optional)
CREATE OR REPLACE FUNCTION clean_old_market_data()
RETURNS void AS $$
BEGIN
    DELETE FROM mt5_market_data 
    WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- You can set up a cron job to run this function periodically
-- SELECT cron.schedule('clean-market-data', '0 */6 * * *', 'SELECT clean_old_market_data();');