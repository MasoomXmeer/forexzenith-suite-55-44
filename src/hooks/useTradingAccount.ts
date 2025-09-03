import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext.minimal'
import { toast } from '@/hooks/use-toast'

export interface TradingAccount {
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

export const useTradingAccount = () => {
  const { user } = useAuth()
  const [primaryAccount, setPrimaryAccount] = useState<TradingAccount | null>(null)
  const [tradingAccounts, setTradingAccounts] = useState<TradingAccount[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      loadTradingAccounts()
    }
  }, [user])

  const loadTradingAccounts = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('trading_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setTradingAccounts(data || [])
      
      // Find primary account or create one if none exists
      const primary = data?.find(account => account.is_primary)
      if (primary) {
        setPrimaryAccount(primary)
      } else if (!data?.length) {
        // Create default trading account
        await createDefaultTradingAccount()
      } else {
        // Set first account as primary
        const firstAccount = data[0]
        await updateAccountAsPrimary(firstAccount.id)
        setPrimaryAccount(firstAccount)
      }
    } catch (error: any) {
      console.error('Error loading trading accounts:', error)
      toast({
        title: "Error",
        description: "Failed to load trading accounts",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const createDefaultTradingAccount = async () => {
    if (!user) return

    try {
      const accountNumber = `FZ${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`
      
      const { data, error } = await supabase
        .from('trading_accounts')
        .insert([{
          user_id: user.id,
          account_number: accountNumber,
          account_type: 'demo',
          platform: 'WebTrader',
          currency: 'USD',
          leverage: 100,
          balance: 10000,
          equity: 10000,
          margin: 0,
          free_margin: 10000,
          is_active: true,
          is_primary: true
        }])
        .select()
        .single()

      if (error) throw error

      setPrimaryAccount(data)
      setTradingAccounts([data])

      toast({
        title: "Trading Account Created",
        description: `Demo account ${accountNumber} has been created`,
      })
    } catch (error: any) {
      console.error('Error creating trading account:', error)
      toast({
        title: "Account Creation Failed",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const updateAccountAsPrimary = async (accountId: string) => {
    if (!user) return

    try {
      // Set all accounts as non-primary
      await supabase
        .from('trading_accounts')
        .update({ is_primary: false })
        .eq('user_id', user.id)

      // Set selected account as primary
      const { error } = await supabase
        .from('trading_accounts')
        .update({ is_primary: true })
        .eq('id', accountId)

      if (error) throw error

      await loadTradingAccounts()
    } catch (error: any) {
      console.error('Error updating primary account:', error)
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const updateAccountBalance = async (accountId: string, updates: {
    balance?: number
    equity?: number
    margin?: number
    free_margin?: number
  }) => {
    try {
      const { error } = await supabase
        .from('trading_accounts')
        .update(updates)
        .eq('id', accountId)

      if (error) throw error

      await loadTradingAccounts()
    } catch (error: any) {
      console.error('Error updating account balance:', error)
      throw error
    }
  }

  return {
    primaryAccount,
    tradingAccounts,
    isLoading,
    loadTradingAccounts,
    createDefaultTradingAccount,
    updateAccountAsPrimary,
    updateAccountBalance
  }
}