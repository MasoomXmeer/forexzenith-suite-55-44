import { supabase } from '@/lib/supabase'
import { errorLogger } from '@/utils/errorLogger'
import { forexEngine, type TradeExecution } from './forexEngine'

export interface TradingEngineConfig {
  stopOutLevel: number // Percentage (e.g., 20 for 20%)
  marginCallLevel: number // Percentage (e.g., 50 for 50%)
  maxPositions: number
  maxExposurePerSymbol: number // Dollar amount
  negativeBalanceProtection: boolean
}

export interface TradeValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  requiredMargin: number
  exposureAfterTrade: number
}

export interface PositionUpdate {
  id: string
  currentPrice: number
  pnl: number
  marginLevel: number
  shouldClosePosition: boolean
  triggerReason?: 'stop_loss' | 'take_profit' | 'margin_call'
}

export class TradingEngine {
  private config: TradingEngineConfig

  constructor(config: TradingEngineConfig) {
    this.config = config
  }

  /**
   * Validate a trade before execution
   */
  async validateTrade(
    userId: string,
    accountId: string,
    tradeData: {
      symbol: string
      type: 'buy' | 'sell'
      amount: number
      leverage: number
      openPrice: number
    }
  ): Promise<TradeValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // Get account data
      const { data: account } = await supabase
        .from('trading_accounts')
        .select('*')
        .eq('id', accountId)
        .single()

      if (!account) {
        errors.push('Trading account not found')
        return { valid: false, errors, warnings, requiredMargin: 0, exposureAfterTrade: 0 }
      }

      // Calculate required margin
      const requiredMargin = this.calculateRequiredMargin(
        tradeData.amount,
        tradeData.leverage,
        tradeData.openPrice
      )

      // Check available margin
      if (requiredMargin > account.free_margin) {
        errors.push(`Insufficient margin. Required: $${requiredMargin.toFixed(2)}, Available: $${account.free_margin.toFixed(2)}`)
      }

      // Check maximum positions
      const { count: positionCount } = await supabase
        .from('trades')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('trading_account_id', accountId)
        .eq('status', 'open')

      if (positionCount && positionCount >= this.config.maxPositions) {
        errors.push(`Maximum positions limit reached (${this.config.maxPositions})`)
      }

      // Check symbol exposure
      const { data: existingTrades } = await supabase
        .from('trades')
        .select('amount, type')
        .eq('user_id', userId)
        .eq('trading_account_id', accountId)
        .eq('symbol', tradeData.symbol)
        .eq('status', 'open')

      let currentExposure = 0
      existingTrades?.forEach(trade => {
        currentExposure += trade.amount * tradeData.openPrice
      })

      const exposureAfterTrade = currentExposure + (tradeData.amount * tradeData.openPrice)
      if (exposureAfterTrade > this.config.maxExposurePerSymbol) {
        errors.push(`Maximum exposure for ${tradeData.symbol} exceeded`)
      }

      // Margin level warning
      const newMarginLevel = (account.equity / (account.margin + requiredMargin)) * 100
      if (newMarginLevel < this.config.marginCallLevel) {
        warnings.push(`Trade will bring margin level below ${this.config.marginCallLevel}%`)
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
        requiredMargin,
        exposureAfterTrade
      }
    } catch (error: any) {
      errorLogger.error('Trade validation error', { error: error.message, userId, tradeData })
      return {
        valid: false,
        errors: ['Validation failed due to system error'],
        warnings,
        requiredMargin: 0,
        exposureAfterTrade: 0
      }
    }
  }

  /**
   * Execute a validated trade with forex engine
   */
  async executeTrade(
    userId: string,
    accountId: string,
    tradeData: {
      symbol: string
      type: 'buy' | 'sell'
      amount: number
      leverage: number
      openPrice: number
      currentPrice: number
      stopLoss?: number
      takeProfit?: number
      volatility?: number
    }
  ): Promise<{ success: boolean; tradeId?: string; error?: string; execution?: TradeExecution }> {
    try {
      // Validate trade first
      const validation = await this.validateTrade(userId, accountId, tradeData)
      if (!validation.valid) {
        return { success: false, error: validation.errors.join(', ') }
      }

      // Execute trade through forex engine for realistic behavior
      const execution = await forexEngine.executeForexTrade({
        symbol: tradeData.symbol,
        type: tradeData.type,
        amount: tradeData.amount,
        leverage: tradeData.leverage,
        requestedPrice: tradeData.openPrice,
        marketPrice: tradeData.currentPrice,
        volatility: tradeData.volatility || 1
      })

      // Handle requote scenario
      if (execution.requoted) {
        return { 
          success: false, 
          error: `Price has moved. New price: ${execution.executedPrice.toFixed(5)}`,
          execution 
        }
      }

      // Start transaction with executed price
      const { data: trade, error: tradeError } = await supabase
        .from('trades')
        .insert([{
          user_id: userId,
          trading_account_id: accountId,
          symbol: tradeData.symbol,
          type: tradeData.type,
          amount: tradeData.amount,
          open_price: execution.executedPrice,
          current_price: execution.executedPrice,
          spread: execution.spread,
          slippage: execution.slippage,
          commission: execution.commission,
          leverage: tradeData.leverage,
          stop_loss: tradeData.stopLoss || null,
          take_profit: tradeData.takeProfit || null,
          pnl: 0,
          status: 'open'
        }])
        .select()
        .single()

      if (tradeError) throw tradeError

      // Get current account data for margin update
      const { data: currentAccount } = await supabase
        .from('trading_accounts')
        .select('margin, free_margin')
        .eq('id', accountId)
        .single()

      if (!currentAccount) throw new Error('Account not found')

      // Update account margin
      const { error: accountError } = await supabase
        .from('trading_accounts')
        .update({
          margin: currentAccount.margin + validation.requiredMargin,
          free_margin: currentAccount.free_margin - validation.requiredMargin
        })
        .eq('id', accountId)

      if (accountError) throw accountError

      errorLogger.info('Trade executed successfully', {
        userId,
        tradeId: trade.id,
        symbol: tradeData.symbol,
        amount: tradeData.amount
      })

      return { success: true, tradeId: trade.id, execution }
    } catch (error: any) {
      errorLogger.error('Trade execution error', { error: error.message, userId, tradeData })
      return { success: false, error: error.message }
    }
  }

  /**
   * Calculate required margin for a trade
   */
  calculateRequiredMargin(amount: number, leverage: number, price: number): number {
    return (amount * price) / leverage
  }

  /**
   * Calculate current P&L for a trade
   */
  calculatePnL(
    type: 'buy' | 'sell',
    amount: number,
    openPrice: number,
    currentPrice: number
  ): number {
    if (type === 'buy') {
      return (currentPrice - openPrice) * amount
    } else {
      return (openPrice - currentPrice) * amount
    }
  }

  /**
   * Check for stop loss and take profit triggers
   */
  checkStopLossTakeProfit(
    type: 'buy' | 'sell',
    currentPrice: number,
    stopLoss: number | null,
    takeProfit: number | null
  ): { triggered: boolean; reason?: 'stop_loss' | 'take_profit' } {
    if (type === 'buy') {
      // For buy positions
      if (stopLoss && currentPrice <= stopLoss) {
        return { triggered: true, reason: 'stop_loss' }
      }
      if (takeProfit && currentPrice >= takeProfit) {
        return { triggered: true, reason: 'take_profit' }
      }
    } else {
      // For sell positions
      if (stopLoss && currentPrice >= stopLoss) {
        return { triggered: true, reason: 'stop_loss' }
      }
      if (takeProfit && currentPrice <= takeProfit) {
        return { triggered: true, reason: 'take_profit' }
      }
    }

    return { triggered: false }
  }

  /**
   * Update all open positions with current prices and check for triggers
   */
  async updateAllPositions(priceUpdates: { symbol: string; price: number }[]): Promise<PositionUpdate[]> {
    const updates: PositionUpdate[] = []

    try {
      // Get all open trades
      const { data: trades } = await supabase
        .from('trades')
        .select(`
          *,
          trading_accounts (
            balance,
            equity,
            margin,
            free_margin
          )
        `)
        .eq('status', 'open')

      if (!trades) return updates

      for (const trade of trades) {
        const priceUpdate = priceUpdates.find(p => p.symbol === trade.symbol)
        if (!priceUpdate) continue

        const currentPrice = priceUpdate.price
        const pnl = this.calculatePnL(trade.type, trade.amount, trade.open_price, currentPrice)
        
        // Check for SL/TP triggers
        const slTpCheck = this.checkStopLossTakeProfit(
          trade.type,
          currentPrice,
          trade.stop_loss,
          trade.take_profit
        )

        // Calculate margin level
        const account = trade.trading_accounts
        const totalPnL = pnl // This should include all positions' PnL
        const equity = account.balance + totalPnL
        const marginLevel = account.margin > 0 ? (equity / account.margin) * 100 : 0

        // Check for margin call
        const shouldCloseForMargin = marginLevel <= this.config.stopOutLevel

        const update: PositionUpdate = {
          id: trade.id,
          currentPrice,
          pnl,
          marginLevel,
          shouldClosePosition: slTpCheck.triggered || shouldCloseForMargin,
          triggerReason: slTpCheck.reason || (shouldCloseForMargin ? 'margin_call' : undefined)
        }

        updates.push(update)

        // Update trade in database
        await supabase
          .from('trades')
          .update({
            current_price: currentPrice,
            pnl: pnl
          })
          .eq('id', trade.id)

        // Close position if triggered
        if (update.shouldClosePosition) {
          await this.closePosition(trade.id, update.triggerReason!)
        }
      }

      return updates
    } catch (error: any) {
      errorLogger.error('Position update error', { error: error.message })
      return updates
    }
  }

  /**
   * Close a position
   */
  async closePosition(tradeId: string, reason: 'stop_loss' | 'take_profit' | 'margin_call' | 'manual'): Promise<boolean> {
    try {
      const { data: trade } = await supabase
        .from('trades')
        .select(`
          *,
          trading_accounts (*)
        `)
        .eq('id', tradeId)
        .single()

      if (!trade) return false

      // Close the trade
      const { error: closeError } = await supabase
        .from('trades')
        .update({
          status: 'closed',
          closed_at: new Date().toISOString()
        })
        .eq('id', tradeId)

      if (closeError) throw closeError

      // Update account balance and margin
      const marginToRelease = this.calculateRequiredMargin(
        trade.amount,
        trade.leverage,
        trade.open_price
      )

      const newBalance = trade.trading_accounts.balance + trade.pnl
      const newMargin = Math.max(0, trade.trading_accounts.margin - marginToRelease)
      const newFreeMargin = trade.trading_accounts.free_margin + marginToRelease

      const { error: accountError } = await supabase
        .from('trading_accounts')
        .update({
          balance: this.config.negativeBalanceProtection ? Math.max(0, newBalance) : newBalance,
          margin: newMargin,
          free_margin: newFreeMargin
        })
        .eq('id', trade.trading_account_id)

      if (accountError) throw accountError

      errorLogger.info('Position closed', {
        tradeId,
        reason,
        pnl: trade.pnl,
        newBalance
      })

      return true
    } catch (error: any) {
      errorLogger.error('Position close error', { error: error.message, tradeId, reason })
      return false
    }
  }
}

// Default configuration
export const defaultTradingConfig: TradingEngineConfig = {
  stopOutLevel: 20, // 20%
  marginCallLevel: 50, // 50%
  maxPositions: 100,
  maxExposurePerSymbol: 100000, // $100,000
  negativeBalanceProtection: true
}

export const tradingEngine = new TradingEngine(defaultTradingConfig)