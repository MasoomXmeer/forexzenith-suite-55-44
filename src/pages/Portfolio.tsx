
import { MobileHeader } from "@/components/Layout/MobileHeader";
import { XMBottomNav } from "@/components/Layout/XMBottomNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  X,
  BarChart3,
  Activity,
  PieChart
} from "lucide-react";
import { useRealTrading } from "@/contexts/RealTradingContext";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext.minimal";
import { LiveMarketWidget } from "@/components/Trading/LiveMarketWidget";
import { PortfolioAnalytics } from "@/components/Trading/PortfolioAnalytics";
import { PortfolioSummary } from "@/components/Trading/PortfolioSummary";
import { PositionsPanel } from "@/components/Trading/PositionsPanel";

const Portfolio = () => {
  const { trades, tradeHistory, closeTrade } = useRealTrading();
  const { profile } = useAuth();

  const handleCloseTrade = (tradeId: string) => {
    closeTrade(tradeId);
  };

  const getTotalPnL = () => {
    return trades.reduce((sum, trade) => sum + trade.pnl, 0);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <MobileHeader title="Portfolio" />
      
      <div className="p-4 space-y-6">
        {/* Enhanced Portfolio Summary */}
        <PortfolioSummary />

        {/* Portfolio Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="positions">Positions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Account Summary
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-foreground">${profile?.balance?.toFixed(2) || '0.00'}</p>
                  <p className="text-sm text-muted-foreground">Balance</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-foreground">${profile?.equity?.toFixed(2) || '0.00'}</p>
                  <p className="text-sm text-muted-foreground">Equity</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-foreground">${profile?.free_margin?.toFixed(2) || '0.00'}</p>
                  <p className="text-sm text-muted-foreground">Free Margin</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className={`text-2xl font-bold ${getTotalPnL() >= 0 ? 'text-success' : 'text-danger'}`}>
                    ${getTotalPnL() >= 0 ? '+' : ''}{getTotalPnL().toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total P&L</p>
                </div>
              </div>
            </Card>

            {/* Live Market Widget */}
            <LiveMarketWidget 
              symbols={['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD']} 
              compact={true}
            />
          </TabsContent>

          {/* Positions Tab */}
          <TabsContent value="positions" className="space-y-4">
            <PositionsPanel />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <PortfolioAnalytics />
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">

            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Trade History
                </h3>
                <Button variant="ghost" size="sm">View All</Button>
              </div>
              <div className="space-y-3">
                {tradeHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No trade history</p>
                  </div>
                ) : (
                  tradeHistory.slice(-10).map((trade) => (
                    <div key={trade.id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${trade.type === 'buy' ? 'bg-success/10' : 'bg-danger/10'}`}>
                            {trade.type === 'buy' ? (
                              <TrendingUp className="h-4 w-4 text-success" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-danger" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{trade.symbol}</p>
                            <p className="text-sm text-muted-foreground">
                              {trade.type.toUpperCase()} {trade.amount} lots
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${trade.pnl >= 0 ? 'text-success' : 'text-danger'}`}>
                            ${trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                          </p>
                          <Badge variant={trade.pnl >= 0 ? "default" : "destructive"} className="text-xs">
                            {trade.pnl >= 0 ? "Profit" : "Loss"}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Open: {trade.open_price.toFixed(5)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Close: {trade.current_price.toFixed(5)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Commission: ${((trade.amount * trade.open_price * 100000) * 0.00007).toFixed(2)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Closed: {new Date(trade.closed_at || trade.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <XMBottomNav />
    </div>
  );
};

export default Portfolio;
