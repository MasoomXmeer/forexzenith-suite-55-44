
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

export interface Trade {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  amount: number;
  openPrice: number;
  currentPrice: number;
  leverage: number;
  timestamp: number;
  stopLoss?: number;
  takeProfit?: number;
  pnl: number;
  status: 'open' | 'closed';
}

export interface TradingAccount {
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
  totalPnL: number;
  todayPnL: number;
}

interface TradingState {
  account: TradingAccount;
  trades: Trade[];
  tradeHistory: Trade[];
  isLoading: boolean;
  isDemoMode: boolean;
}

type TradingAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'OPEN_TRADE'; payload: Omit<Trade, 'id' | 'timestamp' | 'pnl' | 'status'> }
  | { type: 'CLOSE_TRADE'; payload: string }
  | { type: 'UPDATE_PRICES'; payload: { symbol: string; price: number }[] }
  | { type: 'UPDATE_ACCOUNT'; payload: Partial<TradingAccount> }
  | { type: 'SET_DEMO_MODE'; payload: boolean };

const initialState: TradingState = {
  account: {
    balance: 10000,
    equity: 10000,
    margin: 0,
    freeMargin: 10000,
    marginLevel: 0,
    totalPnL: 0,
    todayPnL: 0,
  },
  trades: [],
  tradeHistory: [],
  isLoading: false,
  isDemoMode: true,
};

const tradingReducer = (state: TradingState, action: TradingAction): TradingState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'OPEN_TRADE': {
      const trade: Trade = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: Date.now(),
        pnl: 0,
        status: 'open',
      };

      // Calculate required margin
      const requiredMargin = (action.payload.amount / action.payload.leverage) * action.payload.openPrice;
      
      if (requiredMargin > state.account.freeMargin) {
        toast({
          title: "Insufficient Margin",
          description: "Not enough free margin to open this trade",
          variant: "destructive",
        });
        return state;
      }

      const newMargin = state.account.margin + requiredMargin;
      const newFreeMargin = state.account.freeMargin - requiredMargin;
      
      return {
        ...state,
        trades: [...state.trades, trade],
        account: {
          ...state.account,
          margin: newMargin,
          freeMargin: newFreeMargin,
          marginLevel: (state.account.equity / newMargin) * 100,
        },
      };
    }

    case 'CLOSE_TRADE': {
      const trade = state.trades.find(t => t.id === action.payload);
      if (!trade) return state;

      const closedTrade: Trade = {
        ...trade,
        status: 'closed',
      };

      // Calculate margin to release
      const marginToRelease = (trade.amount / trade.leverage) * trade.openPrice;
      const newMargin = state.account.margin - marginToRelease;
      const newFreeMargin = state.account.freeMargin + marginToRelease;
      const newBalance = state.account.balance + trade.pnl;

      return {
        ...state,
        trades: state.trades.filter(t => t.id !== action.payload),
        tradeHistory: [...state.tradeHistory, closedTrade],
        account: {
          ...state.account,
          balance: newBalance,
          margin: newMargin,
          freeMargin: newFreeMargin,
          marginLevel: newMargin > 0 ? (state.account.equity / newMargin) * 100 : 0,
          totalPnL: state.account.totalPnL + trade.pnl,
          todayPnL: state.account.todayPnL + trade.pnl,
        },
      };
    }

    case 'UPDATE_PRICES': {
      const updatedTrades = state.trades.map(trade => {
        const priceUpdate = action.payload.find(p => p.symbol === trade.symbol);
        if (!priceUpdate) return trade;

        const currentPrice = priceUpdate.price;
        let pnl = 0;

        if (trade.type === 'buy') {
          pnl = (currentPrice - trade.openPrice) * trade.amount;
        } else {
          pnl = (trade.openPrice - currentPrice) * trade.amount;
        }

        return {
          ...trade,
          currentPrice,
          pnl,
        };
      });

      const totalPnL = updatedTrades.reduce((sum, trade) => sum + trade.pnl, 0);
      const equity = state.account.balance + totalPnL;

      return {
        ...state,
        trades: updatedTrades,
        account: {
          ...state.account,
          equity,
          marginLevel: state.account.margin > 0 ? (equity / state.account.margin) * 100 : 0,
        },
      };
    }

    case 'UPDATE_ACCOUNT':
      return {
        ...state,
        account: { ...state.account, ...action.payload },
      };

    case 'SET_DEMO_MODE':
      return { ...state, isDemoMode: action.payload };

    default:
      return state;
  }
};

const TradingContext = createContext<{
  state: TradingState;
  dispatch: React.Dispatch<TradingAction>;
  openTrade: (tradeData: Omit<Trade, 'id' | 'timestamp' | 'pnl' | 'status'>) => void;
  closeTrade: (tradeId: string) => void;
  updatePrices: (priceUpdates: { symbol: string; price: number }[]) => void;
} | null>(null);

export const TradingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(tradingReducer, initialState);

  const openTrade = (tradeData: Omit<Trade, 'id' | 'timestamp' | 'pnl' | 'status'>) => {
    dispatch({ type: 'OPEN_TRADE', payload: tradeData });
    toast({
      title: "Trade Opened",
      description: `${tradeData.type.toUpperCase()} ${tradeData.symbol} - $${tradeData.amount}`,
    });
  };

  const closeTrade = (tradeId: string) => {
    dispatch({ type: 'CLOSE_TRADE', payload: tradeId });
    toast({
      title: "Trade Closed",
      description: "Position closed successfully",
    });
  };

  const updatePrices = (priceUpdates: { symbol: string; price: number }[]) => {
    dispatch({ type: 'UPDATE_PRICES', payload: priceUpdates });
  };

  return (
    <TradingContext.Provider value={{ state, dispatch, openTrade, closeTrade, updatePrices }}>
      {children}
    </TradingContext.Provider>
  );
};

export const useTrading = () => {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error('useTrading must be used within a TradingProvider');
  }
  return context;
};
