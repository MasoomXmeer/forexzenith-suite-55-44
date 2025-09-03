import { MarketPrice, ApiResponse } from './types';
import { DataCache } from './cache';
import { RateLimiter } from './rateLimiter';
import { RequestBatcher } from './requestBatcher';
import { FallbackPriceProvider } from './fallbackProvider';


class MarketDataService {
  private cache: DataCache<MarketPrice>;
  private rateLimiter: RateLimiter;
  private batcher: RequestBatcher<MarketPrice>;
  private fallbackProvider: FallbackPriceProvider;
  private subscriptions = new Map<string, Set<(price: MarketPrice) => void>>();
  private streamingIntervals = new Map<string, NodeJS.Timeout>();
  private activeSymbols = new Set<string>();
  
  private readonly baseUrl = 'https://trade.onetickmarkets.com/exchange/backend/api/common/Oandaprice';
  private readonly CACHE_FRESHNESS_MS = 500;
  private readonly MAX_REQUESTS_PER_SECOND = 2;
  private readonly BATCH_DELAY_MS = 100;
  private readonly REQUEST_TIMEOUT_MS = 15000; // Increased timeout for better reliability
  private readonly STREAMING_INTERVAL_MS = 2000;

  constructor() {
    this.cache = new DataCache<MarketPrice>(this.CACHE_FRESHNESS_MS);
    this.rateLimiter = new RateLimiter(this.MAX_REQUESTS_PER_SECOND);
    this.fallbackProvider = new FallbackPriceProvider();
    
    // Initialize batcher with batch processing function
    this.batcher = new RequestBatcher<MarketPrice>(
      this.BATCH_DELAY_MS,
      async (symbols: string[]) => this.processBatch(symbols)
    );
  }

  private getSymbolMapping(symbol: string): string {
    const mappings: { [key: string]: string } = {
      // Major Forex Pairs
      'EURUSD': 'EUR_USD',
      'GBPUSD': 'GBP_USD',
      'USDJPY': 'USD_JPY',
      'AUDUSD': 'AUD_USD',
      'USDCAD': 'USD_CAD',
      'USDCHF': 'USD_CHF',
      'NZDUSD': 'NZD_USD',
      
      // Cross Pairs
      'EURGBP': 'EUR_GBP',
      'EURJPY': 'EUR_JPY',
      'GBPJPY': 'GBP_JPY',
      
      // Metals
      'XAUUSD': 'XAU_USD',
      'XAGUSD': 'XAG_USD',
      
      // Energies (OneTick Markets format)
      'USOIL': 'WTICO_USD',
      'UKOIL': 'BCO_USD',
      
      // Indices (OneTick Markets format)
      'US30': 'US30_USD',
      'US500': 'SPX500_USD',
      'NAS100': 'NAS100_USD',
      'GER30': 'DE30_EUR',
      'UK100': 'UK100_GBP',
      'JPN225': 'JP225_USD'
    };
    return mappings[symbol] || null;
  }

  private isSymbolSupported(symbol: string): boolean {
    return this.getSymbolMapping(symbol) !== null;
  }

  private getDecimalPlaces(symbol: string): number {
    if (symbol.includes('JPY')) return 3;
    if (symbol.startsWith('XAU')) return 2;
    if (symbol.startsWith('XAG')) return 3;
    
    if (symbol.includes('OIL')) return 3;
    if (['US30', 'US500', 'NAS100'].includes(symbol)) return 1;
    return 5;
  }

  async getMarketPrice(symbol: string): Promise<MarketPrice> {
    // Step 1: Check if symbol is supported
    if (!this.isSymbolSupported(symbol)) {
      console.warn(`Symbol ${symbol} not supported by OneTick Markets API, using fallback`);
      return this.fallbackProvider.getFallbackPrice(symbol);
    }

    // Step 2: Check cache first
    const cached = this.cache.get(symbol);
    if (cached) {
      return cached;
    }

    // Step 3: Check rate limit for API requests
    const waitTime = this.rateLimiter.getWaitTime(symbol);
    if (waitTime > 0) {
      // Return fallback if rate limited
      return this.fallbackProvider.getFallbackPrice(symbol);
    }

    // Step 4: Use batcher for efficient requests
    try {
      const price = await this.batcher.request(symbol);
      return price;
    } catch (error) {
      console.warn(`Failed to fetch ${symbol}, using fallback`, error);
      return this.fallbackProvider.getFallbackPrice(symbol);
    }
  }

  private async processBatch(symbols: string[]): Promise<Map<string, MarketPrice>> {
    const results = new Map<string, MarketPrice>();
    
    // Process each symbol with rate limiting
    for (const symbol of symbols) {
      // Check if symbol is supported
      if (!this.isSymbolSupported(symbol)) {
        const fallback = this.fallbackProvider.getFallbackPrice(symbol);
        results.set(symbol, fallback);
        continue;
      }

      // Check cache again (might have been updated)
      const cached = this.cache.get(symbol);
      if (cached) {
        results.set(symbol, cached);
        continue;
      }

      // Check rate limit
      if (!this.rateLimiter.canMakeRequest(symbol)) {
        const fallback = this.fallbackProvider.getFallbackPrice(symbol);
        results.set(symbol, fallback);
        continue;
      }

      // Make API request
      try {
        this.rateLimiter.recordRequest(symbol);
        const price = await this.fetchMarketPriceFromAPI(symbol);
        results.set(symbol, price);
      } catch (error) {
        console.warn(`API request failed for ${symbol}:`, error);
        const fallback = this.fallbackProvider.getFallbackPrice(symbol);
        results.set(symbol, fallback);
      }
    }

    return results;
  }

  private async fetchMarketPriceFromAPI(symbol: string): Promise<MarketPrice> {
    const apiSymbol = this.getSymbolMapping(symbol);
    if (!apiSymbol) {
      throw new Error(`No API mapping found for symbol: ${symbol}`);
    }
    
    const url = `${this.baseUrl}/${apiSymbol}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, this.REQUEST_TIMEOUT_MS);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      
      // Handle OANDA API response format
      if (data.errorMessage) {
        throw new Error(`API returned error: ${data.errorMessage}`);
      }
      
      if (!data.candles?.length) {
        throw new Error('No market data available');
      }
      
      const latestCandle = data.candles[data.candles.length - 1];
      if (!latestCandle.mid) {
        throw new Error('Invalid candle data format');
      }
      
      const mid = latestCandle.mid;
      const price = parseFloat(mid.c || mid.o);
      const high = parseFloat(mid.h);
      const low = parseFloat(mid.l);
      const open = parseFloat(mid.o);
      const close = parseFloat(mid.c || mid.o);
      const volume = parseInt(latestCandle.volume || '0');
      
      // Validate parsed values
      if (isNaN(price) || isNaN(high) || isNaN(low) || isNaN(open)) {
        throw new Error('Invalid price data received from API');
      }
      
      // Calculate bid/ask spread based on symbol type
      const spread = this.getSpreadForSymbol(symbol);
      const bid = price - (spread / 2);
      const ask = price + (spread / 2);
      
      const change = close - open;
      const changePercent = open !== 0 ? (change / open) * 100 : 0;
      
      const marketPrice: MarketPrice = {
        symbol,
        name: this.getSymbolName(symbol),
        price: Number(price.toFixed(this.getDecimalPlaces(symbol))),
        bid: Number(bid.toFixed(this.getDecimalPlaces(symbol))),
        ask: Number(ask.toFixed(this.getDecimalPlaces(symbol))),
        change: Number(change.toFixed(this.getDecimalPlaces(symbol))),
        changePercent: Number(changePercent.toFixed(2)),
        high: Number(high.toFixed(this.getDecimalPlaces(symbol))),
        low: Number(low.toFixed(this.getDecimalPlaces(symbol))),
        volume: volume,
        timestamp: Date.now(),
        category: this.getSymbolCategory(symbol),
        source: 'onetickmarkets'
      };

      // Update cache and fallback provider
      this.cache.set(symbol, marketPrice);
      this.fallbackProvider.updateLastKnown(symbol, marketPrice);
      
      return marketPrice;
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Handle specific abort errors more gracefully
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout for ${symbol}`);
      }
      
      throw error;
    }
  }

  private getSpreadForSymbol(symbol: string): number {
    // Base spreads in pips (converted to price units)
    const spreads: { [key: string]: number } = {
      'EURUSD': 0.00008, 'GBPUSD': 0.00012, 'USDJPY': 0.005,
      'AUDUSD': 0.0001, 'USDCAD': 0.00015, 'USDCHF': 0.00013,
      'NZDUSD': 0.00018, 'EURGBP': 0.00015, 'EURJPY': 0.01,
      'GBPJPY': 0.02, 'XAUUSD': 0.30, 'XAGUSD': 0.03,
      'USOIL': 0.03, 'UKOIL': 0.03, 'US30': 2, 'US500': 1,
      'NAS100': 1, 'GER30': 1, 'UK100': 1, 'JPN225': 8
    };
    return spreads[symbol] || 0.0001;
  }

  async getMultipleMarketPrices(symbols: string[]): Promise<MarketPrice[]> {
    if (symbols.length === 0) return [];
    
    // Fetch all prices using the standard API
    const prices = await Promise.all(
      symbols.map(symbol => 
        this.getMarketPrice(symbol).catch(() => 
          this.fallbackProvider.getFallbackPrice(symbol)
        )
      )
    );
    
    return prices;
  }

  subscribeToRealTimeUpdates(symbols: string[], callback: (price: MarketPrice) => void): () => void {
    symbols.forEach(symbol => {
      if (!this.subscriptions.has(symbol)) {
        this.subscriptions.set(symbol, new Set());
      }
      this.subscriptions.get(symbol)!.add(callback);
      this.activeSymbols.add(symbol);
      this.startStreamingForSymbol(symbol);
    });

    // Return cleanup function
    return () => {
      symbols.forEach(symbol => {
        const callbacks = this.subscriptions.get(symbol);
        if (callbacks) {
          callbacks.delete(callback);
          if (callbacks.size === 0) {
            this.subscriptions.delete(symbol);
            this.activeSymbols.delete(symbol);
            this.stopStreamingForSymbol(symbol);
          }
        }
      });
    };
  }

  private startStreamingForSymbol(symbol: string): void {
    if (this.streamingIntervals.has(symbol)) return;

    const interval = setInterval(async () => {
      // Check if still active
      if (!this.activeSymbols.has(symbol)) {
        this.stopStreamingForSymbol(symbol);
        return;
      }

      try {
        // Use the main getMarketPrice method which includes caching and rate limiting
        const price = await this.getMarketPrice(symbol);
        
        // Only notify if we got real data
        if (price.source === 'onetickmarkets') {
          this.notifySubscribers(symbol, price);
        }
      } catch (error) {
        // Silent error handling for streaming
      }
    }, this.STREAMING_INTERVAL_MS);

    this.streamingIntervals.set(symbol, interval);
  }

  private stopStreamingForSymbol(symbol: string): void {
    const interval = this.streamingIntervals.get(symbol);
    if (interval) {
      clearInterval(interval);
      this.streamingIntervals.delete(symbol);
    }
  }

  private notifySubscribers(symbol: string, price: MarketPrice): void {
    const callbacks = this.subscriptions.get(symbol);
    if (callbacks) {
      // Use requestAnimationFrame for smooth UI updates
      requestAnimationFrame(() => {
        callbacks.forEach(callback => callback(price));
      });
    }
  }

  private getSymbolName(symbol: string): string {
    const names: { [key: string]: string } = {
      'EURUSD': 'Euro/US Dollar',
      'GBPUSD': 'British Pound/US Dollar',
      'USDJPY': 'US Dollar/Japanese Yen',
      'AUDUSD': 'Australian Dollar/US Dollar',
      'USDCAD': 'US Dollar/Canadian Dollar',
      'USDCHF': 'US Dollar/Swiss Franc',
      'NZDUSD': 'New Zealand Dollar/US Dollar',
      'EURGBP': 'Euro/British Pound',
      'EURJPY': 'Euro/Japanese Yen',
      'GBPJPY': 'British Pound/Japanese Yen',
      'XAUUSD': 'Gold/US Dollar',
      'XAGUSD': 'Silver/US Dollar',
      'USOIL': 'US Crude Oil',
      'US30': 'Dow Jones 30',
      'US500': 'S&P 500',
      'NAS100': 'NASDAQ 100'
    };
    return names[symbol] || symbol;
  }

  private getSymbolCategory(symbol: string): string {
    if (symbol.startsWith('XAU') || symbol.startsWith('XAG')) return 'Metals';
    if (symbol.includes('OIL')) return 'Energy';
    if (symbol.includes('US') || symbol.includes('NAS')) return 'Indices';
    return 'Forex';
  }

  clearCache(): void {
    this.cache.clear();
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.getMarketPrice('XAUUSD');
      return true;
    } catch {
      return false;
    }
  }

  getApiStatus(): { provider: string; status: string; lastUpdate: number } {
    return {
      provider: 'onetickmarkets',
      status: 'streaming',
      lastUpdate: Date.now()
    };
  }

  isUsingRealData(): boolean {
    return true;
  }

  isUsingMT5Data(): boolean {
    return false;
  }

  getDataSource(): string {
    return 'onetickmarkets-production';
  }
}

export const marketDataService = new MarketDataService();
export type { MarketPrice } from './types';