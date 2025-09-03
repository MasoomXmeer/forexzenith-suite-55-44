# Configuration Guide

Complete configuration guide for the AonePrime FX Trading Platform.

## 📋 Table of Contents

- [Environment Configuration](#environment-configuration)
- [Database Configuration](#database-configuration)
- [Authentication Setup](#authentication-setup)
- [Trading Configuration](#trading-configuration)
- [Payment Processing](#payment-processing)
- [Security Settings](#security-settings)
- [Performance Optimization](#performance-optimization)

## 🌍 Environment Configuration

### Development Environment

#### Environment Variables
```bash
# .env.development
NODE_ENV=development
VITE_APP_ENV=development
VITE_APP_VERSION=1.0.0
VITE_DEBUG_MODE=true

# Supabase Configuration
VITE_SUPABASE_URL=https://rxdyudnjbnnvhbxwkcbf.supabase.co
VITE_SUPABASE_ANON_KEY=your-development-anon-key

# API Configuration
VITE_API_BASE_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000

# Feature Flags
VITE_ENABLE_MT5=true
VITE_ENABLE_SOCIAL_TRADING=true
VITE_ENABLE_CRYPTO_TRADING=false
```

### Production Environment

#### Environment Variables
```bash
# .env.production
NODE_ENV=production
VITE_APP_ENV=production
VITE_APP_VERSION=1.0.0
VITE_DEBUG_MODE=false

# Supabase Configuration
VITE_SUPABASE_URL=https://your-production-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key

# API Configuration
VITE_API_BASE_URL=https://api.aoneprimefx.com
VITE_WS_URL=wss://api.aoneprimefx.com

# CDN Configuration
VITE_CDN_URL=https://cdn.aoneprimefx.com
VITE_ASSETS_URL=https://assets.aoneprimefx.com

# Analytics
VITE_GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX
VITE_MIXPANEL_TOKEN=your-mixpanel-token
```

### Environment-Specific Configurations

#### Platform Configuration
```typescript
// src/config/platform.ts
export const platformConfig = {
  app: {
    name: "AonePrime FX",
    version: import.meta.env.VITE_APP_VERSION,
    environment: import.meta.env.VITE_APP_ENV
  },
  
  trading: {
    supportedPairs: [
      { symbol: "EURUSD", name: "Euro/US Dollar", category: "forex" },
      { symbol: "GBPUSD", name: "British Pound/US Dollar", category: "forex" },
      { symbol: "USDJPY", name: "US Dollar/Japanese Yen", category: "forex" },
      { symbol: "XAUUSD", name: "Gold/US Dollar", category: "metals" },
      { symbol: "US500", name: "S&P 500", category: "indices" }
    ],
    
    leverageOptions: [
      { value: "1:1", label: "1:1" },
      { value: "1:10", label: "1:10" },
      { value: "1:50", label: "1:50" },
      { value: "1:100", label: "1:100" },
      { value: "1:200", label: "1:200" },
      { value: "1:500", label: "1:500" }
    ],
    
    accountTypes: {
      demo: {
        minDeposit: 0,
        maxLeverage: 500,
        spreadsMarkup: 0
      },
      micro: {
        minDeposit: 10,
        maxLeverage: 500,
        spreadsMarkup: 0.2
      },
      standard: {
        minDeposit: 100,
        maxLeverage: 400,
        spreadsMarkup: 0
      },
      vip: {
        minDeposit: 5000,
        maxLeverage: 200,
        spreadsMarkup: -0.1
      }
    }
  }
};
```

## 🗄️ Database Configuration

### Supabase Project Setup

#### Project Settings
```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Configure timezone
SET timezone = 'UTC';
```

#### Row Level Security Policies
```sql
-- User profiles policy
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles  
FOR UPDATE USING (auth.uid() = id);

-- Trading accounts policy
CREATE POLICY "Users can view own trading accounts" ON trading_accounts
FOR SELECT USING (auth.uid() = user_id);

-- Trades policy
CREATE POLICY "Users can view own trades" ON trades
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trades" ON trades
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin policies
CREATE POLICY "Admins can view all data" ON profiles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND user_role IN ('admin', 'super_admin')
  )
);
```

### Database Functions

#### Real-time Price Updates
```sql
CREATE OR REPLACE FUNCTION update_market_prices()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update market prices from external feed
  -- This would integrate with your price provider
  UPDATE markets 
  SET 
    current_price = base_price + (random() - 0.5) * 0.01,
    updated_at = now()
  WHERE is_active = true;
END;
$$;

-- Schedule price updates every second
SELECT cron.schedule('update-prices', '* * * * *', 'SELECT update_market_prices();');
```

#### Trading Functions
```sql
CREATE OR REPLACE FUNCTION calculate_pnl(
  p_trade_id uuid
)
RETURNS numeric
LANGUAGE plpgsql
AS $$
DECLARE
  v_trade trades%ROWTYPE;
  v_current_price numeric;
  v_pnl numeric;
BEGIN
  SELECT * INTO v_trade FROM trades WHERE id = p_trade_id;
  
  -- Get current market price
  SELECT current_price INTO v_current_price 
  FROM markets 
  WHERE symbol = v_trade.symbol;
  
  -- Calculate P&L
  IF v_trade.type = 'buy' THEN
    v_pnl := (v_current_price - v_trade.open_price) * v_trade.amount * 100000;
  ELSE
    v_pnl := (v_trade.open_price - v_current_price) * v_trade.amount * 100000;
  END IF;
  
  -- Update trade with current P&L
  UPDATE trades 
  SET 
    current_price = v_current_price,
    pnl = v_pnl,
    updated_at = now()
  WHERE id = p_trade_id;
  
  RETURN v_pnl;
END;
$$;
```

## 🔐 Authentication Setup

### Supabase Auth Configuration

#### Email Templates
```html
<!-- Confirmation Email Template -->
<html>
<body>
  <h2>Welcome to AonePrime FX</h2>
  <p>Thank you for joining AonePrime FX. Please confirm your email address by clicking the link below:</p>
  <a href="{{ .ConfirmationURL }}">Confirm Email</a>
  
  <p>If you didn't create an account, please ignore this email.</p>
  
  <p>Best regards,<br>AonePrime FX Team</p>
</body>
</html>
```

#### Password Requirements
```javascript
const passwordConfig = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxAge: 90, // days
  preventReuse: 5 // last 5 passwords
};
```

### JWT Configuration
```javascript
// JWT settings in Supabase dashboard
const jwtConfig = {
  jwtExpiry: 3600, // 1 hour
  jwtSecret: "your-jwt-secret",
  refreshTokenExpiry: 604800, // 7 days
  maxSessions: 5 // concurrent sessions per user
};
```

## 💹 Trading Configuration

### Market Data Configuration

#### Supported Markets
```javascript
const marketConfig = {
  forex: {
    sessionHours: {
      sydney: { open: "22:00", close: "07:00", timezone: "UTC" },
      tokyo: { open: "00:00", close: "09:00", timezone: "UTC" },
      london: { open: "08:00", close: "17:00", timezone: "UTC" },
      newYork: { open: "13:00", close: "22:00", timezone: "UTC" }
    },
    
    spreadSettings: {
      EURUSD: { min: 0.8, typical: 1.2, max: 3.0 },
      GBPUSD: { min: 1.0, typical: 1.5, max: 4.0 },
      USDJPY: { min: 0.8, typical: 1.0, max: 2.5 }
    }
  },
  
  indices: {
    US500: {
      tradingHours: { open: "13:30", close: "20:00", timezone: "UTC" },
      spread: { min: 0.4, typical: 0.6, max: 2.0 }
    },
    NASDAQ: {
      tradingHours: { open: "13:30", close: "20:00", timezone: "UTC" },
      spread: { min: 0.6, typical: 1.0, max: 3.0 }
    }
  }
};
```

### Risk Management Settings
```javascript
const riskConfig = {
  maxLeverage: {
    forex: 500,
    indices: 100,
    commodities: 50,
    crypto: 10
  },
  
  marginRequirements: {
    forex: 0.002, // 0.2%
    indices: 0.01, // 1%
    commodities: 0.02, // 2%
    crypto: 0.1 // 10%
  },
  
  stopOutLevel: 20, // %
  marginCallLevel: 50, // %
  
  positionLimits: {
    maxPositions: 100,
    maxLotSize: 50,
    maxExposure: 1000000 // USD
  }
};
```

### MT5 Integration
```javascript
const mt5Config = {
  connection: {
    server: "mt5-server.aoneprimefx.com:443",
    timeout: 5000,
    retryAttempts: 3,
    heartbeatInterval: 30000
  },
  
  dataFeeds: {
    realtime: true,
    historical: true,
    depth: 5,
    updateInterval: 100 // milliseconds
  },
  
  symbols: [
    "EURUSD", "GBPUSD", "USDJPY", "USDCHF",
    "AUDUSD", "USDCAD", "NZDUSD", "EURJPY",
    "XAUUSD", "XAGUSD", "USOIL", "US500"
  ]
};
```

## 💳 Payment Processing

### Payment Gateway Configuration

#### Stripe Configuration
```javascript
const stripeConfig = {
  publishableKey: "pk_live_xxxxxxxxxx",
  secretKey: "sk_live_xxxxxxxxxx", // Server-side only
  
  webhookEndpoint: "https://api.aoneprimefx.com/webhooks/stripe",
  webhookSecret: "whsec_xxxxxxxxxx",
  
  supportedCurrencies: ["USD", "EUR", "GBP", "AUD"],
  
  paymentMethods: {
    card: { enabled: true, fees: 2.9 },
    bankTransfer: { enabled: true, fees: 0.8 },
    applePay: { enabled: true, fees: 2.9 },
    googlePay: { enabled: true, fees: 2.9 }
  }
};
```

#### Cryptocurrency Configuration
```javascript
const cryptoConfig = {
  supportedCurrencies: ["BTC", "ETH", "USDT", "USDC"],
  
  wallets: {
    BTC: "bc1qxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    ETH: "0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    USDT: "0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  },
  
  confirmations: {
    BTC: 3,
    ETH: 12,
    USDT: 12,
    USDC: 12
  },
  
  fees: {
    BTC: 0.0005,
    ETH: 0.01,
    USDT: 5,
    USDC: 5
  }
};
```

### Transaction Limits
```javascript
const transactionLimits = {
  deposit: {
    min: { card: 10, bank: 100, crypto: 50 },
    max: { card: 10000, bank: 100000, crypto: 50000 },
    daily: { standard: 25000, vip: 100000 },
    monthly: { standard: 100000, vip: 1000000 }
  },
  
  withdrawal: {
    min: { card: 20, bank: 100, crypto: 50 },
    max: { card: 5000, bank: 50000, crypto: 25000 },
    daily: { standard: 10000, vip: 50000 },
    monthly: { standard: 50000, vip: 500000 }
  }
};
```

## 🛡️ Security Settings

### Rate Limiting
```javascript
const rateLimits = {
  authentication: {
    login: { attempts: 5, window: "15m", lockout: "1h" },
    signup: { attempts: 3, window: "1h" },
    passwordReset: { attempts: 3, window: "1h" }
  },
  
  trading: {
    orders: { limit: 50, window: "1m" },
    modifications: { limit: 100, window: "1m" },
    cancellations: { limit: 200, window: "1m" }
  },
  
  api: {
    general: { limit: 1000, window: "1h" },
    marketData: { limit: 5000, window: "1h" },
    premium: { limit: 10000, window: "1h" }
  }
};
```

### Content Security Policy
```javascript
const cspConfig = {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      "'unsafe-inline'",
      "https://js.stripe.com",
      "https://www.google-analytics.com"
    ],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: [
      "'self'",
      "https://api.stripe.com",
      "https://rxdyudnjbnnvhbxwkcbf.supabase.co",
      "wss://rxdyudnjbnnvhbxwkcbf.supabase.co"
    ],
    fontSrc: ["'self'", "https://fonts.gstatic.com"]
  }
};
```

### Session Management
```javascript
const sessionConfig = {
  cookieSettings: {
    httpOnly: true,
    secure: true, // HTTPS only
    sameSite: "strict",
    maxAge: 86400000 // 24 hours
  },
  
  sessionTimeout: {
    idle: 1800000, // 30 minutes
    absolute: 43200000 // 12 hours
  },
  
  concurrentSessions: {
    standard: 3,
    vip: 5,
    admin: 2
  }
};
```

## ⚡ Performance Optimization

### Caching Configuration
```javascript
const cacheConfig = {
  redis: {
    host: "redis.aoneprimefx.com",
    port: 6379,
    password: "redis-password",
    db: 0,
    
    ttl: {
      marketData: 1, // 1 second
      userSessions: 3600, // 1 hour
      staticContent: 86400, // 24 hours
      apiResponses: 300 // 5 minutes
    }
  },
  
  cdn: {
    provider: "CloudFlare",
    zones: {
      static: "static.aoneprimefx.com",
      api: "api.aoneprimefx.com",
      websocket: "ws.aoneprimefx.com"
    },
    
    cachePolicies: {
      images: "30d",
      scripts: "7d",
      api: "5m",
      realtime: "no-cache"
    }
  }
};
```

### Database Optimization
```sql
-- Indexes for performance
CREATE INDEX CONCURRENTLY idx_trades_user_id ON trades(user_id);
CREATE INDEX CONCURRENTLY idx_trades_symbol ON trades(symbol);
CREATE INDEX CONCURRENTLY idx_trades_status ON trades(status);
CREATE INDEX CONCURRENTLY idx_trades_created_at ON trades(created_at);

-- Partial indexes for active trades
CREATE INDEX CONCURRENTLY idx_trades_open ON trades(user_id, symbol) 
WHERE status = 'open';

-- Composite indexes for complex queries
CREATE INDEX CONCURRENTLY idx_trades_user_status_date ON trades(user_id, status, created_at);
```

### Connection Pooling
```javascript
const poolConfig = {
  supabase: {
    maxConnections: 100,
    minConnections: 10,
    acquireTimeoutMillis: 60000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000
  }
};
```

## 🔧 Feature Flags

### Environment-based Features
```javascript
const featureFlags = {
  development: {
    debugMode: true,
    mockData: true,
    testPayments: true,
    advancedLogging: true
  },
  
  staging: {
    debugMode: true,
    mockData: false,
    testPayments: true,
    advancedLogging: true
  },
  
  production: {
    debugMode: false,
    mockData: false,
    testPayments: false,
    advancedLogging: false
  }
};
```

### User-based Features
```javascript
const userFeatures = {
  beta: {
    socialTrading: true,
    advancedCharts: true,
    cryptoTrading: false
  },
  
  vip: {
    prioritySupport: true,
    advancedAnalytics: true,
    customIndicators: true,
    reducedSpreads: true
  },
  
  admin: {
    userManagement: true,
    systemMonitoring: true,
    configurationAccess: true,
    auditLogs: true
  }
};
```

---

**Proper configuration ensures optimal performance, security, and user experience. Review and update configurations regularly based on usage patterns and security requirements.**