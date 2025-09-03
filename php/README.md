# PHP TradingView Scraper

This PHP script extracts real market data from TradingView.com and returns it in JSON format for your Node.js application.

## Setup Instructions

### 1. Server Requirements
- PHP 7.4 or higher
- cURL extension enabled
- Apache/Nginx web server

### 2. Installation

#### Option A: Local Development (XAMPP/WAMP/MAMP)
1. Copy the `php` folder to your web server's document root (e.g., `htdocs` for XAMPP)
2. Ensure the folder is accessible via HTTP (e.g., `http://localhost/php/`)

#### Option B: Production Server
1. Upload the `php` folder to your web server
2. Ensure proper permissions (755 for folders, 644 for files)
3. Update the endpoint URL in `src/services/phpTradingViewAPI.ts`

### 3. Configuration

Update the PHP endpoint URL in your Node.js application:

```typescript
// In src/services/phpTradingViewAPI.ts
private static readonly PHP_ENDPOINT = 'https://yourdomain.com/php/tradingview-scraper.php';
```

### 4. Usage

#### Direct PHP Access
```
GET http://localhost/php/tradingview-scraper.php?symbols=EURUSD,GBPUSD,USDJPY
```

#### From Node.js Application
The PHP scraper is automatically integrated with your market data service and will be used as the primary data source.

### 5. Supported Symbols

The scraper supports major trading instruments:

**Forex Pairs:**
- EURUSD, GBPUSD, USDJPY, AUDUSD, USDCAD, USDCHF, NZDUSD
- EURGBP, EURJPY, GBPJPY

**Precious Metals:**
- XAUUSD (Gold), XAGUSD (Silver)

**Commodities:**
- USOIL, UKOIL

**Indices:**
- US30 (Dow Jones), US500 (S&P 500), NAS100 (NASDAQ)
- GER30 (DAX), UK100 (FTSE), JPN225 (Nikkei)

### 6. Response Format

```json
{
  "success": true,
  "data": [
    {
      "symbol": "EURUSD",
      "name": "Euro vs US Dollar",
      "bid": 1.08485,
      "ask": 1.08495,
      "price": 1.0849,
      "spread": 0.0001,
      "change": 0.0012,
      "changePercent": 0.11,
      "high": 1.0855,
      "low": 1.0841,
      "volume": 1234567,
      "timestamp": 1704297600000,
      "category": "Forex",
      "source": "tradingview"
    }
  ],
  "timestamp": "2024-01-03 12:00:00",
  "source": "TradingView PHP Scraper",
  "symbols_requested": ["EURUSD"],
  "symbols_returned": 1
}
```

### 7. Error Handling

The scraper includes automatic fallback to realistic simulation if TradingView is unavailable. Error responses include details for debugging.

### 8. CORS Configuration

The `.htaccess` file includes CORS headers to allow requests from your Node.js application running on different ports/domains.

### 9. Performance Notes

- Each symbol request takes ~1-2 seconds
- Batch requests are more efficient than individual calls
- Results are returned with proper decimal formatting for each instrument type
- Built-in caching can be added for production use

### 10. Troubleshooting

**Common Issues:**
- 500 Error: Check PHP error logs, ensure cURL is enabled
- CORS Error: Verify `.htaccess` configuration
- No Data: TradingView may be blocking requests, fallback simulation will be used
- Timeout: Increase PHP `max_execution_time` if needed

**Debug Mode:**
Add `?debug=1` to the URL to see detailed request/response information.