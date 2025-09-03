
import { createClient } from '@supabase/supabase-js'
import { envConfig } from '@/utils/envValidator'
import { errorLogger } from '@/utils/errorLogger'

// Validate environment variables on initialization
const { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } = envConfig

export const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-application-name': 'AonePrimeFX'
    }
  }
})

// Global error handler for Supabase operations
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    errorLogger.info('User signed out')
  } else if (event === 'SIGNED_IN') {
    errorLogger.info('User signed in', { userId: session?.user.id })
  } else if (event === 'TOKEN_REFRESHED') {
    errorLogger.info('Auth token refreshed')
  }
})

// Production-ready database types
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          account_type: 'standard' | 'premium' | 'vip'
          balance: number
          equity: number
          margin: number
          free_margin: number
          kyc_status: 'pending' | 'verified' | 'rejected'
          is_affiliate: boolean
          referral_code: string | null
          referred_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name: string
          last_name: string
          account_type?: 'standard' | 'premium' | 'vip'
          balance?: number
          equity?: number
          margin?: number
          free_margin?: number
          kyc_status?: 'pending' | 'verified' | 'rejected'
        }
        Update: {
          first_name?: string
          last_name?: string
          account_type?: 'standard' | 'premium' | 'vip'
          balance?: number
          equity?: number
          margin?: number
          free_margin?: number
          kyc_status?: 'pending' | 'verified' | 'rejected'
          is_affiliate?: boolean
          referral_code?: string
          referred_by?: string
        }
      }
      trading_accounts: {
        Row: {
          id: string
          user_id: string
          account_number: string
          account_type: 'demo' | 'micro' | 'standard' | 'zero' | 'ultra_low'
          platform: 'MT4' | 'MT5' | 'WebTrader'
          currency: string
          leverage: number
          balance: number
          equity: number
          margin: number
          free_margin: number
          is_active: boolean
          is_primary: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          account_number: string
          account_type: 'demo' | 'micro' | 'standard' | 'zero' | 'ultra_low'
          platform: 'MT4' | 'MT5' | 'WebTrader'
          currency?: string
          leverage?: number
          balance?: number
          equity?: number
          margin?: number
          free_margin?: number
          is_active?: boolean
          is_primary?: boolean
        }
        Update: {
          balance?: number
          equity?: number
          margin?: number
          free_margin?: number
          is_active?: boolean
          is_primary?: boolean
        }
      }
      trades: {
        Row: {
          id: string
          user_id: string
          trading_account_id: string
          symbol: string
          type: 'buy' | 'sell'
          amount: number
          open_price: number
          current_price: number
          leverage: number
          stop_loss: number | null
          take_profit: number | null
          pnl: number
          status: 'open' | 'closed'
          created_at: string
          closed_at: string | null
        }
        Insert: {
          user_id: string
          trading_account_id: string
          symbol: string
          type: 'buy' | 'sell'
          amount: number
          open_price: number
          current_price: number
          leverage: number
          stop_loss?: number | null
          take_profit?: number | null
          pnl?: number
          status?: 'open' | 'closed'
        }
        Update: {
          current_price?: number
          pnl?: number
          status?: 'open' | 'closed'
          closed_at?: string | null
          stop_loss?: number | null
          take_profit?: number | null
        }
      }
      affiliate_commissions: {
        Row: {
          id: string
          affiliate_id: string
          referred_user_id: string
          commission_type: 'signup_bonus' | 'revenue_share' | 'trading_volume'
          amount: number
          currency: string
          trade_id: string | null
          status: 'pending' | 'approved' | 'paid'
          created_at: string
          paid_at: string | null
        }
        Insert: {
          affiliate_id: string
          referred_user_id: string
          commission_type: 'signup_bonus' | 'revenue_share' | 'trading_volume'
          amount: number
          currency?: string
          trade_id?: string | null
          status?: 'pending' | 'approved' | 'paid'
        }
        Update: {
          status?: 'pending' | 'approved' | 'paid'
          paid_at?: string | null
        }
      }
      affiliate_payouts: {
        Row: {
          id: string
          affiliate_id: string
          amount: number
          currency: string
          status: 'pending' | 'processing' | 'completed' | 'failed'
          payment_method: string | null
          payment_details: any
          created_at: string
          processed_at: string | null
        }
        Insert: {
          affiliate_id: string
          amount: number
          currency?: string
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          payment_method?: string | null
          payment_details?: any
        }
        Update: {
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          processed_at?: string | null
        }
      }
      markets: {
        Row: {
          id: string
          symbol: string
          name: string
          base_price: number
          current_price: number
          spread: number
          is_active: boolean
          market_hours_start: string
          market_hours_end: string
          created_at: string
          updated_at: string
        }
        Insert: {
          symbol: string
          name: string
          base_price: number
          current_price?: number
          spread?: number
          is_active?: boolean
          market_hours_start?: string
          market_hours_end?: string
        }
        Update: {
          name?: string
          base_price?: number
          current_price?: number
          spread?: number
          is_active?: boolean
          market_hours_start?: string
          market_hours_end?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          type: 'deposit' | 'withdrawal' | 'commission'
          amount: number
          currency: string
          status: 'pending' | 'completed' | 'failed'
          payment_method_id: string | null
          transaction_hash: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          type: 'deposit' | 'withdrawal' | 'commission'
          amount: number
          currency?: string
          status?: 'pending' | 'completed' | 'failed'
          payment_method_id?: string | null
          transaction_hash?: string | null
        }
        Update: {
          status?: 'pending' | 'completed' | 'failed'
          transaction_hash?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_admin_stats: {
        Args: {}
        Returns: {
          total_users: number
          active_trades: number
          total_volume: number
          total_commission: number
        }[]
      }
      update_market_prices: {
        Args: {}
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Export typed supabase client
export type SupabaseClient = typeof supabase
