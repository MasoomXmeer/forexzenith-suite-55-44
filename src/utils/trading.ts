// Trading utilities and helpers
import { platformConfig } from '@/config/platform';

export interface MarketData {
  symbol: string;
  name: string;
  price: string;
  change: string;
  changePercent: string;
  isPositive: boolean;
  spread: number;
  timestamp: number;
}

export interface Trade {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  amount: number;
  openPrice: number;
  currentPrice?: number;
  closePrice?: number;
  leverage: string;
  pnl?: number;
  status: 'open' | 'closed';
  openTime: string;
  closeTime?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  accountType: 'standard' | 'premium' | 'vip';
  balance: number;
  kycStatus: 'pending' | 'verified' | 'rejected';
  createdAt: string;
}

// Market data generator for demo purposes
export const generateMarketData = (): MarketData[] => {
  return platformConfig.trading.supportedPairs.map((pair) => {
    const basePrice = Math.random() * 2 + 0.5; // Random price between 0.5 and 2.5
    const change = (Math.random() - 0.5) * 0.02; // Random change between -1% and +1%
    const changePercent = (change * 100).toFixed(2);
    
    return {
      symbol: pair.symbol,
      name: pair.name,
      price: basePrice.toFixed(4),
      change: change >= 0 ? `+${Math.abs(change).toFixed(4)}` : `-${Math.abs(change).toFixed(4)}`,
      changePercent: change >= 0 ? `+${changePercent}%` : `${changePercent}%`,
      isPositive: change >= 0,
      spread: pair.baseSpread,
      timestamp: Date.now()
    };
  });
};

// Calculate P&L for a trade
export const calculatePnL = (trade: Trade): number => {
  if (!trade.currentPrice) return 0;
  
  const priceDiff = trade.type === 'buy' 
    ? trade.currentPrice - trade.openPrice
    : trade.openPrice - trade.currentPrice;
    
  return priceDiff * trade.amount;
};

// Calculate required margin
export const calculateMargin = (amount: number, leverage: string): number => {
  const leverageRatio = parseInt(leverage.split(':')[1]);
  return amount / leverageRatio;
};

// Format currency
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Format percentage
export const formatPercentage = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

// Validate trade parameters
export const validateTrade = (
  symbol: string,
  amount: number,
  leverage: string
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check if symbol is supported
  const pair = platformConfig.trading.supportedPairs.find(p => p.symbol === symbol);
  if (!pair) {
    errors.push('Unsupported trading pair');
  } else {
    // Check lot size
    if (amount < pair.minLot) {
      errors.push(`Minimum lot size is ${pair.minLot}`);
    }
    if (amount > pair.maxLot) {
      errors.push(`Maximum lot size is ${pair.maxLot}`);
    }
  }
  
  // Check leverage
  const isValidLeverage = platformConfig.trading.leverageOptions.some(
    option => option.value === leverage
  );
  if (!isValidLeverage) {
    errors.push('Invalid leverage option');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// Generate trade ID
export const generateTradeId = (): string => {
  return `FZ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
};

// Get market status
export const getMarketStatus = (): 'open' | 'closed' | 'weekend' => {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 6 = Saturday
  const hour = now.getHours();
  
  // Weekend check
  if (day === 0 || day === 6) {
    return 'weekend';
  }
  
  // Forex market is generally open 24/5, but let's simulate some closure
  if (hour >= 0 && hour < 6) {
    return 'closed';
  }
  
  return 'open';
};

export default {
  generateMarketData,
  calculatePnL,
  calculateMargin,
  formatCurrency,
  formatPercentage,
  validateTrade,
  generateTradeId,
  getMarketStatus
};