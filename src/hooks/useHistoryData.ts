import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext.minimal';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/lib/supabase';

type Trade = Database['public']['Tables']['trades']['Row'];
type Transaction = Database['public']['Tables']['transactions']['Row'];
type TradingAccount = Database['public']['Tables']['trading_accounts']['Row'];

export interface HistorySummary {
  totalDeposits: number;
  totalWithdrawals: number;
  totalRequestedWithdrawals: number;
  totalProfitLoss: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export const useHistoryData = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [trades, setTrades] = useState<Trade[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tradingAccounts, setTradingAccounts] = useState<TradingAccount[]>([]);
  const [summary, setSummary] = useState<HistorySummary>({
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalRequestedWithdrawals: 0,
    totalProfitLoss: 0,
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Default date ranges
  const getDateRange = useCallback((period: 'all' | '3months' | 'lastMonth'): DateRange => {
    const now = new Date();
    const from = new Date();
    
    switch (period) {
      case '3months':
        from.setMonth(now.getMonth() - 3);
        break;
      case 'lastMonth':
        from.setMonth(now.getMonth() - 1);
        break;
      case 'all':
      default:
        from.setFullYear(2020); // Far back date for "all"
        break;
    }
    
    return { from, to: now };
  }, []);

  // Fetch user's trades with optional date filtering
  const fetchTrades = useCallback(async (dateRange?: DateRange) => {
    if (!user) return [];
    
    try {
      let query = supabase
        .from('trades')
        .select(`
          *,
          trading_account:trading_accounts(account_number, account_type, platform)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (dateRange) {
        query = query
          .gte('created_at', dateRange.from.toISOString())
          .lte('created_at', dateRange.to.toISOString());
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching trades:', error);
        return [];
      }
      
      return data || [];
    } catch (err) {
      console.error('Error fetching trades:', err);
      return [];
    }
  }, [user]);

  // Fetch user's transactions with optional date filtering  
  const fetchTransactions = useCallback(async (dateRange?: DateRange) => {
    if (!user) return [];
    
    try {
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (dateRange) {
        query = query
          .gte('created_at', dateRange.from.toISOString())
          .lte('created_at', dateRange.to.toISOString());
      }

      const { data, error } = await query;
      
      if (error) {
        // Table might not exist yet, return empty array
        console.log('Transactions table not yet available');
        return [];
      }
      
      return data || [];
    } catch (err) {
      console.log('Transactions functionality not yet implemented');
      return [];
    }
  }, [user]);

  // Fetch user's trading accounts
  const fetchTradingAccounts = useCallback(async () => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('trading_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching trading accounts:', error);
        return [];
      }
      
      return data || [];
    } catch (err) {
      console.error('Error fetching trading accounts:', err);
      return [];
    }
  }, [user]);

  // Calculate summary statistics
  const calculateSummary = useCallback((trades: Trade[], transactions: Transaction[]): HistorySummary => {
    const deposits = transactions.filter(t => t.type === 'deposit' && t.status === 'completed');
    const withdrawals = transactions.filter(t => t.type === 'withdrawal' && t.status === 'completed');
    const requestedWithdrawals = transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending');
    
    const closedTrades = trades.filter(t => t.status === 'closed');
    const winningTrades = closedTrades.filter(t => t.pnl > 0);
    const losingTrades = closedTrades.filter(t => t.pnl < 0);
    
    return {
      totalDeposits: deposits.reduce((sum, t) => sum + t.amount, 0),
      totalWithdrawals: withdrawals.reduce((sum, t) => sum + t.amount, 0),
      totalRequestedWithdrawals: requestedWithdrawals.reduce((sum, t) => sum + t.amount, 0),
      totalProfitLoss: closedTrades.reduce((sum, t) => sum + t.pnl, 0),
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length
    };
  }, []);

  // Fetch all history data
  const fetchHistoryData = useCallback(async (period: 'all' | '3months' | 'lastMonth' = 'lastMonth') => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const dateRange = getDateRange(period);
      
      const [tradesData, transactionsData, accountsData] = await Promise.all([
        fetchTrades(dateRange),
        fetchTransactions(dateRange),
        fetchTradingAccounts()
      ]);
      
      setTrades(tradesData);
      setTransactions(transactionsData);
      setTradingAccounts(accountsData);
      setSummary(calculateSummary(tradesData, transactionsData));
      
    } catch (err: any) {
      console.error('Error fetching history data:', err);
      setError('Failed to fetch history data');
      toast({
        title: "Error",
        description: "Failed to fetch history data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, getDateRange, fetchTrades, fetchTransactions, fetchTradingAccounts, calculateSummary, toast]);

  // Fetch data with custom date range
  const fetchHistoryDataByDateRange = useCallback(async (dateRange: DateRange) => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [tradesData, transactionsData] = await Promise.all([
        fetchTrades(dateRange),
        fetchTransactions(dateRange)
      ]);
      
      setTrades(tradesData);
      setTransactions(transactionsData);
      setSummary(calculateSummary(tradesData, transactionsData));
      
    } catch (err: any) {
      console.error('Error fetching history data by date range:', err);
      setError('Failed to fetch history data');
      toast({
        title: "Error", 
        description: "Failed to fetch history data for selected period",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, fetchTrades, fetchTransactions, calculateSummary, toast]);

  // Initial data load
  useEffect(() => {
    if (user) {
      fetchHistoryData('lastMonth');
    }
  }, [user, fetchHistoryData]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const channels = [
      supabase
        .channel('user_trades_changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'trades',
            filter: `user_id=eq.${user.id}`
          }, 
          () => {
            console.log('Real-time user trades update');
            fetchHistoryData();
          }
        ),
      
      supabase
        .channel('user_transactions_changes') 
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'transactions',
            filter: `user_id=eq.${user.id}`
          }, 
          () => {
            console.log('Real-time user transactions update');
            fetchHistoryData();
          }
        ),
      
      supabase
        .channel('user_trading_accounts_changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'trading_accounts',
            filter: `user_id=eq.${user.id}`
          }, 
          () => {
            console.log('Real-time user trading accounts update');
            fetchTradingAccounts().then(data => setTradingAccounts(data));
          }
        )
    ];

    // Subscribe to all channels
    channels.forEach(channel => channel.subscribe());

    // Cleanup subscriptions
    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [user, fetchHistoryData, fetchTradingAccounts]);

  return {
    trades,
    transactions,
    tradingAccounts,
    summary,
    loading,
    error,
    fetchHistoryData,
    fetchHistoryDataByDateRange,
    getDateRange,
    refetch: () => fetchHistoryData()
  };
};