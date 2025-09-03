import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';
import { useRealTimeSync } from './useRealTimeSync';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Trade = Database['public']['Tables']['trades']['Row'];
type TradingAccount = Database['public']['Tables']['trading_accounts']['Row'];
type AffiliateCommission = Database['public']['Tables']['affiliate_commissions']['Row'];

// Temporary types for admin functionality until full schema is implemented
interface Market {
  id: string;
  symbol: string;
  name: string;
  base_price: number;
  current_price: number;
  spread: number;
  is_active: boolean;
  market_hours_start: string;
  market_hours_end: string;
  created_at: string;
  updated_at: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  provider: string;
  is_enabled: boolean;
  configuration: any;
  created_at: string;
  updated_at: string;
}

interface Transaction {
  id: string;
  user_id: string;
  type: 'deposit' | 'withdrawal' | 'commission';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  payment_method_id?: string;
  created_at: string;
  updated_at: string;
}

interface PlatformSetting {
  id: string;
  key: string;
  value: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminStats {
  totalUsers: number;
  activeTrades: number;
  totalVolume: number;
  totalCommission: number;
  totalPortfolioValue: number;
  activePortfolios: number;
  totalPositions: number;
}

export const useAdminData = () => {
  // Use real-time sync for bi-directional updates
  const { syncData, isConnected, broadcastUpdate, refreshSync } = useRealTimeSync();
  
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeTrades: 0,
    totalVolume: 0,
    totalCommission: 0,
    totalPortfolioValue: 0,
    activePortfolios: 0,
    totalPositions: 0
  });
  const [users, setUsers] = useState<Profile[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [tradingAccounts, setTradingAccounts] = useState<TradingAccount[]>([]);
  const [affiliateCommissions, setAffiliateCommissions] = useState<AffiliateCommission[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<PlatformSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Update local state when sync data changes
  useEffect(() => {
    if (syncData) {
      // Only update if syncData.stats has the required properties
      if (syncData.stats && 'totalUsers' in syncData.stats) {
        setStats({
          ...stats,
          ...syncData.stats
        });
      }
      setUsers(syncData.users || []);
      setTrades(syncData.trades || []);
      setMarkets(syncData.markets || []);
      setTransactions(syncData.transactions || []);
      setLoading(false);
    }
  }, [syncData]);

  // Fetch admin statistics
  const fetchStats = async () => {
    try {
      // Calculate stats from existing tables
      const [usersRes, tradesRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('trades').select('id, amount, status', { count: 'exact' })
      ]);

      const totalUsers = usersRes.count || 0;
      const totalTrades = tradesRes.count || 0;
      const activeTrades = tradesRes.data?.filter(t => t.status === 'open').length || 0;
      const totalVolume = tradesRes.data?.reduce((sum, trade) => sum + trade.amount, 0) || 0;

      setStats({
        totalUsers,
        activeTrades,
        totalVolume,
        totalCommission: totalVolume * 0.001, // Rough commission calculation
        totalPortfolioValue: totalVolume * 10, // Estimated portfolio value
        activePortfolios: totalUsers, // Assuming each user has one portfolio
        totalPositions: totalTrades
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to fetch statistics');
    }
  };

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users');
    }
  };

  // Fetch all trades
  const fetchTrades = async () => {
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTrades(data || []);
    } catch (err) {
      console.error('Error fetching trades:', err);
      setError('Failed to fetch trades');
    }
  };

  // Fetch trading accounts
  const fetchTradingAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('trading_accounts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTradingAccounts(data || []);
    } catch (err) {
      console.error('Error fetching trading accounts:', err);
      setError('Failed to fetch trading accounts');
    }
  };

  // Fetch affiliate commissions
  const fetchAffiliateCommissions = async () => {
    try {
      const { data, error } = await supabase
        .from('affiliate_commissions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAffiliateCommissions(data || []);
    } catch (err) {
      console.error('Error fetching affiliate commissions:', err);
      setError('Failed to fetch affiliate commissions');
    }
  };

  // Fetch markets with safe fallback
  const fetchMarkets = async () => {
    try {
      const { data, error } = await supabase
        .from('markets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.log('Markets table not yet available');
        setMarkets([]);
      } else {
        setMarkets(data || []);
      }
    } catch (err) {
      console.log('Markets functionality not yet implemented');
      setMarkets([]);
    }
  };

  // Fetch payment methods with safe fallback
  const fetchPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.log('Payment methods table not yet available');
        setPaymentMethods([]);
      } else {
        setPaymentMethods(data || []);
      }
    } catch (err) {
      console.log('Payment methods functionality not yet implemented');
      setPaymentMethods([]);
    }
  };

  // Fetch transactions with safe fallback
  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.log('Transactions table not yet available');
        setTransactions([]);
      } else {
        setTransactions(data || []);
      }
    } catch (err) {
      console.log('Transactions functionality not yet implemented');
      setTransactions([]);
    }
  };

  // Fetch settings with safe fallback
  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .order('key', { ascending: true });
      
      if (error) {
        console.log('Platform settings table not yet available');
        setSettings([]);
      } else {
        setSettings(data || []);
      }
    } catch (err) {
      console.log('Settings functionality not yet implemented');
      setSettings([]);
    }
  };

  // Admin operations with safe error handling
  const createMarket = async (marketData: any) => {
    try {
      const { data, error } = await supabase
        .from('markets')
        .insert([marketData])
        .select()
        .single();
      
      if (error) throw error;
      await fetchMarkets();
      return data;
    } catch (err: any) {
      console.error('Create market error:', err);
      throw new Error('Unable to create market. Table may not be initialized.');
    }
  };

  const updateMarket = async (id: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('markets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      await fetchMarkets();
      return data;
    } catch (err: any) {
      console.error('Update market error:', err);
      throw new Error('Unable to update market. Table may not be initialized.');
    }
  };

  const deleteMarket = async (id: string) => {
    try {
      const { error } = await supabase
        .from('markets')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await fetchMarkets();
    } catch (err: any) {
      console.error('Delete market error:', err);
      throw new Error('Unable to delete market. Table may not be initialized.');
    }
  };

  const updatePaymentMethod = async (id: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      await fetchPaymentMethods();
      return data;
    } catch (err: any) {
      console.error('Update payment method error:', err);
      throw new Error('Payment methods functionality not yet available.');
    }
  };

  const updateSetting = async (key: string, value: string) => {
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .upsert({ key, value })
        .select()
        .single();
      
      if (error) throw error;
      await fetchSettings();
      return data;
    } catch (err: any) {
      console.error('Update setting error:', err);
      throw new Error('Settings functionality not yet available.');
    }
  };

  // Initial data fetch
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          fetchStats(),
          fetchUsers(),
          fetchTrades(),
          fetchTradingAccounts(),
          fetchAffiliateCommissions(),
          fetchMarkets(),
          fetchPaymentMethods(),
          fetchTransactions(),
          fetchSettings()
        ]);
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError('Failed to fetch admin data');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    const channels = [
      supabase
        .channel('trades_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'trades' }, () => {
          fetchTrades();
          fetchStats();
        }),
      
      supabase
        .channel('trading_accounts_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'trading_accounts' }, () => {
          fetchTradingAccounts();
        }),
      
      supabase
        .channel('profiles_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
          fetchUsers();
          fetchStats();
        })
    ];

    channels.forEach(channel => channel.subscribe());

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, []);

  return {
    stats,
    users,
    trades,
    tradingAccounts,
    affiliateCommissions,
    markets,
    paymentMethods,
    transactions,
    settings,
    loading,
    error,
    createMarket,
    updateMarket,
    deleteMarket,
    updatePaymentMethod,
    updateSetting,
    refetch: () => {
      fetchStats();
      fetchUsers();
      fetchTrades();
      fetchTradingAccounts();
      fetchAffiliateCommissions();
      fetchMarkets();
      fetchPaymentMethods();
      fetchTransactions();
      fetchSettings();
    }
  };
};