import { MarketPrice } from './types';

export class FallbackPriceProvider {
  private lastKnownPrices = new Map<string, MarketPrice>();
  private syntheticMovement = new Map<string, number>();

  private readonly baseRates: { [key: string]: number } = {
    'EURUSD': 1.08485, 'GBPUSD': 1.26492, 'USDJPY': 149.485,
    'AUDUSD': 0.65785, 'USDCAD': 1.37185, 'USDCHF': 0.91785,
    'NZDUSD': 0.59185, 'EURGBP': 0.85785, 'EURJPY': 162.285,
    'GBPJPY': 189.185, 'XAUUSD': 2025.35, 'XAGUSD': 24.845,
    'BTCUSD': 67500, 'ETHUSD': 3800, 'USOIL': 78.485,
    'US30': 37848.5, 'US500': 4784.8, 'NAS100': 16948.5
  };

  updateLastKnown(symbol: string, price: MarketPrice): void {
    this.lastKnownPrices.set(symbol, price);
  }

  getFallbackPrice(symbol: string): MarketPrice {
    const lastKnown = this.lastKnownPrices.get(symbol);
    
    if (lastKnown && (Date.now() - lastKnown.timestamp) < 60000) {
      // Use last known price with synthetic movement
      return this.createSyntheticPrice(symbol, lastKnown);
    }

    // Use base rates for complete fallback
    return this.createBasePrice(symbol);
  }

  private createSyntheticPrice(symbol: string, lastKnown: MarketPrice): MarketPrice {
    // Get or initialize synthetic movement
    let movement = this.syntheticMovement.get(symbol) || 0;
    
    // Random walk with mean reversion
    const volatility = this.getVolatility(symbol);
    const randomWalk = (Math.random() - 0.5) * volatility;
    const meanReversion = -movement * 0.1; // 10% mean reversion
    
    movement = movement + randomWalk + meanReversion;
    this.syntheticMovement.set(symbol, movement);

    const syntheticPrice = lastKnown.price * (1 + movement / 10000);
    const spread = this.getSpread(symbol);
    
    return {
      ...lastKnown,
      price: Number(syntheticPrice.toFixed(this.getDecimalPlaces(symbol))),
      bid: Number((syntheticPrice - spread / 2).toFixed(this.getDecimalPlaces(symbol))),
      ask: Number((syntheticPrice + spread / 2).toFixed(this.getDecimalPlaces(symbol))),
      timestamp: Date.now(),
      source: 'synthetic'
    };
  }

  private createBasePrice(symbol: string): MarketPrice {
    const basePrice = this.baseRates[symbol] || 1.0000;
    const volatility = this.getVolatility(symbol) / 1000;
    const randomFactor = (Math.random() - 0.5) * 2 * volatility;
    const currentPrice = basePrice * (1 + randomFactor);
    
    const spread = this.getSpread(symbol);
    const bid = currentPrice - spread / 2;
    const ask = currentPrice + spread / 2;
    
    const changePercent = (Math.random() - 0.5) * 2;
    const change = currentPrice * (changePercent / 100);

    return {
      symbol,
      name: this.getSymbolName(symbol),
      price: Number(currentPrice.toFixed(this.getDecimalPlaces(symbol))),
      bid: Number(bid.toFixed(this.getDecimalPlaces(symbol))),
      ask: Number(ask.toFixed(this.getDecimalPlaces(symbol))),
      change: Number(change.toFixed(this.getDecimalPlaces(symbol))),
      changePercent: Number(changePercent.toFixed(2)),
      high: Number((currentPrice * 1.002).toFixed(this.getDecimalPlaces(symbol))),
      low: Number((currentPrice * 0.998).toFixed(this.getDecimalPlaces(symbol))),
      volume: Math.floor(Math.random() * 500000) + 50000,
      timestamp: Date.now(),
      category: this.getSymbolCategory(symbol),
      source: 'fallback'
    };
  }

  private getVolatility(symbol: string): number {
    if (symbol.includes('BTC') || symbol.includes('ETH')) return 20;
    if (symbol.startsWith('XAU') || symbol.startsWith('XAG')) return 10;
    if (symbol.includes('JPY')) return 8;
    if (symbol.includes('OIL')) return 15;
    return 5;
  }

  private getSpread(symbol: string): number {
    const baseSpread = symbol.includes('JPY') ? 0.01 : 0.0001;
    return baseSpread * (1 + Math.random() * 0.5);
  }

  private getDecimalPlaces(symbol: string): number {
    if (symbol.includes('JPY')) return 3;
    if (symbol.startsWith('XAU')) return 2;
    if (symbol.startsWith('XAG')) return 3;
    if (symbol.includes('BTC') || symbol.includes('ETH')) return 2;
    if (symbol.includes('OIL')) return 3;
    if (['US30', 'US500', 'NAS100'].includes(symbol)) return 1;
    return 5;
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
      'BTCUSD': 'Bitcoin/US Dollar',
      'ETHUSD': 'Ethereum/US Dollar',
      'USOIL': 'US Crude Oil',
      'US30': 'Dow Jones 30',
      'US500': 'S&P 500',
      'NAS100': 'NASDAQ 100'
    };
    return names[symbol] || symbol;
  }

  private getSymbolCategory(symbol: string): string {
    if (symbol.includes('BTC') || symbol.includes('ETH')) return 'Crypto';
    if (symbol.startsWith('XAU') || symbol.startsWith('XAG')) return 'Metals';
    if (symbol.includes('OIL')) return 'Energy';
    if (symbol.includes('US') || symbol.includes('NAS')) return 'Indices';
    return 'Forex';
  }
}