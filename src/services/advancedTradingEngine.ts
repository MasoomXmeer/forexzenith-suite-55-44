import { supabase } from '@/lib/supabase';
import { errorLogger } from '@/utils/errorLogger';

export interface TradePosition {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  amount: number;
  openPrice: number;
  currentPrice: number;
  leverage: number;
  margin: number;
  stopLoss?: number;
  takeProfit?: number;
  pnl: number;
  pnlPercent: number;
  commission: number;
  swap: number;
  status: 'open' | 'closed' | 'pending';
  openTime: Date;
  closeTime?: Date;
  closeReason?: 'manual' | 'stop_loss' | 'take_profit' | 'margin_call';
}

export interface AccountMetrics {
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
  totalPnL: number;
  openPositions: number;
  totalVolume: number;
}

export interface TradeRequest {
  symbol: string;
  type: 'buy' | 'sell';
  amount: number;
  leverage: number;
  stopLoss?: number;
  takeProfit?: number;
  price?: number; // For limit/stop orders
}

export interface TradeValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
  requiredMargin: number;
  estimatedCommission: number;
  riskAmount: number;
  riskPercent: number;
}

class AdvancedTradingEngine {
  private readonly COMMISSION_RATE = 0.0007; // 0.07% per trade
  private readonly MIN_LOT_SIZE = 0.01;
  private readonly MAX_LOT_SIZE = 100;
  private readonly MIN_MARGIN_LEVEL = 50; // 50% margin call level
  private readonly STOP_OUT_LEVEL = 20; // 20% stop out level
  private readonly MAX_RISK_PER_TRADE = 0.02; // 2% max risk per trade
  
  /**
   * Validate trade request before execution
   */
  async validateTrade(
    userId: string,
    accountId: string,
    request: TradeRequest
  ): Promise<TradeValidation> {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
      // Get account data
      const { data: account, error: accountError } = await supabase
        .from('trading_accounts')
        .select('*')
        .eq('id', accountId)
        .eq('user_id', userId)
        .single();
        
      if (accountError || !account) {
        errors.push('Invalid trading account');
        return {
          valid: false,
          errors,
          warnings,
          requiredMargin: 0,
          estimatedCommission: 0,
          riskAmount: 0,
          riskPercent: 0
        };
      }
      
      // Validate lot size
      if (request.amount < this.MIN_LOT_SIZE) {
        errors.push(`Minimum lot size is ${this.MIN_LOT_SIZE}`);
      }
      if (request.amount > this.MAX_LOT_SIZE) {
        errors.push(`Maximum lot size is ${this.MAX_LOT_SIZE}`);
      }
      
      // Calculate required margin
      const { data: marketData } = await supabase
        .from('markets')
        .select('*')
        .eq('symbol', request.symbol)
        .single();
        
      const currentPrice = marketData?.current_price || 1;
      const contractSize = 100000; // Standard lot size
      const requiredMargin = (request.amount * contractSize * currentPrice) / request.leverage;
      
      // Check available margin
      if (requiredMargin > account.free_margin) {
        errors.push(`Insufficient margin. Required: $${requiredMargin.toFixed(2)}, Available: $${account.free_margin.toFixed(2)}`);
      }
      
      // Calculate commission
      const tradeValue = request.amount * contractSize * currentPrice;
      const estimatedCommission = tradeValue * this.COMMISSION_RATE;
      
      // Calculate risk if stop loss is set
      let riskAmount = 0;
      let riskPercent = 0;
      
      if (request.stopLoss) {
        const pipsRisk = Math.abs(currentPrice - request.stopLoss);
        riskAmount = pipsRisk * request.amount * contractSize;
        riskPercent = (riskAmount / account.balance) * 100;
        
        if (riskPercent > this.MAX_RISK_PER_TRADE * 100) {
          warnings.push(`Risk exceeds recommended ${this.MAX_RISK_PER_TRADE * 100}% per trade`);
        }
      } else {
        warnings.push('No stop loss set - high risk trade');
      }
      
      // Check margin level after trade
      const newMargin = account.margin + requiredMargin;
      const newFreeMargin = account.equity - newMargin;
      const newMarginLevel = (account.equity / newMargin) * 100;
      
      if (newMarginLevel < 100) {
        warnings.push(`Margin level will be ${newMarginLevel.toFixed(2)}% after trade`);
      }
      
      // Validate stop loss and take profit levels
      if (request.stopLoss) {
        const minStopDistance = currentPrice * 0.001; // 0.1% minimum distance
        if (request.type === 'buy' && request.stopLoss > currentPrice - minStopDistance) {
          errors.push('Stop loss too close to current price for buy order');
        }
        if (request.type === 'sell' && request.stopLoss < currentPrice + minStopDistance) {
          errors.push('Stop loss too close to current price for sell order');
        }
      }
      
      if (request.takeProfit) {
        const minProfitDistance = currentPrice * 0.001;
        if (request.type === 'buy' && request.takeProfit < currentPrice + minProfitDistance) {
          errors.push('Take profit too close to current price for buy order');
        }
        if (request.type === 'sell' && request.takeProfit > currentPrice - minProfitDistance) {
          errors.push('Take profit too close to current price for sell order');
        }
      }
      
      return {
        valid: errors.length === 0,
        errors,
        warnings,
        requiredMargin,
        estimatedCommission,
        riskAmount,
        riskPercent
      };
      
    } catch (error) {
      errorLogger.error('Trade validation error', { error, userId, request });
      errors.push('Validation error occurred');
      return {
        valid: false,
        errors,
        warnings,
        requiredMargin: 0,
        estimatedCommission: 0,
        riskAmount: 0,
        riskPercent: 0
      };
    }
  }
  
  /**
   * Execute a trade with full validation and risk management
   */
  async executeTrade(
    userId: string,
    accountId: string,
    request: TradeRequest
  ): Promise<{ success: boolean; tradeId?: string; error?: string }> {
    try {
      // Validate trade first
      const validation = await this.validateTrade(userId, accountId, request);
      
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }
      
      // Get current market price
      const { data: market } = await supabase
        .from('markets')
        .select('*')
        .eq('symbol', request.symbol)
        .single();
        
      const openPrice = request.price || market?.current_price || 1;
      
      // Calculate position details
      const contractSize = 100000;
      const positionValue = request.amount * contractSize * openPrice;
      const margin = positionValue / request.leverage;
      const commission = positionValue * this.COMMISSION_RATE;
      
      // Create trade record
      const { data: trade, error: tradeError } = await supabase
        .from('trades')
        .insert({
          user_id: userId,
          trading_account_id: accountId,
          symbol: request.symbol,
          type: request.type,
          amount: request.amount,
          open_price: openPrice,
          current_price: openPrice,
          leverage: request.leverage,
          margin,
          commission,
          stop_loss: request.stopLoss,
          take_profit: request.takeProfit,
          pnl: -commission, // Start with negative commission
          status: 'open',
          created_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (tradeError) {
        throw tradeError;
      }
      
      // Update account balances
      const { error: updateError } = await supabase.rpc('update_account_after_trade', {
        p_account_id: accountId,
        p_margin_change: margin,
        p_commission: commission
      });
      
      if (updateError) {
        // Rollback trade if account update fails
        await supabase
          .from('trades')
          .delete()
          .eq('id', trade.id);
        throw updateError;
      }
      
      // Log successful trade
      errorLogger.info('Trade executed successfully', {
        userId,
        tradeId: trade.id,
        symbol: request.symbol,
        type: request.type,
        amount: request.amount,
        margin,
        commission
      });
      
      return {
        success: true,
        tradeId: trade.id
      };
      
    } catch (error: any) {
      errorLogger.error('Trade execution error', { error: error.message, userId, request });
      return {
        success: false,
        error: error.message || 'Failed to execute trade'
      };
    }
  }
  
  /**
   * Close a position with P&L calculation
   */
  async closePosition(
    tradeId: string,
    closeReason: 'manual' | 'stop_loss' | 'take_profit' | 'margin_call'
  ): Promise<boolean> {
    try {
      // Get trade details
      const { data: trade, error: tradeError } = await supabase
        .from('trades')
        .select('*')
        .eq('id', tradeId)
        .single();
        
      if (tradeError || !trade || trade.status !== 'open') {
        return false;
      }
      
      // Get current market price
      const { data: market } = await supabase
        .from('markets')
        .select('current_price')
        .eq('symbol', trade.symbol)
        .single();
        
      const closePrice = market?.current_price || trade.current_price;
      
      // Calculate final P&L
      const contractSize = 100000;
      let pnl = 0;
      
      if (trade.type === 'buy') {
        pnl = (closePrice - trade.open_price) * trade.amount * contractSize;
      } else {
        pnl = (trade.open_price - closePrice) * trade.amount * contractSize;
      }
      
      // Subtract commission and swap
      pnl = pnl - trade.commission - (trade.swap || 0);
      
      // Update trade record
      const { error: updateError } = await supabase
        .from('trades')
        .update({
          status: 'closed',
          current_price: closePrice,
          pnl,
          closed_at: new Date().toISOString(),
          close_reason: closeReason
        })
        .eq('id', tradeId);
        
      if (updateError) {
        throw updateError;
      }
      
      // Update account balances
      const { error: accountError } = await supabase.rpc('close_position_update_account', {
        p_account_id: trade.trading_account_id,
        p_margin_release: trade.margin,
        p_pnl: pnl
      });
      
      if (accountError) {
        throw accountError;
      }
      
      errorLogger.info('Position closed successfully', {
        tradeId,
        closeReason,
        pnl,
        closePrice
      });
      
      return true;
      
    } catch (error: any) {
      errorLogger.error('Error closing position', { error: error.message, tradeId });
      return false;
    }
  }
  
  /**
   * Update all open positions with current prices and check SL/TP
   */
  async updatePositions(priceUpdates: { symbol: string; price: number }[]): Promise<void> {
    try {
      for (const update of priceUpdates) {
        // Get all open trades for this symbol
        const { data: trades } = await supabase
          .from('trades')
          .select('*')
          .eq('symbol', update.symbol)
          .eq('status', 'open');
          
        if (!trades || trades.length === 0) continue;
        
        for (const trade of trades) {
          const contractSize = 100000;
          let pnl = 0;
          
          // Calculate current P&L
          if (trade.type === 'buy') {
            pnl = (update.price - trade.open_price) * trade.amount * contractSize;
          } else {
            pnl = (trade.open_price - update.price) * trade.amount * contractSize;
          }
          
          // Subtract commission and swap
          pnl = pnl - trade.commission - (trade.swap || 0);
          
          // Check stop loss
          if (trade.stop_loss) {
            if ((trade.type === 'buy' && update.price <= trade.stop_loss) ||
                (trade.type === 'sell' && update.price >= trade.stop_loss)) {
              await this.closePosition(trade.id, 'stop_loss');
              continue;
            }
          }
          
          // Check take profit
          if (trade.take_profit) {
            if ((trade.type === 'buy' && update.price >= trade.take_profit) ||
                (trade.type === 'sell' && update.price <= trade.take_profit)) {
              await this.closePosition(trade.id, 'take_profit');
              continue;
            }
          }
          
          // Update current price and P&L
          await supabase
            .from('trades')
            .update({
              current_price: update.price,
              pnl
            })
            .eq('id', trade.id);
        }
      }
      
      // Check margin levels for all accounts
      await this.checkMarginLevels();
      
    } catch (error: any) {
      errorLogger.error('Error updating positions', { error: error.message });
    }
  }
  
  /**
   * Check margin levels and trigger margin calls if needed
   */
  private async checkMarginLevels(): Promise<void> {
    try {
      const { data: accounts } = await supabase
        .from('trading_accounts')
        .select('*')
        .gt('margin', 0);
        
      if (!accounts) return;
      
      for (const account of accounts) {
        const marginLevel = (account.equity / account.margin) * 100;
        
        // Stop out level - close all positions
        if (marginLevel <= this.STOP_OUT_LEVEL) {
          const { data: trades } = await supabase
            .from('trades')
            .select('id')
            .eq('trading_account_id', account.id)
            .eq('status', 'open');
            
          if (trades) {
            for (const trade of trades) {
              await this.closePosition(trade.id, 'margin_call');
            }
          }
          
          errorLogger.warn('Stop out triggered', {
            accountId: account.id,
            marginLevel
          });
        }
        // Margin call warning
        else if (marginLevel <= this.MIN_MARGIN_LEVEL) {
          errorLogger.warn('Margin call warning', {
            accountId: account.id,
            marginLevel
          });
        }
      }
    } catch (error: any) {
      errorLogger.error('Error checking margin levels', { error: error.message });
    }
  }
  
  /**
   * Calculate account metrics
   */
  async getAccountMetrics(accountId: string): Promise<AccountMetrics | null> {
    try {
      const { data: account } = await supabase
        .from('trading_accounts')
        .select('*')
        .eq('id', accountId)
        .single();
        
      if (!account) return null;
      
      const { data: trades } = await supabase
        .from('trades')
        .select('*')
        .eq('trading_account_id', accountId);
        
      const openPositions = trades?.filter(t => t.status === 'open').length || 0;
      const totalVolume = trades?.reduce((sum, t) => sum + t.amount, 0) || 0;
      const totalPnL = trades?.reduce((sum, t) => sum + (t.pnl || 0), 0) || 0;
      
      return {
        balance: account.balance,
        equity: account.equity,
        margin: account.margin,
        freeMargin: account.free_margin,
        marginLevel: account.margin > 0 ? (account.equity / account.margin) * 100 : 0,
        totalPnL,
        openPositions,
        totalVolume
      };
      
    } catch (error: any) {
      errorLogger.error('Error getting account metrics', { error: error.message, accountId });
      return null;
    }
  }
}

export const advancedTradingEngine = new AdvancedTradingEngine();