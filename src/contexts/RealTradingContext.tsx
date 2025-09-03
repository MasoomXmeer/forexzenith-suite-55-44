
import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './AuthContext.minimal'
import { useTradingAccount } from '@/hooks/useTradingAccount'
import { toast } from '@/hooks/use-toast'
import { errorLogger } from '@/utils/errorLogger'
import { tradingEngine, type TradeValidationResult } from '@/services/tradingEngine'

export interface RealTrade {
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

interface RealTradingContextType {
  trades: RealTrade[]
  tradeHistory: RealTrade[]
  isLoading: boolean
  openTrade: (tradeData: {
    symbol: string
    type: 'buy' | 'sell'
    amount: number
    open_price: number
    current_price: number
    leverage: number
    stop_loss?: number
    take_profit?: number
  }) => Promise<void>
  closeTrade: (tradeId: string) => Promise<void>
  updateTradePrices: (priceUpdates: { symbol: string; price: number }[]) => Promise<void>
}

const RealTradingContext = createContext<RealTradingContextType | null>(null)

export const useRealTrading = () => {
  const context = useContext(RealTradingContext)
  if (!context) {
    throw new Error('useRealTrading must be used within a RealTradingProvider')
  }
  return context
}

export const RealTradingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, updateProfile } = useAuth()
  const { primaryAccount, updateAccountBalance } = useTradingAccount()
  const [trades, setTrades] = useState<RealTrade[]>([])
  const [tradeHistory, setTradeHistory] = useState<RealTrade[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load trades when user logs in
  useEffect(() => {
    if (user) {
      loadTrades()
      loadTradeHistory()
      
      // Subscribe to real-time trade updates
      const subscription = supabase
        .channel('trades')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'trades',
            filter: `user_id=eq.${user.id}`
          }, 
          (payload) => {
            console.log('Real-time trade update:', payload)
            loadTrades()
          }
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [user])

  const loadTrades = async () => {
    if (!user || !primaryAccount) return
    
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .eq('trading_account_id', primaryAccount.id)
        .eq('status', 'open')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTrades(data || [])
    } catch (error: any) {
      errorLogger.error('Error loading trades', { error: error.message, userId: user.id })
    }
  }

  const loadTradeHistory = async () => {
    if (!user || !primaryAccount) return
    
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .eq('trading_account_id', primaryAccount.id)
        .eq('status', 'closed')
        .order('closed_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setTradeHistory(data || [])
    } catch (error: any) {
      errorLogger.error('Error loading trade history', { error: error.message, userId: user.id })
    }
  }

  const openTrade = async (tradeData: {
    symbol: string
    type: 'buy' | 'sell'
    amount: number
    open_price: number
    current_price: number
    leverage: number
    stop_loss?: number
    take_profit?: number
  }) => {
    if (!user || !primaryAccount) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to place trades",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      // Use trading engine for validation and execution
      const result = await tradingEngine.executeTrade(
        user.id,
        primaryAccount.id,
        {
          symbol: tradeData.symbol,
          type: tradeData.type,
          amount: tradeData.amount,
          leverage: tradeData.leverage,
          openPrice: tradeData.open_price,
          currentPrice: tradeData.current_price,
          stopLoss: tradeData.stop_loss,
          takeProfit: tradeData.take_profit
        }
      )

      if (!result.success) {
        toast({
          title: "Trade Failed",
          description: result.error,
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Trade Opened",
        description: `${tradeData.type.toUpperCase()} ${tradeData.symbol} - $${tradeData.amount}`,
      })

      await loadTrades()
      
      errorLogger.info('Trade opened successfully via trading engine', {
        userId: user.id,
        tradeId: result.tradeId,
        symbol: tradeData.symbol,
        type: tradeData.type,
        amount: tradeData.amount
      })
    } catch (error: any) {
      errorLogger.error('Error opening trade', { 
        error: error.message, 
        userId: user.id,
        tradeData 
      })
      toast({
        title: "Trade Failed",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const closeTrade = async (tradeId: string) => {
    if (!user || !primaryAccount) return

    setIsLoading(true)
    try {
      const success = await tradingEngine.closePosition(tradeId, 'manual')
      
      if (!success) {
        throw new Error('Failed to close position')
      }

      toast({
        title: "Trade Closed",
        description: "Position closed successfully",
      })

      await loadTrades()
      await loadTradeHistory()
      
      errorLogger.info('Trade closed successfully via trading engine', {
        userId: user.id,
        tradeId
      })
    } catch (error: any) {
      errorLogger.error('Error closing trade', { 
        error: error.message, 
        userId: user.id,
        tradeId 
      })
      toast({
        title: "Close Trade Failed",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateTradePrices = async (priceUpdates: { symbol: string; price: number }[]) => {
    if (!user || !primaryAccount || trades.length === 0) return

    try {
      // Use trading engine to update all positions with SL/TP checks
      const positionUpdates = await tradingEngine.updateAllPositions(priceUpdates)
      
      // Check for closed positions and show notifications
      const closedPositions = positionUpdates.filter(update => update.shouldClosePosition)
      
      if (closedPositions.length > 0) {
        closedPositions.forEach(position => {
          const reasonText = {
            'stop_loss': 'Stop Loss triggered',
            'take_profit': 'Take Profit triggered', 
            'margin_call': 'Margin Call - Position closed'
          }[position.triggerReason!]
          
          toast({
            title: "Position Closed",
            description: reasonText,
            variant: position.triggerReason === 'margin_call' ? 'destructive' : 'default'
          })
        })
        
        // Reload data after automatic closures
        await loadTrades()
        await loadTradeHistory()
      } else {
        // Just reload trades to get updated prices
        await loadTrades()
      }
      
      errorLogger.info('Price updates processed via trading engine', {
        userId: user.id,
        updatedPositions: positionUpdates.length,
        closedPositions: closedPositions.length
      })
    } catch (error: any) {
      errorLogger.error('Error updating trade prices', { 
        error: error.message, 
        userId: user.id 
      })
    }
  }

  const value: RealTradingContextType = {
    trades,
    tradeHistory,
    isLoading,
    openTrade,
    closeTrade,
    updateTradePrices
  }

  return (
    <RealTradingContext.Provider value={value}>
      {children}
    </RealTradingContext.Provider>
  )
}
