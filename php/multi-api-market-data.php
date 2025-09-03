<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// API Configuration
define('POLYGON_API_KEY', 'S88QBGV0fbtfk5gkJH_pdXstdffL9tst');
define('ALPHA_VANTAGE_API_KEY', 'EAMUVG4I5ICGMT42');
define('EXCHANGERATES_API_KEY', '596b942a439308cb493cf13a735510bb');
define('FIXER_IO_API_KEY', '09148f4e65d476bd34935dd66fca1fdd');
define('CURRENCYLAYER_API_KEY', 'cf376732b21d714c85eaac6f7c4cd512');

// Cache configuration
define('CACHE_DIR', __DIR__ . '/cache/');
define('CACHE_TTL', 60); // 1 minute cache

// Ensure cache directory exists
if (!file_exists(CACHE_DIR)) {
    mkdir(CACHE_DIR, 0755, true);
}

class MultiApiMarketData {
    private $rateLimits = [];
    private $apiPriority = [
        'forex' => ['exchangerates_api', 'fixer_io', 'currencylayer', 'alpha_vantage'],
        'stocks' => ['polygon', 'alpha_vantage'],
        'crypto' => ['polygon', 'alpha_vantage'],
        'metals' => ['alpha_vantage', 'polygon'],
        'indices' => ['alpha_vantage', 'polygon']
    ];

    public function __construct() {
        $this->initializeRateLimits();
    }

    private function initializeRateLimits() {
        $this->rateLimits = [
            'polygon' => ['limit' => 5, 'window' => 60, 'calls' => [], 'reset' => time() + 60],
            'alpha_vantage' => ['limit' => 5, 'window' => 60, 'calls' => [], 'reset' => time() + 60],
            'exchangerates_api' => ['limit' => 100, 'window' => 3600, 'calls' => [], 'reset' => time() + 3600],
            'fixer_io' => ['limit' => 10, 'window' => 3600, 'calls' => [], 'reset' => time() + 3600],
            'currencylayer' => ['limit' => 10, 'window' => 3600, 'calls' => [], 'reset' => time() + 3600]
        ];
    }

    private function checkRateLimit($api) {
        $now = time();
        
        // Reset if window expired
        if ($now > $this->rateLimits[$api]['reset']) {
            $this->rateLimits[$api]['calls'] = [];
            $this->rateLimits[$api]['reset'] = $now + $this->rateLimits[$api]['window'];
        }

        // Clean old calls
        $this->rateLimits[$api]['calls'] = array_filter(
            $this->rateLimits[$api]['calls'], 
            function($timestamp) use ($now) {
                return ($now - $timestamp) < $this->rateLimits[$api]['window'];
            }
        );

        return count($this->rateLimits[$api]['calls']) < $this->rateLimits[$api]['limit'];
    }

    private function recordApiCall($api) {
        $this->rateLimits[$api]['calls'][] = time();
    }

    private function getFromCache($key) {
        $cacheFile = CACHE_DIR . md5($key) . '.json';
        if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < CACHE_TTL) {
            return json_decode(file_get_contents($cacheFile), true);
        }
        return null;
    }

    private function saveToCache($key, $data) {
        $cacheFile = CACHE_DIR . md5($key) . '.json';
        file_put_contents($cacheFile, json_encode($data));
    }

    private function makeApiRequest($url, $headers = []) {
        $defaultHeaders = ['User-Agent: TradingApp/1.0'];
        $headers = array_merge($defaultHeaders, $headers);

        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 10,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_SSL_VERIFYPEER => false
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode === 200 && $response) {
            $data = json_decode($response, true);
            if ($data && json_last_error() === JSON_ERROR_NONE) {
                return $data;
            }
        }
        return null;
    }

    private function getSymbolCategory($symbol) {
        if (preg_match('/^[A-Z]{6}$/', $symbol)) return 'forex';
        if (strpos($symbol, 'XAU') === 0 || strpos($symbol, 'XAG') === 0) return 'metals';
        if (preg_match('/^(US30|US500|NAS100|GER30|UK100|JPN225)$/', $symbol)) return 'indices';
        if (preg_match('/^[A-Z]{1,5}$/', $symbol)) return 'stocks';
        return 'stocks'; // default
    }

    private function convertSymbolForApi($symbol, $api) {
        switch ($api) {
            case 'polygon':
                if ($this->getSymbolCategory($symbol) === 'forex') {
                    return 'C:' . substr($symbol, 0, 3) . substr($symbol, 3, 3);
                }
                return $symbol;
            case 'alpha_vantage':
                if ($symbol === 'XAUUSD') return 'XAU';
                if ($symbol === 'XAGUSD') return 'XAG';
                return $symbol;
            default:
                return $symbol;
        }
    }

    private function fetchFromPolygon($symbol) {
        $convertedSymbol = $this->convertSymbolForApi($symbol, 'polygon');
        $url = "https://api.polygon.io/v2/last/trade/{$convertedSymbol}?apikey=" . POLYGON_API_KEY;
        
        $data = $this->makeApiRequest($url);
        if ($data && isset($data['results']['p'])) {
            $price = $data['results']['p'];
            $spread = $this->getTypicalSpread($symbol);
            
            return [
                'symbol' => $symbol,
                'price' => $price,
                'bid' => $price - $spread / 2,
                'ask' => $price + $spread / 2,
                'change' => 0,
                'changePercent' => 0,
                'high' => $price,
                'low' => $price,
                'volume' => $data['results']['s'] ?? 0,
                'timestamp' => ($data['results']['t'] ?? time() * 1000),
                'source' => 'polygon',
                'quality' => 'real_time'
            ];
        }
        return null;
    }

    private function fetchFromAlphaVantage($symbol) {
        $convertedSymbol = $this->convertSymbolForApi($symbol, 'alpha_vantage');
        
        if ($this->getSymbolCategory($symbol) === 'forex') {
            $from = substr($symbol, 0, 3);
            $to = substr($symbol, 3, 3);
            $url = "https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency={$from}&to_currency={$to}&apikey=" . ALPHA_VANTAGE_API_KEY;
        } else {
            $url = "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={$convertedSymbol}&apikey=" . ALPHA_VANTAGE_API_KEY;
        }

        $data = $this->makeApiRequest($url);
        
        if (isset($data['Realtime Currency Exchange Rate'])) {
            $rate = $data['Realtime Currency Exchange Rate'];
            $price = floatval($rate['5. Exchange Rate']);
            $spread = $this->getTypicalSpread($symbol);
            
            return [
                'symbol' => $symbol,
                'price' => $price,
                'bid' => $price - $spread / 2,
                'ask' => $price + $spread / 2,
                'change' => 0,
                'changePercent' => 0,
                'high' => $price,
                'low' => $price,
                'volume' => 0,
                'timestamp' => strtotime($rate['6. Last Refreshed']) * 1000,
                'source' => 'alpha_vantage',
                'quality' => 'real_time'
            ];
        }

        if (isset($data['Global Quote'])) {
            $quote = $data['Global Quote'];
            return [
                'symbol' => $symbol,
                'price' => floatval($quote['05. price']),
                'bid' => floatval($quote['05. price']) - 0.01,
                'ask' => floatval($quote['05. price']) + 0.01,
                'change' => floatval($quote['09. change']),
                'changePercent' => floatval(str_replace('%', '', $quote['10. change percent'])),
                'high' => floatval($quote['03. high']),
                'low' => floatval($quote['04. low']),
                'volume' => intval($quote['06. volume']),
                'timestamp' => strtotime($quote['07. latest trading day']) * 1000,
                'source' => 'alpha_vantage',
                'quality' => 'real_time'
            ];
        }

        return null;
    }

    private function fetchFromExchangeRatesApi($symbol) {
        if ($this->getSymbolCategory($symbol) !== 'forex') return null;

        $from = substr($symbol, 0, 3);
        $to = substr($symbol, 3, 3);
        $url = "https://v6.exchangerate-api.com/v6/" . EXCHANGERATES_API_KEY . "/pair/{$from}/{$to}";

        $data = $this->makeApiRequest($url);
        if ($data && isset($data['conversion_rate']) && $data['result'] === 'success') {
            $price = $data['conversion_rate'];
            $spread = $this->getTypicalSpread($symbol);
            
            return [
                'symbol' => $symbol,
                'price' => $price,
                'bid' => $price - $spread / 2,
                'ask' => $price + $spread / 2,
                'change' => 0,
                'changePercent' => 0,
                'high' => $price,
                'low' => $price,
                'volume' => 0,
                'timestamp' => $data['time_last_update_unix'] * 1000,
                'source' => 'exchangerates_api',
                'quality' => 'real_time'
            ];
        }
        return null;
    }

    private function fetchFromFixerIo($symbol) {
        if ($this->getSymbolCategory($symbol) !== 'forex') return null;

        $from = substr($symbol, 0, 3);
        $to = substr($symbol, 3, 3);
        $url = "http://data.fixer.io/api/latest?access_key=" . FIXER_IO_API_KEY . "&base={$from}&symbols={$to}";

        $data = $this->makeApiRequest($url);
        if ($data && isset($data['rates'][$to]) && $data['success']) {
            $price = $data['rates'][$to];
            $spread = $this->getTypicalSpread($symbol);
            
            return [
                'symbol' => $symbol,
                'price' => $price,
                'bid' => $price - $spread / 2,
                'ask' => $price + $spread / 2,
                'change' => 0,
                'changePercent' => 0,
                'high' => $price,
                'low' => $price,
                'volume' => 0,
                'timestamp' => $data['timestamp'] * 1000,
                'source' => 'fixer_io',
                'quality' => 'real_time'
            ];
        }
        return null;
    }

    private function fetchFromCurrencyLayer($symbol) {
        if ($this->getSymbolCategory($symbol) !== 'forex') return null;

        $to = substr($symbol, 3, 3);
        $url = "http://api.currencylayer.com/live?access_key=" . CURRENCYLAYER_API_KEY . "&currencies={$to}&format=1";

        $data = $this->makeApiRequest($url);
        if ($data && isset($data['quotes']['USD' . $to]) && $data['success']) {
            $price = $data['quotes']['USD' . $to];
            $spread = $this->getTypicalSpread($symbol);
            
            return [
                'symbol' => $symbol,
                'price' => $price,
                'bid' => $price - $spread / 2,
                'ask' => $price + $spread / 2,
                'change' => 0,
                'changePercent' => 0,
                'high' => $price,
                'low' => $price,
                'volume' => 0,
                'timestamp' => $data['timestamp'] * 1000,
                'source' => 'currencylayer',
                'quality' => 'real_time'
            ];
        }
        return null;
    }

    private function getTypicalSpread($symbol) {
        $spreads = [
            'EURUSD' => 0.0001, 'GBPUSD' => 0.0002, 'USDJPY' => 0.001,
            'AUDUSD' => 0.0002, 'USDCAD' => 0.0002, 'USDCHF' => 0.0002,
            'XAUUSD' => 0.5, 'XAGUSD' => 0.02
        ];
        return $spreads[$symbol] ?? 0.0001;
    }

    private function simulatePrice($symbol) {
        $basePrices = [
            'EURUSD' => 1.0850, 'GBPUSD' => 1.2650, 'USDJPY' => 149.50,
            'AUDUSD' => 0.6580, 'USDCAD' => 1.3720, 'USDCHF' => 0.9180,
            'XAUUSD' => 2025.50, 'XAGUSD' => 24.85
        ];

        $basePrice = $basePrices[$symbol] ?? 1.0000;
        $volatility = 0.002;
        $randomFactor = (mt_rand() / mt_getrandmax() - 0.5) * 2 * $volatility;
        $price = $basePrice * (1 + $randomFactor);
        $spread = $this->getTypicalSpread($symbol);

        return [
            'symbol' => $symbol,
            'price' => $price,
            'bid' => $price - $spread / 2,
            'ask' => $price + $spread / 2,
            'change' => $price * (mt_rand() / mt_getrandmax() - 0.5) * 0.02,
            'changePercent' => (mt_rand() / mt_getrandmax() - 0.5) * 4,
            'high' => $price * (1 + mt_rand() / mt_getrandmax() * 0.01),
            'low' => $price * (1 - mt_rand() / mt_getrandmax() * 0.01),
            'volume' => mt_rand(1000, 100000),
            'timestamp' => time() * 1000,
            'source' => 'simulation',
            'quality' => 'simulated'
        ];
    }

    private function validateData($data) {
        if (!$data || !isset($data['price']) || $data['price'] <= 0) {
            return false;
        }
        if (isset($data['bid'], $data['ask']) && $data['bid'] >= $data['ask']) {
            return false;
        }
        return true;
    }

    public function fetchMarketData($symbol) {
        $cacheKey = "market_data_{$symbol}";
        $cached = $this->getFromCache($cacheKey);
        if ($cached) {
            return $cached;
        }

        $category = $this->getSymbolCategory($symbol);
        $apis = $this->apiPriority[$category] ?? ['alpha_vantage'];

        foreach ($apis as $api) {
            if (!$this->checkRateLimit($api)) {
                continue;
            }

            $this->recordApiCall($api);
            $data = null;

            switch ($api) {
                case 'polygon':
                    $data = $this->fetchFromPolygon($symbol);
                    break;
                case 'alpha_vantage':
                    $data = $this->fetchFromAlphaVantage($symbol);
                    break;
                case 'exchangerates_api':
                    $data = $this->fetchFromExchangeRatesApi($symbol);
                    break;
                case 'fixer_io':
                    $data = $this->fetchFromFixerIo($symbol);
                    break;
                case 'currencylayer':
                    $data = $this->fetchFromCurrencyLayer($symbol);
                    break;
            }

            if ($this->validateData($data)) {
                $this->saveToCache($cacheKey, $data);
                return $data;
            }
        }

        // Fallback to simulation
        $simData = $this->simulatePrice($symbol);
        $this->saveToCache($cacheKey, $simData);
        return $simData;
    }

    public function fetchMultipleSymbols($symbols) {
        $results = [];
        foreach ($symbols as $symbol) {
            $results[] = $this->fetchMarketData(strtoupper(trim($symbol)));
        }
        return $results;
    }
}

// Main execution
try {
    $api = new MultiApiMarketData();
    
    if (isset($_GET['symbol'])) {
        $symbol = strtoupper(trim($_GET['symbol']));
        $result = $api->fetchMarketData($symbol);
        echo json_encode($result, JSON_PRETTY_PRINT);
    } elseif (isset($_GET['symbols'])) {
        $symbols = explode(',', $_GET['symbols']);
        $results = $api->fetchMultipleSymbols($symbols);
        echo json_encode($results, JSON_PRETTY_PRINT);
    } elseif (isset($_GET['category'])) {
        $categories = [
            'forex' => ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD'],
            'metals' => ['XAUUSD', 'XAGUSD'],
            'indices' => ['US30', 'US500', 'NAS100']
        ];
        
        $category = strtolower($_GET['category']);
        if (isset($categories[$category])) {
            $results = $api->fetchMultipleSymbols($categories[$category]);
            echo json_encode($results, JSON_PRETTY_PRINT);
        } else {
            echo json_encode(['error' => 'Invalid category. Use: forex, metals, indices'], JSON_PRETTY_PRINT);
        }
    } else {
        // Default: return sample data for main symbols
        $defaultSymbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD'];
        $results = $api->fetchMultipleSymbols($defaultSymbols);
        echo json_encode($results, JSON_PRETTY_PRINT);
    }
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()], JSON_PRETTY_PRINT);
}
?>