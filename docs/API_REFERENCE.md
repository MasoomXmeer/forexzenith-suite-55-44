# API Reference

Complete API documentation for the AonePrime FX Trading Platform backend services.

## 📋 Table of Contents

- [Authentication](#authentication)
- [User Management](#user-management)
- [Trading Operations](#trading-operations)
- [Market Data](#market-data)
- [Account Management](#account-management)
- [Financial Operations](#financial-operations)
- [Admin Operations](#admin-operations)
- [WebSocket Events](#websocket-events)

## 🔐 Authentication

### Overview
The platform uses Supabase authentication with JWT tokens for secure API access.

### Base URL
```
https://rxdyudnjbnnvhbxwkcbf.supabase.co/rest/v1/
```

### Authentication Headers
```javascript
const headers = {
  'Authorization': 'Bearer your-jwt-token',
  'apikey': 'your-supabase-anon-key',
  'Content-Type': 'application/json'
};
```

### Auth Endpoints

#### Sign Up
```http
POST /auth/v1/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "data": {
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

**Response:**
```json
{
  "access_token": "jwt-token",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "refresh-token",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### Sign In
```http
POST /auth/v1/token?grant_type=password
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

#### Refresh Token
```http
POST /auth/v1/token?grant_type=refresh_token
Content-Type: application/json

{
  "refresh_token": "your-refresh-token"
}
```

#### Sign Out
```http
POST /auth/v1/logout
Authorization: Bearer jwt-token
```

## 👤 User Management

### Get User Profile
```http
GET /profiles?id=eq.{user_id}
Authorization: Bearer jwt-token
```

**Response:**
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "account_type": "standard",
  "balance": 10000.00,
  "equity": 10000.00,
  "margin": 0.00,
  "free_margin": 10000.00,
  "kyc_status": "verified",
  "is_affiliate": false,
  "referral_code": "XM-12345678",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Update User Profile
```http
PATCH /profiles?id=eq.{user_id}
Authorization: Bearer jwt-token
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Smith",
  "phone": "+1234567890"
}
```

### Get Trading Accounts
```http
GET /trading_accounts?user_id=eq.{user_id}
Authorization: Bearer jwt-token
```

**Response:**
```json
[
  {
    "id": "account-uuid",
    "account_number": "123456789",
    "account_type": "demo",
    "platform": "MT5",
    "currency": "USD",
    "leverage": 500,
    "balance": 10000.00,
    "equity": 10000.00,
    "margin": 0.00,
    "free_margin": 10000.00,
    "is_active": true,
    "is_primary": true
  }
]
```

## 💹 Trading Operations

### Place Market Order
```http
POST /trades
Authorization: Bearer jwt-token
Content-Type: application/json

{
  "trading_account_id": "account-uuid",
  "symbol": "EURUSD",
  "type": "buy",
  "amount": 0.1,
  "leverage": 100,
  "stop_loss": 1.0800,
  "take_profit": 1.0900
}
```

**Response:**
```json
{
  "id": "trade-uuid",
  "user_id": "user-uuid",
  "trading_account_id": "account-uuid",
  "symbol": "EURUSD",
  "type": "buy",
  "amount": 0.1,
  "open_price": 1.0850,
  "current_price": 1.0850,
  "leverage": 100,
  "stop_loss": 1.0800,
  "take_profit": 1.0900,
  "pnl": 0.00,
  "status": "open",
  "created_at": "2024-01-01T12:00:00Z"
}
```

### Get Open Positions
```http
GET /trades?user_id=eq.{user_id}&status=eq.open
Authorization: Bearer jwt-token
```

### Close Position
```http
PATCH /trades?id=eq.{trade_id}
Authorization: Bearer jwt-token
Content-Type: application/json

{
  "status": "closed",
  "closed_at": "2024-01-01T13:00:00Z",
  "current_price": 1.0875,
  "pnl": 25.00
}
```

### Get Trading History
```http
GET /trades?user_id=eq.{user_id}&status=eq.closed&order=created_at.desc
Authorization: Bearer jwt-token
```

## 📊 Market Data

### Get Real-Time Prices
```http
GET /rpc/get_market_prices
Authorization: Bearer jwt-token
Content-Type: application/json

{
  "symbols": ["EURUSD", "GBPUSD", "USDJPY"]
}
```

**Response:**
```json
[
  {
    "symbol": "EURUSD",
    "bid": 1.0850,
    "ask": 1.0852,
    "spread": 0.0002,
    "change": 0.0025,
    "change_percent": 0.23,
    "timestamp": "2024-01-01T12:00:00Z"
  }
]
```

### Get Historical Data
```http
GET /rpc/get_historical_data
Authorization: Bearer jwt-token
Content-Type: application/json

{
  "symbol": "EURUSD",
  "timeframe": "1H",
  "from": "2024-01-01T00:00:00Z",
  "to": "2024-01-02T00:00:00Z"
}
```

**Response:**
```json
[
  {
    "timestamp": "2024-01-01T00:00:00Z",
    "open": 1.0830,
    "high": 1.0860,
    "low": 1.0825,
    "close": 1.0850,
    "volume": 1234567
  }
]
```

### Get Market Status
```http
GET /markets?is_active=eq.true
Authorization: Bearer jwt-token
```

## 💰 Account Management

### Get Account Balance
```http
GET /rpc/get_account_summary
Authorization: Bearer jwt-token
Content-Type: application/json

{
  "account_id": "account-uuid"
}
```

**Response:**
```json
{
  "balance": 10000.00,
  "equity": 10025.00,
  "margin": 1085.00,
  "free_margin": 8940.00,
  "margin_level": 924.88,
  "open_positions": 2,
  "floating_pnl": 25.00
}
```

### Update Leverage
```http
PATCH /trading_accounts?id=eq.{account_id}
Authorization: Bearer jwt-token
Content-Type: application/json

{
  "leverage": 200
}
```

## 💳 Financial Operations

### Create Deposit Request
```http
POST /transactions
Authorization: Bearer jwt-token
Content-Type: application/json

{
  "user_id": "user-uuid",
  "type": "deposit",
  "amount": 1000.00,
  "currency": "USD",
  "payment_method_id": "method-uuid"
}
```

### Create Withdrawal Request
```http
POST /transactions
Authorization: Bearer jwt-token
Content-Type: application/json

{
  "user_id": "user-uuid",
  "type": "withdrawal",
  "amount": 500.00,
  "currency": "USD",
  "payment_method_id": "method-uuid"
}
```

### Get Transaction History
```http
GET /transactions?user_id=eq.{user_id}&order=created_at.desc
Authorization: Bearer jwt-token
```

**Response:**
```json
[
  {
    "id": "transaction-uuid",
    "user_id": "user-uuid",
    "type": "deposit",
    "amount": 1000.00,
    "currency": "USD",
    "status": "completed",
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-01T10:05:00Z"
  }
]
```

## 🔧 Admin Operations

### Get Admin Statistics
```http
GET /rpc/get_admin_stats
Authorization: Bearer admin-jwt-token
```

**Response:**
```json
{
  "total_users": 5000,
  "active_trades": 1250,
  "total_volume": 50000000.00,
  "total_commission": 25000.00,
  "daily_signups": 45,
  "daily_volume": 2500000.00
}
```

### Get All Users (Admin)
```http
GET /profiles?order=created_at.desc&limit=50
Authorization: Bearer admin-jwt-token
```

### Update User Status (Admin)
```http
PATCH /profiles?id=eq.{user_id}
Authorization: Bearer admin-jwt-token
Content-Type: application/json

{
  "kyc_status": "verified",
  "account_type": "vip"
}
```

### Force Close Position (Admin)
```http
PATCH /trades?id=eq.{trade_id}
Authorization: Bearer admin-jwt-token
Content-Type: application/json

{
  "status": "closed",
  "closed_at": "2024-01-01T15:00:00Z",
  "admin_note": "Risk management closure"
}
```

## 🔌 WebSocket Events

### Connection
```javascript
const ws = new WebSocket('wss://rxdyudnjbnnvhbxwkcbf.supabase.co/realtime/v1/websocket');

// Authentication
ws.send(JSON.stringify({
  topic: 'realtime',
  event: 'phx_join',
  payload: {
    config: {
      postgres_changes: [
        {
          event: '*',
          schema: 'public',
          table: 'trades'
        }
      ]
    }
  }
}));
```

### Price Updates
```javascript
// Subscribe to price updates
const priceChannel = supabase
  .channel('prices')
  .on('postgres_changes', 
    { event: 'UPDATE', schema: 'public', table: 'markets' }, 
    (payload) => {
      console.log('Price update:', payload.new);
    }
  )
  .subscribe();
```

### Trade Updates
```javascript
// Subscribe to trade updates for user
const tradeChannel = supabase
  .channel('trades')
  .on('postgres_changes',
    { 
      event: '*', 
      schema: 'public', 
      table: 'trades',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      console.log('Trade update:', payload);
    }
  )
  .subscribe();
```

### Account Updates
```javascript
// Subscribe to account balance changes
const accountChannel = supabase
  .channel('accounts')
  .on('postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'trading_accounts',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      console.log('Account update:', payload.new);
    }
  )
  .subscribe();
```

## 🚫 Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request parameters are invalid",
    "details": {
      "field": "amount",
      "reason": "Amount must be greater than 0"
    }
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Common Error Codes

#### Authentication Errors
- `UNAUTHORIZED`: Invalid or expired token
- `FORBIDDEN`: Insufficient permissions
- `INVALID_CREDENTIALS`: Wrong email/password

#### Trading Errors
- `INSUFFICIENT_MARGIN`: Not enough margin for trade
- `INVALID_SYMBOL`: Trading pair not supported
- `MARKET_CLOSED`: Market is currently closed
- `POSITION_NOT_FOUND`: Trade ID doesn't exist

#### Validation Errors
- `INVALID_REQUEST`: Malformed request body
- `MISSING_PARAMETER`: Required field not provided
- `INVALID_PARAMETER`: Parameter value out of range

## 📚 Rate Limits

### Standard Limits
- **Authentication**: 10 requests per minute
- **Trading**: 50 orders per minute
- **Market Data**: 1000 requests per hour
- **General API**: 1000 requests per hour

### Premium Limits (VIP accounts)
- **Trading**: 200 orders per minute
- **Market Data**: 5000 requests per hour
- **General API**: 5000 requests per hour

### Rate Limit Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1641024000
```

## 🧪 Testing

### Sandbox Environment
```
Base URL: https://sandbox.aoneprimefx.com/api/v1/
```

### Test Credentials
```javascript
const testUser = {
  email: "test@example.com",
  password: "testpassword123"
};
```

### Mock Data
```javascript
const mockTrade = {
  symbol: "EURUSD",
  type: "buy",
  amount: 0.01,
  test_mode: true
};
```

---

**This API reference covers all major endpoints and operations. For additional help or custom integrations, contact our technical support team.**