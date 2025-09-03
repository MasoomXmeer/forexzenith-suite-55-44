import { useEffect, useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface SyncData {
  trades: any[];
  users: any[];
  markets: any[];
  transactions: any[];
  stats: {
    totalUsers: number;
    activeTrades: number;
    totalVolume: number;
    totalCommission: number;
  };
}

export const useRealTimeSync = () => {
  const [syncData, setSyncData] = useState<SyncData>({
    trades: [],
    users: [],
    markets: [],
    transactions: [],
    stats: {
      totalUsers: 0,
      activeTrades: 0,
      totalVolume: 0,
      totalCommission: 0
    }
  });
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  // Fetch complete sync data
  const fetchSyncData = useCallback(async () => {
    try {
      const [tradesRes, usersRes] = await Promise.all([
        supabase.from('trades').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').order('created_at', { ascending: false })
      ]);

      const trades = tradesRes.data || [];
      const users = usersRes.data || [];

      // Calculate real-time stats
      const stats = {
        totalUsers: users.length,
        activeTrades: trades.filter(t => t.status === 'open').length,
        totalVolume: trades.reduce((sum, trade) => sum + (trade.amount || 0), 0),
        totalCommission: trades.reduce((sum, trade) => sum + (trade.amount * 0.001 || 0), 0)
      };

      setSyncData({
        trades,
        users,
        markets: [], // Will be populated when markets table is implemented
        transactions: [], // Will be populated when transactions table is implemented
        stats
      });

      setIsConnected(true);
    } catch (error) {
      console.error('Sync data fetch error:', error);
      setIsConnected(false);
      toast({
        title: "Sync Error",
        description: "Failed to sync data between admin and user panels",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Set up real-time subscriptions for bi-directional sync
  useEffect(() => {
    // Initial data fetch
    fetchSyncData();

    // Set up real-time subscriptions
    const channels = [
      supabase
        .channel('trades_sync')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'trades' }, 
          (payload) => {
            console.log('Real-time trades sync:', payload);
            fetchSyncData();
          }
        ),
      
      supabase
        .channel('profiles_sync')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'profiles' }, 
          (payload) => {
            console.log('Real-time profiles sync:', payload);
            fetchSyncData();
          }
        ),
      
      supabase
        .channel('trading_accounts_sync')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'trading_accounts' }, 
          (payload) => {
            console.log('Real-time trading accounts sync:', payload);
            fetchSyncData();
          }
        )
    ];

    // Subscribe to all channels
    channels.forEach(channel => channel.subscribe());

    // Cleanup subscriptions
    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [fetchSyncData]);

  // Broadcasting function for cross-panel communication
  const broadcastUpdate = useCallback((type: string, data: any) => {
    window.dispatchEvent(new CustomEvent('syncUpdate', {
      detail: { type, data }
    }));
  }, []);

  // Listen for broadcast updates
  useEffect(() => {
    const handleSyncUpdate = (event: CustomEvent) => {
      console.log('Received sync update:', event.detail);
      fetchSyncData();
    };

    window.addEventListener('syncUpdate', handleSyncUpdate as EventListener);
    
    return () => {
      window.removeEventListener('syncUpdate', handleSyncUpdate as EventListener);
    };
  }, [fetchSyncData]);

  return {
    syncData,
    isConnected,
    broadcastUpdate,
    refreshSync: fetchSyncData
  };
};