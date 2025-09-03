import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  DollarSign,
  Shield,
  Activity
} from "lucide-react";
import { useTradingLogic } from "@/hooks/useTradingLogic";
import { formatDistanceToNow } from "date-fns";

export const PositionsPanel = () => {
  const { 
    openPositions, 
    accountMetrics, 
    closePosition,
    getRiskMetrics,
    isLoading 
  } = useTradingLogic();
  
  const riskMetrics = getRiskMetrics();
  
  const formatPrice = (price: number, symbol: string) => {
    const digits = symbol.includes("JPY") ? 3 : 5;
    return price.toFixed(digits);
  };
  
  const formatPnL = (pnl: number) => {
    const formatted = Math.abs(pnl).toFixed(2);
    return pnl >= 0 ? `+$${formatted}` : `-$${formatted}`;
  };
  
  return (
    <div className="space-y-4">
      {/* Account Overview */}
      {accountMetrics && (
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Account Overview
          </h3>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <div className="text-xs text-muted-foreground">Balance</div>
              <div className="font-semibold">${accountMetrics.balance.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Equity</div>
              <div className="font-semibold">${accountMetrics.equity.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Free Margin</div>
              <div className="font-semibold">${accountMetrics.freeMargin.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Margin Level</div>
              <div className={`font-semibold ${
                accountMetrics.marginLevel < 100 ? 'text-red-600' : 
                accountMetrics.marginLevel < 200 ? 'text-yellow-600' : 
                'text-green-600'
              }`}>
                {accountMetrics.marginLevel.toFixed(2)}%
              </div>
            </div>
          </div>
          
          {/* Risk Indicators */}
          {riskMetrics && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Margin Used</span>
                <span>{riskMetrics.marginUsed.toFixed(2)}%</span>
              </div>
              <Progress value={riskMetrics.marginUsed} className="h-2" />
              
              {riskMetrics.isMarginCall && (
                <div className="flex items-center gap-2 text-yellow-600 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Margin Call Warning</span>
                </div>
              )}
              
              {riskMetrics.isStopOut && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Stop Out Level Reached!</span>
                </div>
              )}
            </div>
          )}
        </Card>
      )}
      
      {/* Open Positions */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Open Positions ({openPositions.length})
          </h3>
          {accountMetrics && (
            <div className="text-sm">
              <span className="text-muted-foreground">Total P&L: </span>
              <span className={`font-semibold ${
                accountMetrics.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatPnL(accountMetrics.totalPnL)}
              </span>
            </div>
          )}
        </div>
        
        {openPositions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No open positions
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {openPositions.map((position) => (
              <div
                key={position.id}
                className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={position.type === 'buy' ? 'default' : 'destructive'}>
                      {position.type === 'buy' ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {position.type.toUpperCase()}
                    </Badge>
                    <span className="font-medium">{position.symbol}</span>
                    <span className="text-sm text-muted-foreground">
                      {position.amount} lots
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => closePosition(position.id)}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Open: </span>
                    <span className="font-mono">
                      {formatPrice(position.openPrice, position.symbol)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Current: </span>
                    <span className="font-mono">
                      {formatPrice(position.currentPrice, position.symbol)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">P&L: </span>
                    <span className={`font-semibold ${
                      position.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatPnL(position.pnl)} ({position.pnlPercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-sm mt-2">
                  {position.stopLoss && (
                    <div className="flex items-center gap-1">
                      <Shield className="h-3 w-3 text-red-600" />
                      <span className="text-muted-foreground">SL: </span>
                      <span className="font-mono text-xs">
                        {formatPrice(position.stopLoss, position.symbol)}
                      </span>
                    </div>
                  )}
                  {position.takeProfit && (
                    <div className="flex items-center gap-1">
                      <Shield className="h-3 w-3 text-green-600" />
                      <span className="text-muted-foreground">TP: </span>
                      <span className="font-mono text-xs">
                        {formatPrice(position.takeProfit, position.symbol)}
                      </span>
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground text-right">
                    {formatDistanceToNow(position.openTime, { addSuffix: true })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};