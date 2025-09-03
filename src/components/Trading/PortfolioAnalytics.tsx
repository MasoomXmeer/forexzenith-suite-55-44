import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar, Legend, Tooltip, Area, AreaChart 
} from "recharts";
import { 
  TrendingUp, TrendingDown, DollarSign, Activity, Target, 
  AlertTriangle, Clock, PieChart as PieChartIcon, BarChart3 
} from "lucide-react";
import { useRealTrading } from "@/contexts/RealTradingContext";
import { useAuth } from "@/contexts/AuthContext.minimal";

export const PortfolioAnalytics = () => {
  const [timeframe, setTimeframe] = useState<"1D" | "1W" | "1M" | "3M" | "1Y">("1W");
  const { trades, tradeHistory } = useRealTrading();
  const { profile } = useAuth();

  const getTotalPnL = () => {
    return trades.reduce((sum, trade) => sum + trade.pnl, 0);
  };

  const getTodayPnL = () => {
    const today = new Date().toDateString();
    return trades
      .filter(trade => new Date(trade.created_at).toDateString() === today)
      .reduce((sum, trade) => sum + trade.pnl, 0);
  };

  const getMarginLevel = () => {
    if (!profile?.margin || profile.margin === 0) return 0;
    return ((profile.equity || 0) / profile.margin) * 100;
  };

  // Generate performance history data
  const performanceHistory = useMemo(() => {
    const days = timeframe === "1D" ? 1 : timeframe === "1W" ? 7 : timeframe === "1M" ? 30 : timeframe === "3M" ? 90 : 365;
    const data = [];
    let equity = profile?.balance || 10000;
    const now = Date.now();

    for (let i = days; i >= 0; i--) {
      // Simulate some volatility
      const change = (Math.random() - 0.48) * 0.02; // Slight positive bias
      equity = Math.max(equity * (1 + change), (profile?.balance || 10000) * 0.8); // Don't go below 80% of initial
      
      data.push({
        date: now - (i * 24 * 60 * 60 * 1000),
        equity: equity,
        balance: profile?.balance || 10000,
        pnl: equity - (profile?.balance || 10000)
      });
    }
    return data;
  }, [timeframe, profile?.balance]);

  // Asset allocation data
  const assetAllocation = useMemo(() => {
    const allocation = new Map<string, { value: number; pnl: number }>();
    
    trades.forEach(trade => {
      const category = trade.symbol.includes("USD") ? "Forex" : 
                      trade.symbol.includes("XAU") || trade.symbol.includes("XAG") ? "Metals" :
                      trade.symbol.includes("OIL") ? "Energy" : "Indices";
      
      const existing = allocation.get(category) || { value: 0, pnl: 0 };
      allocation.set(category, {
        value: existing.value + (trade.amount * trade.open_price),
        pnl: existing.pnl + trade.pnl
      });
    });

    return Array.from(allocation.entries()).map(([name, data]) => ({
      name,
      value: data.value,
      pnl: data.pnl,
      percentage: (data.value / (profile?.equity || 1)) * 100
    }));
  }, [trades, profile?.equity]);

  // Risk metrics
  const riskMetrics = useMemo(() => {
    const totalExposure = trades.reduce((sum, trade) => 
      sum + (trade.amount * trade.leverage * trade.open_price), 0
    );
    
    const maxDrawdown = Math.min(...performanceHistory.map(p => p.pnl));
    const sharpeRatio = performanceHistory.length > 1 ? 
      (performanceHistory[performanceHistory.length - 1].pnl / 
       (Math.sqrt(performanceHistory.reduce((sum, p, i, history) => 
         i > 0 ? sum + Math.pow(p.pnl - history[i-1].pnl, 2) : sum, 0) / (performanceHistory.length - 1)) || 1)) : 0;

    return {
      totalExposure,
      maxDrawdown,
      sharpeRatio: Math.max(-3, Math.min(3, sharpeRatio)), // Cap between -3 and 3
      winRate: tradeHistory.length > 0 ? 
        (tradeHistory.filter(t => t.pnl > 0).length / tradeHistory.length) * 100 : 0
    };
  }, [trades, tradeHistory, performanceHistory]);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#8884d8', '#82ca9d'];

  return (
    <div className="space-y-6">
      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Equity</p>
              <p className="text-2xl font-bold">${(profile?.equity || 0).toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-primary" />
          </div>
          <div className="mt-2">
            <Badge variant={getTotalPnL() >= 0 ? "default" : "destructive"}>
              {getTotalPnL() >= 0 ? '+' : ''}${getTotalPnL().toFixed(2)}
            </Badge>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Today's P&L</p>
              <p className="text-2xl font-bold">${getTodayPnL().toFixed(2)}</p>
            </div>
            <Activity className="h-8 w-8 text-primary" />
          </div>
          <div className="mt-2">
            <Badge variant={getTodayPnL() >= 0 ? "default" : "destructive"}>
              {((getTodayPnL() / (profile?.balance || 1)) * 100).toFixed(2)}%
            </Badge>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Trades</p>
              <p className="text-2xl font-bold">{trades.length}</p>
            </div>
            <Target className="h-8 w-8 text-primary" />
          </div>
          <div className="mt-2">
            <Badge variant="outline">
              {trades.filter(t => t.pnl > 0).length} profitable
            </Badge>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Margin Level</p>
              <p className="text-2xl font-bold">{getMarginLevel().toFixed(0)}%</p>
            </div>
            <AlertTriangle className={`h-8 w-8 ${getMarginLevel() < 100 ? 'text-red-500' : 'text-primary'}`} />
          </div>
          <div className="mt-2">
            <Badge variant={getMarginLevel() > 200 ? "default" : getMarginLevel() > 100 ? "secondary" : "destructive"}>
              {getMarginLevel() > 200 ? "Safe" : getMarginLevel() > 100 ? "Caution" : "Risk"}
            </Badge>
          </div>
        </Card>
      </div>

      {/* Main Analytics */}
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="allocation">Allocation</TabsTrigger>
          <TabsTrigger value="trades">Trades</TabsTrigger>
          <TabsTrigger value="risk">Risk</TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Portfolio Performance</h3>
              <div className="flex gap-2">
                {(["1D", "1W", "1M", "3M", "1Y"] as const).map((period) => (
                  <Button
                    key={period}
                    variant={timeframe === period ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeframe(period)}
                  >
                    {period}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceHistory}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString()}
                    className="text-xs"
                  />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value: number, name: string) => [`$${value.toFixed(2)}`, name]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="equity" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary))" 
                    fillOpacity={0.1}
                    name="Equity"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="balance" 
                    stroke="hsl(var(--muted-foreground))" 
                    strokeDasharray="5 5"
                    name="Balance"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        {/* Asset Allocation Tab */}
        <TabsContent value="allocation" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <PieChartIcon className="h-5 w-5" />
                Asset Allocation
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={assetAllocation}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percentage }) => `${name} ${percentage.toFixed(1)}%`}
                    >
                      {assetAllocation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Value']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Performance by Asset</h3>
              <div className="space-y-3">
                {assetAllocation.map((asset, index) => (
                  <div key={asset.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <div>
                        <p className="font-medium">{asset.name}</p>
                        <p className="text-sm text-muted-foreground">{asset.percentage.toFixed(1)}% of portfolio</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${asset.value.toFixed(2)}</p>
                      <p className={`text-sm ${asset.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {asset.pnl >= 0 ? '+' : ''}${asset.pnl.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Active Trades Tab */}
        <TabsContent value="trades" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Active Positions</h3>
            <div className="space-y-3">
              {trades.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No active trades</p>
              ) : (
                trades.map((trade) => (
                  <div key={trade.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center gap-2 ${trade.type === 'buy' ? 'text-green-600' : 'text-red-600'}`}>
                        {trade.type === 'buy' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        <span className="font-medium">{trade.type.toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-semibold">{trade.symbol}</p>
                        <p className="text-sm text-muted-foreground">
                          {trade.amount} lots @ {trade.open_price.toFixed(5)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{trade.current_price.toFixed(5)}</p>
                      <p className={`text-sm ${trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Risk Analysis Tab */}
        <TabsContent value="risk" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Risk Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Exposure</span>
                  <span className="font-semibold">${riskMetrics.totalExposure.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Max Drawdown</span>
                  <span className={`font-semibold ${riskMetrics.maxDrawdown < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ${riskMetrics.maxDrawdown.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Sharpe Ratio</span>
                  <span className="font-semibold">{riskMetrics.sharpeRatio.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Win Rate</span>
                  <span className="font-semibold">{riskMetrics.winRate.toFixed(1)}%</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Account Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Account Type</span>
                  <Badge variant="outline">{profile?.account_type || 'Standard'}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Free Margin</span>
                  <span className="font-semibold">${profile?.free_margin?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Used Margin</span>
                  <span className="font-semibold">${profile?.margin?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Trades</span>
                  <span className="font-semibold">{tradeHistory.length + trades.length}</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};