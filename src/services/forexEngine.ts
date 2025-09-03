import { supabase } from '@/lib/supabase'
import { errorLogger } from '@/utils/errorLogger'

export interface ForexConfig {
  // Spread settings
  baseSpread: Record<string, number> // Base spread in pips per symbol
  maxSpread: Record<string, number> // Maximum spread during high volatility
  spreadMultiplier: number // Volatility-based spread multiplier
  
  // Swap settings
  swapRates: Record<string, { long: number; short: number }> // Daily swap rates
  swapTime: string // UTC time for daily rollover (e.g., "21:00")
  
  // Slippage settings
  maxSlippage: number // Maximum slippage in pips
  slippageMultiplier: number // Volatility-based slippage
  
  // Execution settings
  executionDelay: number // Milliseconds
  requoteThreshold: number // Price movement threshold for requotes
  
  // Risk management
  stopOutLevel: number
  marginCallLevel: number
  maxPositions: number
  maxExposurePerSymbol: number
  negativeBalanceProtection: boolean
}

export interface TradeExecution {
  symbol: string
  type: 'buy' | 'sell'
  amount: number
  leverage: number
  requestedPrice: number
  executedPrice: number
  spread: number
  slippage: number
  commission: number
  requoted: boolean
  executionTime: number
}

export interface SwapCalculation {
  symbol: string
  type: 'buy' | 'sell'
  amount: number
  swapRate: number
  swapAmount: number
  rolloverTime: Date
}

export class ForexEngine {
  private config: ForexConfig

  constructor(config: ForexConfig) {
    this.config = config
  }

  /**
   * Calculate real-time spread based on market conditions
   */
  calculateSpread(symbol: string, volatility: number = 1): number {
    const baseSpread = this.config.baseSpread[symbol] || 2
    const maxSpread = this.config.maxSpread[symbol] || 10
    
    // Increase spread during high volatility
    const calculatedSpread = baseSpread * (1 + (volatility - 1) * this.config.spreadMultiplier)
    
    return Math.min(calculatedSpread, maxSpread)
  }

  /**
   * Calculate slippage based on market conditions
   */
  calculateSlippage(symbol: string, amount: number, volatility: number = 1): number {
    const baseSlippage = 0.5 // Base slippage in pips
    const sizeMultiplier = Math.log10(amount / 10000) // Larger trades = more slippage
    const volatilityMultiplier = volatility * this.config.slippageMultiplier
    
    const calculatedSlippage = baseSlippage * (1 + sizeMultiplier) * volatilityMultiplier
    
    return Math.min(calculatedSlippage, this.config.maxSlippage)
  }

  /**
   * Execute trade with real forex broker behavior
   */
  async executeForexTrade(tradeData: {
    symbol: string
    type: 'buy' | 'sell'
    amount: number
    leverage: number
    requestedPrice: number
    marketPrice: number
    volatility?: number
  }): Promise<TradeExecution> {
    
    const volatility = tradeData.volatility || 1
    const spread = this.calculateSpread(tradeData.symbol, volatility)
    const slippage = this.calculateSlippage(tradeData.symbol, tradeData.amount, volatility)
    
    // Calculate bid/ask prices
    const pipValue = this.getPipValue(tradeData.symbol)
    const halfSpread = (spread * pipValue) / 2
    
    let executedPrice = tradeData.marketPrice
    let requoted = false
    
    // Check if price moved too much (requote scenario)
    const priceMovement = Math.abs(tradeData.requestedPrice - tradeData.marketPrice)
    if (priceMovement > this.config.requoteThreshold * pipValue) {
      requoted = true
      // In real broker, this would send requote to client
    }
    
    // Apply spread and slippage
    if (tradeData.type === 'buy') {
      executedPrice = tradeData.marketPrice + halfSpread + (slippage * pipValue)
    } else {
      executedPrice = tradeData.marketPrice - halfSpread - (slippage * pipValue)
    }
    
    // Calculate commission (if applicable)
    const commission = this.calculateCommission(tradeData.symbol, tradeData.amount)
    
    // Simulate execution delay
    await this.simulateExecutionDelay()
    
    return {
      symbol: tradeData.symbol,
      type: tradeData.type,
      amount: tradeData.amount,
      leverage: tradeData.leverage,
      requestedPrice: tradeData.requestedPrice,
      executedPrice: executedPrice,
      spread: spread,
      slippage: slippage,
      commission: commission,
      requoted: requoted,
      executionTime: Date.now()
    }
  }

  /**
   * Calculate swap charges for overnight positions
   */
  calculateSwap(symbol: string, type: 'buy' | 'sell', amount: number): SwapCalculation {
    const swapRates = this.config.swapRates[symbol] || { long: -0.5, short: -0.5 }
    const swapRate = type === 'buy' ? swapRates.long : swapRates.short
    
    // Swap = (Amount × Swap Rate × Pip Value) / 365
    const pipValue = this.getPipValue(symbol)
    const swapAmount = (amount * swapRate * pipValue) / 365
    
    return {
      symbol,
      type,
      amount,
      swapRate,
      swapAmount,
      rolloverTime: new Date()
    }
  }

  /**
   * Apply daily swaps to all overnight positions
   */
  async applyDailySwaps(): Promise<void> {
    try {
      const { data: overnightTrades } = await supabase
        .from('trades')
        .select('*')
        .eq('status', 'open')
        .lt('created_at', this.getTodayRolloverTime().toISOString())

      if (!overnightTrades) return

      for (const trade of overnightTrades) {
        const swapCalculation = this.calculateSwap(trade.symbol, trade.type, trade.amount)
        
        // Apply swap to trade
        await supabase
          .from('trades')
          .update({
            pnl: trade.pnl + swapCalculation.swapAmount,
            swap_charges: (trade.swap_charges || 0) + swapCalculation.swapAmount
          })
          .eq('id', trade.id)

        // Update account balance by getting current balance first
        const { data: currentAccount } = await supabase
          .from('trading_accounts')
          .select('balance')
          .eq('id', trade.trading_account_id)
          .single()

        if (currentAccount) {
          await supabase
            .from('trading_accounts')
            .update({
              balance: currentAccount.balance + swapCalculation.swapAmount
            })
            .eq('id', trade.trading_account_id)
        }

        errorLogger.info('Swap applied', {
          tradeId: trade.id,
          symbol: trade.symbol,
          swapAmount: swapCalculation.swapAmount
        })
      }
    } catch (error: any) {
      errorLogger.error('Swap application error', { error: error.message })
    }
  }

  /**
   * Enhanced margin calculation with currency conversion
   */
  calculateMarginWithCurrency(
    symbol: string,
    amount: number,
    leverage: number,
    price: number,
    accountCurrency: string = 'USD'
  ): number {
    const baseCurrency = symbol.substring(0, 3)
    const quoteCurrency = symbol.substring(3, 6)
    
    let marginInBaseCurrency = (amount * price) / leverage
    
    // Convert to account currency if needed
    if (baseCurrency !== accountCurrency) {
      // In real implementation, you'd use current exchange rates
      // For now, using USD as base
      marginInBaseCurrency = marginInBaseCurrency * this.getExchangeRate(baseCurrency, accountCurrency)
    }
    
    return marginInBaseCurrency
  }

  /**
   * Check market hours and apply weekend margins
   */
  isMarketOpen(symbol: string): boolean {
    const now = new Date()
    const day = now.getUTCDay()
    const hour = now.getUTCHours()
    
    // Forex market is closed from Friday 22:00 GMT to Sunday 22:00 GMT
    if (day === 6 || (day === 5 && hour >= 22) || (day === 0 && hour < 22)) {
      return false
    }
    
    return true
  }

  /**
   * Apply weekend/holiday margin multipliers
   */
  getMarginMultiplier(symbol: string): number {
    if (!this.isMarketOpen(symbol)) {
      return 2.0 // Double margin during market closed hours
    }
    
    // Check if major news event is upcoming (would need news calendar integration)
    const hasUpcomingNews = this.checkUpcomingNews(symbol)
    if (hasUpcomingNews) {
      return 1.5 // Increase margin before major news
    }
    
    return 1.0
  }

  /**
   * Get pip value for a symbol
   */
  private getPipValue(symbol: string): number {
    // Standard pip values (simplified)
    const jpyPairs = ['USDJPY', 'EURJPY', 'GBPJPY', 'AUDJPY', 'CADJPY']
    
    if (jpyPairs.includes(symbol)) {
      return 0.01 // For JPY pairs, pip is 0.01
    }
    
    return 0.0001 // For most other pairs, pip is 0.0001
  }

  /**
   * Calculate commission (for ECN accounts)
   */
  private calculateCommission(symbol: string, amount: number): number {
    // $7 per lot round turn (simplified)
    const lotsTraded = amount / 100000
    return lotsTraded * 7
  }

  /**
   * Simulate execution delay
   */
  private async simulateExecutionDelay(): Promise<void> {
    const delay = this.config.executionDelay + Math.random() * 100 // Add random component
    await new Promise(resolve => setTimeout(resolve, delay))
  }

  /**
   * Get today's rollover time
   */
  private getTodayRolloverTime(): Date {
    const today = new Date()
    const rolloverHour = parseInt(this.config.swapTime.split(':')[0])
    const rolloverMinute = parseInt(this.config.swapTime.split(':')[1])
    
    return new Date(Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate(),
      rolloverHour,
      rolloverMinute
    ))
  }

  /**
   * Get exchange rate (simplified - would use real rates in production)
   */
  private getExchangeRate(fromCurrency: string, toCurrency: string): number {
    // Simplified exchange rates - in production, use real-time rates
    const rates: Record<string, number> = {
      'EURUSD': 1.10,
      'GBPUSD': 1.30,
      'USDJPY': 150.0,
      'USDCHF': 0.90,
      'USDCAD': 1.35
    }
    
    const pair = fromCurrency + toCurrency
    const inversePair = toCurrency + fromCurrency
    
    if (rates[pair]) {
      return rates[pair]
    } else if (rates[inversePair]) {
      return 1 / rates[inversePair]
    }
    
    return 1.0 // Default to 1:1 if rate not found
  }

  /**
   * Check for upcoming major news events (placeholder)
   */
  private checkUpcomingNews(symbol: string): boolean {
    // In production, this would integrate with economic calendar API
    // For now, randomly return true 10% of the time
    return Math.random() < 0.1
  }
}

// Enhanced forex configuration
export const forexConfig: ForexConfig = {
  baseSpread: {
    'EURUSD': 1.2,
    'GBPUSD': 1.5,
    'USDJPY': 1.1,
    'USDCHF': 1.3,
    'AUDUSD': 1.4,
    'USDCAD': 1.3,
    'NZDUSD': 1.6,
    'EURJPY': 1.8,
    'GBPJPY': 2.1,
    'EURGBP': 1.5
  },
  maxSpread: {
    'EURUSD': 8.0,
    'GBPUSD': 10.0,
    'USDJPY': 8.0,
    'USDCHF': 10.0,
    'AUDUSD': 12.0,
    'USDCAD': 10.0,
    'NZDUSD': 15.0,
    'EURJPY': 15.0,
    'GBPJPY': 20.0,
    'EURGBP': 12.0
  },
  spreadMultiplier: 2.0,
  swapRates: {
    'EURUSD': { long: -0.3, short: 0.1 },
    'GBPUSD': { long: -0.4, short: 0.2 },
    'USDJPY': { long: 0.2, short: -0.5 },
    'USDCHF': { long: 0.1, short: -0.3 },
    'AUDUSD': { long: -0.2, short: 0.0 },
    'USDCAD': { long: 0.0, short: -0.2 }
  },
  swapTime: "21:00",
  maxSlippage: 3.0,
  slippageMultiplier: 1.5,
  executionDelay: 200,
  requoteThreshold: 2.0,
  stopOutLevel: 20,
  marginCallLevel: 50,
  maxPositions: 100,
  maxExposurePerSymbol: 100000,
  negativeBalanceProtection: true
}

export const forexEngine = new ForexEngine(forexConfig)