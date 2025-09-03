import { supabase } from '@/lib/supabase';

export interface AffiliateStats {
  totalReferrals: number;
  activeReferrals: number;
  totalEarnings: number;
  thisMonthEarnings: number;
  pendingPayouts: number;
}

export const calculateCommission = (trade: any, commissionRate: number = 0.1): number => {
  // Calculate commission based on trade volume
  const tradeVolume = trade.amount * trade.leverage;
  return tradeVolume * commissionRate;
};

export const generateReferralCode = (userId: string): string => {
  return `XM-${userId.slice(0, 8).toUpperCase()}`;
};

export const processAffiliateCommission = async (
  affiliateId: string,
  referredUserId: string,
  trade: any,
  commissionType: 'signup_bonus' | 'revenue_share' | 'trading_volume' = 'trading_volume'
) => {
  try {
    let amount = 0;
    
    switch (commissionType) {
      case 'signup_bonus':
        amount = 50; // $50 for each new referral
        break;
      case 'revenue_share':
        amount = calculateCommission(trade, 0.1); // 10% revenue share
        break;
      case 'trading_volume':
        amount = calculateCommission(trade, 0.001); // 0.1% of trading volume
        break;
    }

    const { data, error } = await supabase
      .from('affiliate_commissions')
      .insert([{
        affiliate_id: affiliateId,
        referred_user_id: referredUserId,
        commission_type: commissionType,
        amount,
        trade_id: trade?.id,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error processing affiliate commission:', error);
    throw error;
  }
};

export const getAffiliateStats = async (affiliateId: string): Promise<AffiliateStats> => {
  try {
    // Get referrals
    const { data: referrals } = await supabase
      .from('profiles')
      .select('id, balance, created_at')
      .eq('referred_by', affiliateId);

    // Get commissions
    const { data: commissions } = await supabase
      .from('affiliate_commissions')
      .select('amount, created_at, status')
      .eq('affiliate_id', affiliateId);

    // Get payouts
    const { data: payouts } = await supabase
      .from('affiliate_payouts')
      .select('amount, status')
      .eq('affiliate_id', affiliateId);

    const totalReferrals = referrals?.length || 0;
    const activeReferrals = referrals?.filter(ref => ref.balance > 0).length || 0;
    
    const totalEarnings = commissions?.filter(c => c.status === 'paid')
      .reduce((sum, comm) => sum + comm.amount, 0) || 0;
    
    const thisMonth = new Date();
    const firstDayOfMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
    
    const thisMonthEarnings = commissions?.filter(comm => 
      new Date(comm.created_at) >= firstDayOfMonth && comm.status === 'paid'
    ).reduce((sum, comm) => sum + comm.amount, 0) || 0;

    const pendingPayouts = payouts?.filter(payout => payout.status === 'pending')
      .reduce((sum, payout) => sum + payout.amount, 0) || 0;

    return {
      totalReferrals,
      activeReferrals,
      totalEarnings,
      thisMonthEarnings,
      pendingPayouts
    };
  } catch (error) {
    console.error('Error getting affiliate stats:', error);
    return {
      totalReferrals: 0,
      activeReferrals: 0,
      totalEarnings: 0,
      thisMonthEarnings: 0,
      pendingPayouts: 0
    };
  }
};

export const validateReferralCode = async (referralCode: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('referral_code', referralCode)
      .eq('is_affiliate', true)
      .single();

    return !error && !!data;
  } catch (error) {
    return false;
  }
};