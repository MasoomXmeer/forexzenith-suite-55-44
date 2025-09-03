import { useState, useEffect, useCallback } from 'react';
import { advancedTradingEngine, type TradeRequest, type TradePosition, type AccountMetrics } from '@/services/advancedTradingEngine';
import { useAuth } from '@/contexts/AuthContext.minimal';
import { useTradingAccount } from '@/hooks/useTradingAccount';
import { useRealTimeMarketData } from '@/hooks/useMarketData';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

export const useTradingLogic = () => {
  const { user } = useAuth();
  const { primaryAccount } = useTradingAccount();
  const [openPositions, setOpenPositions] = useState<TradePosition[]>([]);
  const [accountMetrics, setAccountMetrics] = useState<AccountMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Load open positions
  const loadPositions = useCallback(async () => {
    if (!user || !primaryAccount) return;
    
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .eq('trading_account_id', primaryAccount.id)
        .eq('status', 'open')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      const positions: TradePosition[] = data.map(trade => ({
        id: trade.id,
        symbol: trade.symbol,
        type: trade.type,
        amount: trade.amount,
        openPrice: trade.open_price,
        currentPrice: trade.current_price,
        leverage: trade.leverage,
        margin: trade.margin,
        stopLoss: trade.stop_loss,
        takeProfit: trade.take_profit,
        pnl: trade.pnl,
        pnlPercent: (trade.pnl / trade.margin) * 100,
        commission: trade.commission,
        swap: trade.swap || 0,
        status: trade.status,
        openTime: new Date(trade.created_at)
      }));
      
      setOpenPositions(positions);
    } catch (error: any) {
      console.error('Error loading positions:', error);
    }
  }, [user, primaryAccount]);
  
  // Load account metrics
  const loadAccountMetrics = useCallback(async () => {
    if (!primaryAccount) return;
    
    const metrics = await advancedTradingEngine.getAccountMetrics(primaryAccount.id);
    if (metrics) {
      setAccountMetrics(metrics);
    }
  }, [primaryAccount]);
  
  // Open a new trade
  const openTrade = async (request: TradeRequest) => {
    if (!user || !primaryAccount) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to place trades",
        variant: "destructive"
      });
      return false;
    }
    
    setIsLoading(true);
    
    try {
      // Validate trade first
      const validation = await advancedTradingEngine.validateTrade(
        user.id,
        primaryAccount.id,
        request
      );
      
      // Show warnings if any
      if (validation.warnings.length > 0) {
        validation.warnings.forEach(warning => {
          toast({
            title: "Trade Warning",
            description: warning,
            variant: "default"
          });
        });
      }
      
      // Show errors and stop if invalid
      if (!validation.valid) {
        validation.errors.forEach(error => {
          toast({
            title: "Trade Error",
            description: error,
            variant: "destructive"
          });
        });
        return false;
      }
      
      // Execute trade
      const result = await advancedTradingEngine.executeTrade(
        user.id,
        primaryAccount.id,
        request
      );
      
      if (result.success) {
        toast({
          title: "Trade Executed",
          description: `${request.type.toUpperCase()} ${request.symbol} - ${request.amount} lots`,
        });
        
        // Reload positions and metrics
        await loadPositions();
        await loadAccountMetrics();
        
        return true;
      } else {
        toast({
          title: "Trade Failed",
          description: result.error || "Failed to execute trade",
          variant: "destructive"
        });
        return false;
      }
    } catch (error: any) {
      toast({
        title: "Trade Error",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Close a position
  const closePosition = async (positionId: string) => {
    setIsLoading(true);
    
    try {
      const success = await advancedTradingEngine.closePosition(positionId, 'manual');
      
      if (success) {
        toast({
          title: "Position Closed",
          description: "Trade closed successfully",
        });
        
        // Reload positions and metrics
        await loadPositions();
        await loadAccountMetrics();
        
        return true;
      } else {
        toast({
          title: "Close Failed",
          description: "Failed to close position",
          variant: "destructive"
        });
        return false;
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calculate position size based on risk
  const calculatePositionSize = (
    riskPercent: number,
    stopLossPips: number,
    accountBalance: number
  ): number => {
    if (stopLossPips <= 0 || riskPercent <= 0) return 0;
    
    const riskAmount = (accountBalance * riskPercent) / 100;
    const pipValue = 10; // Standard pip value for 1 lot
    const positionSize = riskAmount / (stopLossPips * pipValue);
    
    // Round to 2 decimal places
    return Math.round(positionSize * 100) / 100;
  };
  
  // Calculate required margin
  const calculateRequiredMargin = (
    symbol: string,
    lotSize: number,
    leverage: number,
    currentPrice: number
  ): number => {
    const contractSize = 100000; // Standard lot
    return (lotSize * contractSize * currentPrice) / leverage;
  };
  
  // Get risk metrics for current positions
  const getRiskMetrics = () => {
    if (!accountMetrics) return null;
    
    const totalRisk = openPositions.reduce((sum, pos) => {
      if (pos.stopLoss) {
        const riskAmount = Math.abs(pos.openPrice - pos.stopLoss) * pos.amount * 100000;
        return sum + riskAmount;
      }
      return sum;
    }, 0);
    
    const riskPercent = accountMetrics.balance > 0 
      ? (totalRisk / accountMetrics.balance) * 100 
      : 0;
    
    return {
      totalRisk,
      riskPercent,
      marginUsed: (accountMetrics.margin / accountMetrics.equity) * 100,
      leverage: accountMetrics.margin > 0 ? accountMetrics.equity / accountMetrics.margin : 0,
      isOverLeveraged: accountMetrics.marginLevel < 100,
      isMarginCall: accountMetrics.marginLevel < 50,
      isStopOut: accountMetrics.marginLevel < 20
    };
  };
  
  // Subscribe to real-time updates
  useEffect(() => {
    if (!user || !primaryAccount) return;
    
    // Initial load
    loadPositions();
    loadAccountMetrics();
    
    // Subscribe to trade updates
    const subscription = supabase
      .channel('trading-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'trades',
        filter: `user_id=eq.${user.id}`
      }, () => {
        loadPositions();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'trading_accounts',
        filter: `id=eq.${primaryAccount.id}`
      }, () => {
        loadAccountMetrics();
      })
      .subscribe();
    
    // Refresh positions every 5 seconds for price updates
    const interval = setInterval(() => {
      loadPositions();
      loadAccountMetrics();
    }, 5000);
    
    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, [user, primaryAccount, loadPositions, loadAccountMetrics]);
  
  return {
    // State
    openPositions,
    accountMetrics,
    isLoading,
    
    // Actions
    openTrade,
    closePosition,
    
    // Utilities
    calculatePositionSize,
    calculateRequiredMargin,
    getRiskMetrics,
    
    // Refresh
    refresh: () => {
      loadPositions();
      loadAccountMetrics();
    }
  };
};