import { useEffect, useState } from 'react'
import { useRealTrading } from '@/contexts/RealTradingContext'
import { tradingEngine, type TradeValidationResult } from '@/services/tradingEngine'
import { useAuth } from '@/contexts/AuthContext.minimal'
import { useTradingAccount } from '@/hooks/useTradingAccount'
import { useSwapManager } from '@/hooks/useSwapManager'
import { toast } from '@/hooks/use-toast'

export const useAdvancedTrading = () => {
  const { user } = useAuth()
  const { primaryAccount } = useTradingAccount()
  const realTrading = useRealTrading()
  const swapManager = useSwapManager() // Initialize swap management
  const [isValidating, setIsValidating] = useState(false)
  const [lastValidation, setLastValidation] = useState<TradeValidationResult | null>(null)

  /**
   * Validate a trade before execution
   */
  const validateTrade = async (tradeData: {
    symbol: string
    type: 'buy' | 'sell'
    amount: number
    leverage: number
    openPrice: number
  }): Promise<TradeValidationResult | null> => {
    if (!user || !primaryAccount) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to validate trades",
        variant: "destructive"
      })
      return null
    }

    setIsValidating(true)
    try {
      const validation = await tradingEngine.validateTrade(
        user.id,
        primaryAccount.id,
        tradeData
      )
      
      setLastValidation(validation)
      
      // Show validation warnings
      if (validation.warnings.length > 0) {
        validation.warnings.forEach(warning => {
          toast({
            title: "Trade Warning",
            description: warning,
            variant: "default"
          })
        })
      }

      return validation
    } catch (error: any) {
      toast({
        title: "Validation Error",
        description: error.message,
        variant: "destructive"
      })
      return null
    } finally {
      setIsValidating(false)
    }
  }

  /**
   * Open a trade with validation
   */
  const openValidatedTrade = async (tradeData: {
    symbol: string
    type: 'buy' | 'sell'
    amount: number
    open_price: number
    current_price: number
    leverage: number
    stop_loss?: number
    take_profit?: number
  }) => {
    // Validate first
    const validation = await validateTrade({
      symbol: tradeData.symbol,
      type: tradeData.type,
      amount: tradeData.amount,
      leverage: tradeData.leverage,
      openPrice: tradeData.open_price
    })

    if (!validation || !validation.valid) {
      return false
    }

    // Execute trade
    await realTrading.openTrade(tradeData)
    return true
  }

  /**
   * Get account risk metrics
   */
  const getRiskMetrics = () => {
    if (!primaryAccount) return null

    const marginLevel = primaryAccount.margin > 0 
      ? (primaryAccount.equity / primaryAccount.margin) * 100 
      : 0

    const freeMarginPercent = primaryAccount.equity > 0
      ? (primaryAccount.free_margin / primaryAccount.equity) * 100
      : 0

    const usedMarginPercent = 100 - freeMarginPercent

    return {
      marginLevel,
      freeMarginPercent,
      usedMarginPercent,
      equity: primaryAccount.equity,
      balance: primaryAccount.balance,
      margin: primaryAccount.margin,
      freeMargin: primaryAccount.free_margin,
      isMarginCall: marginLevel < 50 && marginLevel > 20,
      isStopOut: marginLevel <= 20
    }
  }

  /**
   * Calculate position size based on risk percentage
   */
  const calculatePositionSize = (
    riskPercent: number,
    stopLossPoints: number,
    accountBalance: number
  ): number => {
    if (stopLossPoints <= 0) return 0
    
    const riskAmount = (accountBalance * riskPercent) / 100
    return riskAmount / stopLossPoints
  }

  return {
    // Core trading functions
    ...realTrading,
    
    // Advanced functions
    validateTrade,
    openValidatedTrade,
    getRiskMetrics,
    calculatePositionSize,
    
    // State
    isValidating,
    lastValidation
  }
}

export default useAdvancedTrading