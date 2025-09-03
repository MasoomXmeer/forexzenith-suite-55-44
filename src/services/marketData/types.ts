export interface MarketPrice {
  symbol: string;
  name: string;
  price: number;
  bid: number;
  ask: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  timestamp: number;
  category: string;
  source: string;
}

export interface ApiResponse {
  candles?: Array<{
    mid?: {
      o: string;
      h: string;
      l: string;
      c: string;
    };
    volume?: string;
  }>;
  errorMessage?: string;
}

export interface SymbolMapping {
  [key: string]: string;
}