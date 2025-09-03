import { useState } from "react";
import { ArrowLeft, MoreVertical, Copy, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MobileHeader } from "@/components/Layout/MobileHeader";
import { XMBottomNav } from "@/components/Layout/XMBottomNav";
import { useHistoryData } from "@/hooks/useHistoryData";
import { formatDistance } from "date-fns";

export default function TradingHistory() {
  const [activeTab, setActiveTab] = useState<"all" | "3months" | "lastMonth">("lastMonth");
  const { trades, summary, loading, error, fetchHistoryData, getDateRange } = useHistoryData();

  const handleTabChange = (tab: "all" | "3months" | "lastMonth") => {
    setActiveTab(tab);
    fetchHistoryData(tab);
  };

  const dateRange = getDateRange(activeTab);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <MobileHeader title="Trading History" showNotifications={false} />
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
        <XMBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <MobileHeader 
        title="Trading History" 
        showNotifications={false}
      />
      
      <div className="p-4 space-y-6">
        {/* Tabs */}
        <div className="flex">
          <Button
            variant="ghost"
            className={`flex-1 text-sm transition-colors ${activeTab === "all" 
              ? "text-primary border-b-2 border-primary bg-primary/5" 
              : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => handleTabChange("all")}
          >
            All History
          </Button>
          <Button
            variant="ghost"
            className={`flex-1 text-sm transition-colors ${activeTab === "3months" 
              ? "text-primary border-b-2 border-primary bg-primary/5" 
              : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => handleTabChange("3months")}
          >
            Last 3 Months
          </Button>
          <Button
            variant="ghost"
            className={`flex-1 text-sm transition-colors ${activeTab === "lastMonth" 
              ? "text-primary border-b-2 border-primary bg-primary/5" 
              : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => handleTabChange("lastMonth")}
          >
            Last Month
          </Button>
        </div>

        {/* Date Range Display */}
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Period</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide">From</label>
              <div className="text-base font-medium text-foreground">
                {dateRange.from.toLocaleDateString()}
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide">To</label>
              <div className="text-base font-medium text-foreground">
                {dateRange.to.toLocaleDateString()}
              </div>
            </div>
          </div>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-5 w-5 text-success" />
              <span className="text-sm text-muted-foreground">Total Trades</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{summary.totalTrades}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {summary.winningTrades} wins • {summary.losingTrades} losses
            </div>
          </Card>
          
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-3 mb-2">
              <TrendingDown className="h-5 w-5 text-warning" />
              <span className="text-sm text-muted-foreground">Profit / Loss</span>
            </div>
            <div className={`text-2xl font-bold ${
              summary.totalProfitLoss >= 0 ? 'text-success' : 'text-destructive'
            }`}>
              {summary.totalProfitLoss >= 0 ? '+' : ''}${summary.totalProfitLoss.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Win Rate: {summary.totalTrades > 0 ? ((summary.winningTrades / summary.totalTrades) * 100).toFixed(1) : 0}%
            </div>
          </Card>
        </div>

        {/* Trades List */}
        {trades.length > 0 ? (
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Recent Trades
            </h3>
            {trades.slice(0, 10).map((trade) => (
              <Card key={trade.id} className="p-4 bg-card border-border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={trade.type === 'buy' ? 'default' : 'destructive'}
                      className="font-medium"
                    >
                      {trade.type.toUpperCase()}
                    </Badge>
                    <span className="font-semibold text-foreground text-lg">
                      {trade.symbol}
                    </span>
                  </div>
                  <Badge variant={trade.status === 'open' ? 'secondary' : 'outline'}>
                    {trade.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Amount:</span>
                    <div className="font-medium text-foreground">{trade.amount} lots</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Open Price:</span>
                    <div className="font-medium text-foreground">${trade.open_price}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Current Price:</span>
                    <div className="font-medium text-foreground">${trade.current_price}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">P&L:</span>
                    <div className={`font-medium ${
                      trade.pnl >= 0 ? 'text-success' : 'text-destructive'
                    }`}>
                      {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    {formatDistance(new Date(trade.created_at), new Date(), { addSuffix: true })}
                  </span>
                  <div className="flex items-center gap-2">
                    {trade.leverage && (
                      <Badge variant="outline" className="text-xs">
                        1:{trade.leverage}
                      </Badge>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            
            {trades.length > 10 && (
              <Card className="p-4 text-center bg-muted/30">
                <p className="text-muted-foreground">
                  Showing 10 of {trades.length} trades
                </p>
                <Button variant="ghost" className="mt-2 text-primary">
                  View All Trades
                </Button>
              </Card>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-24 h-24 rounded-full bg-muted/30 flex items-center justify-center mb-4">
              <TrendingUp className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No Trades Found</h3>
            <p className="text-center text-muted-foreground">
              There are no trades for the selected time period.
            </p>
          </div>
        )}
      </div>
      
      <XMBottomNav />
    </div>
  );
}