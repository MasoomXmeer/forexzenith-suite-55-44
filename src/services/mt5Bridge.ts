// MT5 Bridge Service - Data Only (No Trade Execution)
export interface MT5ConnectionConfig {
  accountId: string;
  password: string;
  server: string;
  isDemo: boolean;
}

export interface MT5MarketData {
  symbol: string;
  bid: number;
  ask: number;
  spread: number;
  timestamp: number;
  volume?: number;
}

export interface MT5SymbolInfo {
  symbol: string;
  description: string;
  digits: number;
  spread: number;
  contractSize: number;
  tickValue: number;
  tickSize: number;
  marginRequired: number;
}

class MT5DataBridge {
  private ws: WebSocket | null = null;
  private connectionConfig: MT5ConnectionConfig | null = null;
  private subscribedSymbols: Set<string> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000;
  private isConnecting = false;

  // Event callbacks
  private onPriceUpdate: ((data: MT5MarketData) => void) | null = null;
  private onConnectionStatus: ((status: 'connected' | 'disconnected' | 'error') => void) | null = null;

  constructor() {
    // Initialize with stored config if available
    this.loadStoredConfig();
  }

  // Configure MT5 connection (admin only)
  setConnectionConfig(config: MT5ConnectionConfig): void {
    this.connectionConfig = config;
    // Store encrypted config (in production, encrypt the password)
    localStorage.setItem('mt5_config', JSON.stringify({
      ...config,
      password: btoa(config.password) // Basic encoding, use proper encryption in production
    }));
  }

  private loadStoredConfig(): void {
    try {
      const stored = localStorage.getItem('mt5_config');
      if (stored) {
        const config = JSON.parse(stored);
        this.connectionConfig = {
          ...config,
          password: atob(config.password) // Decode password
        };
      }
    } catch (error) {
      console.error('Failed to load MT5 config:', error);
    }
  }

  // Connect to MT5 data feed via Supabase Edge Function
  async connect(): Promise<boolean> {
    if (!this.connectionConfig) {
      console.error('MT5 connection config not set');
      return false;
    }

    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return true;
    }

    this.isConnecting = true;

    try {
      // Connect through Supabase Edge Function
      const response = await fetch('/functions/v1/mt5-connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || ''}`
        },
        body: JSON.stringify(this.connectionConfig)
      });

      const result = await response.json();
      
      if (result.success) {
        // Start real-time WebSocket connection
        await this.connectRealTimeStream();
        
        this.reconnectAttempts = 0;
        this.isConnecting = false;
        this.onConnectionStatus?.('connected');
        
        return true;
      } else {
        throw new Error(result.error || 'Connection failed');
      }
    } catch (error) {
      console.error('MT5 connection failed:', error);
      this.isConnecting = false;
      this.onConnectionStatus?.('error');
      
      // Auto-reconnect
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        setTimeout(() => this.connect(), this.reconnectInterval);
      }
      
      return false;
    }
  }

  // Connect to real-time WebSocket stream
  private async connectRealTimeStream(): Promise<void> {
    try {
      const wsUrl = window.location.origin.replace('http', 'ws') + '/functions/v1/mt5-realtime';
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('Real-time MT5 WebSocket connected');
        // Subscribe to all current symbols
        if (this.subscribedSymbols.size > 0) {
          this.ws?.send(JSON.stringify({
            type: 'subscribe',
            symbols: Array.from(this.subscribedSymbols)
          }));
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'marketData') {
            this.onPriceUpdate?.(message.data);
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('Real-time MT5 WebSocket disconnected');
        this.onConnectionStatus?.('disconnected');
        
        // Auto-reconnect
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          setTimeout(() => this.connectRealTimeStream(), this.reconnectInterval);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.onConnectionStatus?.('error');
      };

    } catch (error) {
      console.error('Failed to connect real-time stream:', error);
      throw error;
    }
  }

  // Generate realistic MT5-style market data
  private generateRealisticMT5Data(symbol: string): MT5MarketData {
    // Base prices similar to real MT5 data
    const basePrices: { [key: string]: { bid: number; ask: number; spread: number } } = {
      'EURUSD': { bid: 1.08485, ask: 1.08495, spread: 1.0 },
      'GBPUSD': { bid: 1.26492, ask: 1.26508, spread: 1.6 },
      'USDJPY': { bid: 149.485, ask: 149.495, spread: 1.0 },
      'AUDUSD': { bid: 0.65785, ask: 0.65795, spread: 1.0 },
      'USDCAD': { bid: 1.37185, ask: 1.37205, spread: 2.0 },
      'USDCHF': { bid: 0.91785, ask: 0.91795, spread: 1.0 },
      'NZDUSD': { bid: 0.59185, ask: 0.59205, spread: 2.0 },
      'EURGBP': { bid: 0.85785, ask: 0.85805, spread: 2.0 },
      'EURJPY': { bid: 162.285, ask: 162.305, spread: 2.0 },
      'GBPJPY': { bid: 189.185, ask: 189.215, spread: 3.0 },
      'XAUUSD': { bid: 2025.35, ask: 2025.85, spread: 50 },
      'XAGUSD': { bid: 24.845, ask: 24.865, spread: 2.0 },
      'USOIL': { bid: 78.485, ask: 78.515, spread: 3.0 },
      'UKOIL': { bid: 82.285, ask: 82.315, spread: 3.0 },
      'US30': { bid: 37848.5, ask: 37850.5, spread: 2.0 },
      'US500': { bid: 4784.8, ask: 4785.2, spread: 0.4 },
      'NAS100': { bid: 16948.5, ask: 16950.5, spread: 2.0 },
      'GER30': { bid: 16418.5, ask: 16420.5, spread: 2.0 },
      'UK100': { bid: 7678.5, ask: 7680.5, spread: 2.0 },
      'JPN225': { bid: 33148.0, ask: 33152.0, spread: 4.0 }
    };

    const baseData = basePrices[symbol] || { bid: 1.0000, ask: 1.0001, spread: 1.0 };
    
    // Add small random fluctuations (typical MT5 behavior)
    const volatility = symbol.includes('JPY') ? 0.01 : 
                      symbol.startsWith('XAU') ? 0.5 : 
                      symbol.startsWith('US') ? 1.0 : 0.00005;
    
    const randomChange = (Math.random() - 0.5) * 2 * volatility;
    const currentBid = baseData.bid + randomChange;
    const spreadPips = baseData.spread * (symbol.includes('JPY') ? 0.01 : 0.00001);
    const currentAsk = currentBid + spreadPips;

    return {
      symbol,
      bid: Number(currentBid.toFixed(symbol.includes('JPY') ? 3 : 5)),
      ask: Number(currentAsk.toFixed(symbol.includes('JPY') ? 3 : 5)),
      spread: Number((currentAsk - currentBid).toFixed(symbol.includes('JPY') ? 3 : 5)),
      timestamp: Date.now(),
      volume: Math.floor(Math.random() * 1000) + 100
    };
  }

  // Subscribe to symbol price updates
  subscribeToSymbol(symbol: string): void {
    this.subscribedSymbols.add(symbol);
    console.log(`Subscribed to MT5 data for: ${symbol}`);
    
    // Send subscription to WebSocket if connected
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'subscribe',
        symbols: [symbol]
      }));
    }
  }

  // Unsubscribe from symbol
  unsubscribeFromSymbol(symbol: string): void {
    this.subscribedSymbols.delete(symbol);
    console.log(`Unsubscribed from MT5 data for: ${symbol}`);
    
    // Send unsubscription to WebSocket if connected
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'unsubscribe',
        symbols: [symbol]
      }));
    }
  }

  // Get current subscriptions
  getSubscribedSymbols(): string[] {
    return Array.from(this.subscribedSymbols);
  }

  // Set price update callback
  onPriceData(callback: (data: MT5MarketData) => void): void {
    this.onPriceUpdate = callback;
  }

  // Set connection status callback
  onConnection(callback: (status: 'connected' | 'disconnected' | 'error') => void): void {
    this.onConnectionStatus = callback;
  }

  // Get connection status
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN || this.connectionConfig !== null;
  }

  // Disconnect from MT5
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscribedSymbols.clear();
    this.onConnectionStatus?.('disconnected');
  }

  // Test connection with credentials
  async testConnection(config: MT5ConnectionConfig): Promise<boolean> {
    try {
      // In production, test actual MT5 connection
      console.log(`Testing MT5 connection to ${config.server} with account ${config.accountId}`);
      
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return config.accountId && config.password && config.server ? true : false;
    } catch (error) {
      console.error('MT5 connection test failed:', error);
      return false;
    }
  }

  // Get symbol information
  async getSymbolInfo(symbol: string): Promise<MT5SymbolInfo | null> {
    // In production, get from MT5
    const symbolInfoMap: { [key: string]: MT5SymbolInfo } = {
      'EURUSD': {
        symbol: 'EURUSD',
        description: 'Euro vs US Dollar',
        digits: 5,
        spread: 0.8,
        contractSize: 100000,
        tickValue: 1,
        tickSize: 0.00001,
        marginRequired: 0.5
      },
      'GBPUSD': {
        symbol: 'GBPUSD',
        description: 'British Pound vs US Dollar',
        digits: 5,
        spread: 1.2,
        contractSize: 100000,
        tickValue: 1,
        tickSize: 0.00001,
        marginRequired: 0.5
      },
      // Add more symbols as needed
    };

    return symbolInfoMap[symbol] || null;
  }
}

// Singleton instance
export const mt5Bridge = new MT5DataBridge();