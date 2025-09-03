import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext.minimal';
import { toast } from '@/hooks/use-toast';

export interface CopyTrader {
  id: string;
  user_id: string;
  trader_name: string;
  description?: string;
  trading_strategy?: string;
  risk_level: number;
  minimum_investment: number;
  maximum_investment: number;
  profit_share_percentage: number;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  performance_return_1m: number;
  performance_return_3m: number;
  performance_return_1y: number;
  win_rate: number;
  max_drawdown: number;
  total_followers: number;
  total_copiers: number;
  is_verified: boolean;
}

export interface CopyRelationship {
  id: string;
  copier_user_id: string;
  trader_user_id: string;
  allocated_amount: number;
  copy_ratio: number;
  max_risk_percentage: number;
  follow_stop_loss: boolean;
  follow_take_profit: boolean;
  status: 'active' | 'paused' | 'stopped';
  total_profit_loss: number;
  current_value: number;
  trader?: CopyTrader;
}

export interface TraderApplicationData {
  trader_name: string;
  description: string;
  trading_strategy: string;
  risk_level: number;
  minimum_investment: number;
  maximum_investment: number;
}

export const useCopyTrading = () => {
  const { user } = useAuth();
  const [copyTraders, setCopyTraders] = useState<CopyTrader[]>([]);
  const [myCopyRelationships, setMyCopyRelationships] = useState<CopyRelationship[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load available copy traders
  const loadCopyTraders = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('copy_traders')
        .select('*')
        .eq('status', 'approved')
        .order('total_copiers', { ascending: false });

      if (error) throw error;
      setCopyTraders(data || []);
    } catch (error: any) {
      console.error('Error loading copy traders:', error);
      toast({
        title: "Error",
        description: "Failed to load copy traders",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load user's copy relationships
  const loadMyCopyRelationships = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('copy_relationships')
        .select(`
          *,
          trader:copy_traders!copy_relationships_trader_user_id_fkey(*)
        `)
        .eq('copier_user_id', user.id)
        .neq('status', 'stopped');

      if (error) throw error;
      setMyCopyRelationships(data || []);
    } catch (error: any) {
      console.error('Error loading copy relationships:', error);
    }
  };

  // Apply to become a copy trader
  const applyToBecomeCopyTrader = async (applicationData: TraderApplicationData): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('copy_traders')
        .insert([{
          user_id: user.id,
          ...applicationData,
          status: 'pending'
        }]);

      if (error) throw error;

      toast({
        title: "Application Submitted",
        description: "Your copy trader application has been submitted for review. You'll be notified once approved.",
      });

      return true;
    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast({
        title: "Application Failed",
        description: error.message || "Failed to submit application",
        variant: "destructive"
      });
      return false;
    }
  };

  // Start copying a trader
  const startCopyingTrader = async (
    traderId: string, 
    allocatedAmount: number,
    copyRatio: number = 100,
    maxRiskPercentage: number = 10,
    followStopLoss: boolean = true,
    followTakeProfit: boolean = true
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      // Check if user has sufficient funds
      const { data: account } = await supabase
        .from('trading_accounts')
        .select('id, free_margin')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .single();

      if (!account || account.free_margin < allocatedAmount) {
        toast({
          title: "Insufficient Funds",
          description: "You don't have enough free margin to allocate this amount",
          variant: "destructive"
        });
        return false;
      }

      const { error } = await supabase
        .from('copy_relationships')
        .insert([{
          copier_user_id: user.id,
          trader_user_id: traderId,
          allocated_amount: allocatedAmount,
          copy_ratio: copyRatio,
          max_risk_percentage: maxRiskPercentage,
          follow_stop_loss: followStopLoss,
          follow_take_profit: followTakeProfit,
          current_value: allocatedAmount,
          status: 'active'
        }]);

      if (error) throw error;

      // Update account free margin
      await supabase.rpc('update_account_after_trade', {
        p_account_id: account.id,
        p_margin_change: allocatedAmount,
        p_commission: 0
      });

      toast({
        title: "Copy Trading Started",
        description: `Successfully started copying trader with $${allocatedAmount} allocated`,
      });

      await loadMyCopyRelationships();
      return true;
    } catch (error: any) {
      console.error('Error starting copy trading:', error);
      toast({
        title: "Failed to Start Copying",
        description: error.message || "Failed to start copy trading",
        variant: "destructive"
      });
      return false;
    }
  };

  // Update copy settings
  const updateCopySettings = async (
    relationshipId: string,
    settings: {
      allocated_amount?: number;
      copy_ratio?: number;
      max_risk_percentage?: number;
      follow_stop_loss?: boolean;
      follow_take_profit?: boolean;
    }
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('copy_relationships')
        .update(settings)
        .eq('id', relationshipId);

      if (error) throw error;

      toast({
        title: "Settings Updated",
        description: "Copy trading settings have been updated successfully",
      });

      await loadMyCopyRelationships();
      return true;
    } catch (error: any) {
      console.error('Error updating copy settings:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update settings",
        variant: "destructive"
      });
      return false;
    }
  };

  // Pause/Resume copy trading
  const toggleCopyStatus = async (relationshipId: string, currentStatus: string): Promise<boolean> => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';

    try {
      const { error } = await supabase
        .from('copy_relationships')
        .update({ status: newStatus })
        .eq('id', relationshipId);

      if (error) throw error;

      toast({
        title: newStatus === 'active' ? "Copy Resumed" : "Copy Paused",
        description: `Copy trading has been ${newStatus === 'active' ? 'resumed' : 'paused'}`,
      });

      await loadMyCopyRelationships();
      return true;
    } catch (error: any) {
      console.error('Error toggling copy status:', error);
      return false;
    }
  };

  // Stop copy trading
  const stopCopyTrading = async (relationshipId: string): Promise<boolean> => {
    try {
      const relationship = myCopyRelationships.find(r => r.id === relationshipId);
      if (!relationship) return false;

      // Update status to stopped
      const { error } = await supabase
        .from('copy_relationships')
        .update({ 
          status: 'stopped',
          end_date: new Date().toISOString()
        })
        .eq('id', relationshipId);

      if (error) throw error;

      // Release allocated funds back to free margin  
      await supabase.rpc('close_position_update_account', {
        p_account_id: relationship.copier_user_id,
        p_margin_release: relationship.allocated_amount,
        p_pnl: 0
      });

      toast({
        title: "Copy Trading Stopped",
        description: "Copy trading has been stopped and funds released",
        variant: "destructive"
      });

      await loadMyCopyRelationships();
      return true;
    } catch (error: any) {
      console.error('Error stopping copy trading:', error);
      return false;
    }
  };

  // Check if user is already a copy trader
  const checkCopyTraderStatus = async (): Promise<CopyTrader | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('copy_traders')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error: any) {
      console.error('Error checking copy trader status:', error);
      return null;
    }
  };

  useEffect(() => {
    if (user) {
      loadCopyTraders();
      loadMyCopyRelationships();
    }
  }, [user]);

  return {
    copyTraders,
    myCopyRelationships,
    isLoading,
    loadCopyTraders,
    loadMyCopyRelationships,
    applyToBecomeCopyTrader,
    startCopyingTrader,
    updateCopySettings,
    toggleCopyStatus,
    stopCopyTrading,
    checkCopyTraderStatus
  };
};