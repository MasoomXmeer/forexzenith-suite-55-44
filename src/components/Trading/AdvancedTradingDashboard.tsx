import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  TrendingUp, TrendingDown, Activity, DollarSign, 
  BarChart3, Settings, RefreshCw, Bell, ChevronUp, ChevronDown,
  Zap, Target, Shield, PieChart, LineChart, Monitor,
  Layers, Calendar, Filter, Search, Plus, Minus
} from "lucide-react";
import { MarketWatchPanel } from "./MarketWatchPanel";
import { TradingTerminal } from "./TradingTerminal";
import { PortfolioSummary } from "./PortfolioSummary";
import { PortfolioAnalytics } from "./PortfolioAnalytics";
import { QuickActions } from "./QuickActions";
import { MarketStatus } from "./MarketStatus";
import { TradingViewWidget } from "@/components/TradingView/TradingViewWidget";
import { useRealTimeMarketData } from "@/hooks/useMarketData";
import { useRealTrading } from "@/contexts/RealTradingContext";
import { useAuth } from "@/contexts/AuthContext.minimal";
import { useTradingAccount } from "@/hooks/useTradingAccount";
import { platformConfig } from "@/config/platform";

export const AdvancedTradingDashboard = () => {
  const [selectedSymbol, setSelectedSymbol] = useState("EURUSD");
  const [layout, setLayout] = useState<"default" | "chart-focus" | "terminal-focus">("default");
  const [refreshKey, setRefreshKey] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const { user, profile } = useAuth();
  const { trades } = useRealTrading();
  const { primaryAccount } = useTradingAccount();
  
  // Watch main forex pairs for quick overview
  const watchlistSymbols = ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", "XAUUSD"];
  const { data: marketData } = useRealTimeMarketData(watchlistSymbols);

  const currentPrice = marketData?.find(p => p.symbol === selectedSymbol)?.bid || 1.0850;
  const priceChange = marketData?.find(p => p.symbol === selectedSymbol)?.changePercent || 0;

  const getTradingViewSymbol = (symbol: string): string => {
    const mappings: { [key: string]: string } = {
      'EURUSD': 'FX:EURUSD',
      'GBPUSD': 'FX:GBPUSD', 
      'USDJPY': 'FX:USDJPY',
      'AUDUSD': 'FX:AUDUSD',
      'USDCAD': 'FX:USDCAD',
      'USDCHF': 'FX:USDCHF',
      'NZDUSD': 'FX:NZDUSD',
      'EURGBP': 'FX:EURGBP',
      'EURJPY': 'FX:EURJPY',
      'GBPJPY': 'FX:GBPJPY',
      'XAUUSD': 'TVC:GOLD',
      'XAGUSD': 'TVC:SILVER',
      'USOIL': 'TVC:USOIL',
      'US30': 'TVC:DJI',
      'US500': 'TVC:SPX500',
      'NAS100': 'TVC:NDX'
    };
    return mappings[symbol] || `FX:${symbol}`;
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const formatPrice = (price: number, symbol: string) => {
    const digits = symbol.includes("JPY") ? 3 : symbol.startsWith("XAU") ? 2 : 5;
    return price.toFixed(digits);
  };

  const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0);
  const marginLevel = profile?.margin ? ((profile.equity || 0) / profile.margin) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="xm-nav border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-primary rounded-lg">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Trading Terminal</h1>
                  <p className="text-sm text-muted-foreground">Professional Trading Platform</p>
                </div>
              </div>
              <Separator orientation="vertical" className="h-8" />
              <MarketStatus />
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                <span>Live Data</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleRefresh} className="h-9 w-9">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-9 w-9">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-9 w-9">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Sidebar */}
        <aside className={`${sidebarCollapsed ? 'w-16' : 'w-80'} border-r bg-card/50 backdrop-blur-sm transition-all duration-300 flex flex-col`}>
          {/* Sidebar Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <h2 className="font-semibold text-foreground">Account Overview</h2>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="h-8 w-8"
              >
                {sidebarCollapsed ? <Plus className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {!sidebarCollapsed && (
            <>
              {/* Account Summary Card */}
              <div className="p-4">
                <Card className="xm-card border-0 bg-gradient-to-br from-primary/5 via-background to-primary/5">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-3">
                        <DollarSign className="h-5 w-5 text-primary" />
                        <span className="font-semibold text-foreground">Live Account</span>
                        <Badge variant="outline" className="ml-auto text-xs">
                          {primaryAccount?.account_type || "Demo"}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Balance</span>
                          <p className="font-mono text-lg font-bold text-foreground">
                            ${(primaryAccount?.balance || 10000).toLocaleString()}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Equity</span>
                          <p className="font-mono text-lg font-bold text-foreground">
                            ${((primaryAccount?.balance || 10000) + totalPnL).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Free Margin</span>
                          <p className="font-mono font-medium text-success">
                            ${(primaryAccount?.balance || 10000).toLocaleString()}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Margin Level</span>
                          <p className={`font-mono font-semibold ${
                            marginLevel > 200 ? 'text-success' : marginLevel > 100 ? 'text-warning' : 'text-destructive'
                          }`}>
                            {marginLevel > 0 ? marginLevel.toFixed(0) : 'N/A'}%
                          </p>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">P&L Today</span>
                        <div className="flex items-center gap-2">
                          {totalPnL >= 0 ? (
                            <TrendingUp className="h-4 w-4 text-success" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-destructive" />
                          )}
                          <span className={`font-mono font-bold ${
                            totalPnL >= 0 ? 'text-success' : 'text-destructive'
                          }`}>
                            {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="px-4 pb-4">
                <QuickActions />
              </div>

              {/* Market Watch */}
              <div className="flex-1 px-4 pb-4">
                <Card className="xm-card h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Market Watch
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 h-[calc(100%-60px)]">
                    <MarketWatchPanel />
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col">
          {/* Chart Header */}
          <div className="p-6 border-b bg-card/30 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-primary rounded-lg">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{selectedSymbol}</h2>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xl text-foreground">
                        {formatPrice(currentPrice, selectedSymbol)}
                      </span>
                      <Badge 
                        variant={priceChange >= 0 ? "default" : "destructive"}
                        className="text-sm px-3 py-1"
                      >
                        {priceChange >= 0 ? (
                          <ChevronUp className="h-4 w-4 mr-1" />
                        ) : (
                          <ChevronDown className="h-4 w-4 mr-1" />
                        )}
                        {Math.abs(priceChange).toFixed(2)}%
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex items-center gap-4">
                    <span>Spread: {platformConfig.trading.supportedPairs.find(p => p.symbol === selectedSymbol)?.baseSpread || 1.0} pips</span>
                    <span>Volume: {Math.floor(Math.random() * 1000000).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={layout === "default" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLayout("default")}
                  className="gap-2"
                >
                  <Layers className="h-4 w-4" />
                  Default
                </Button>
                <Button
                  variant={layout === "chart-focus" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLayout("chart-focus")}
                  className="gap-2"
                >
                  <Monitor className="h-4 w-4" />
                  Chart Focus
                </Button>
                <Button
                  variant={layout === "terminal-focus" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLayout("terminal-focus")}
                  className="gap-2"
                >
                  <LineChart className="h-4 w-4" />
                  Terminal
                </Button>
              </div>
            </div>
          </div>

          {/* Chart and Terminal Layout */}
          <div className="flex-1 flex">
            {/* Chart Area */}
            <div className={`${layout === "terminal-focus" ? 'w-1/2' : 'flex-1'} p-6`}>
              <Card className="xm-card h-full">
                <TradingViewWidget
                  key={`${selectedSymbol}-${refreshKey}`}
                  symbol={getTradingViewSymbol(selectedSymbol)}
                  height="100%"
                  theme="light"
                  interval="15"
                  className="border-0 rounded-lg"
                  hide_top_toolbar={false}
                  save_image={false}
                />
              </Card>
            </div>

            {/* Right Panel - Trading Terminal & Analytics */}
            {layout !== "chart-focus" && (
              <div className={`${layout === "terminal-focus" ? 'w-1/2' : 'w-96'} border-l bg-card/30 backdrop-blur-sm`}>
                <Tabs defaultValue="terminal" className="h-full flex flex-col">
                  <div className="border-b px-6 py-3">
                    <TabsList className="grid w-full grid-cols-3 h-10 bg-muted/50">
                      <TabsTrigger value="terminal" className="text-sm gap-2">
                        <Activity className="h-4 w-4" />
                        Trading
                      </TabsTrigger>
                      <TabsTrigger value="positions" className="text-sm gap-2">
                        <PieChart className="h-4 w-4" />
                        Positions
                      </TabsTrigger>
                      <TabsTrigger value="analytics" className="text-sm gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Analytics
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="terminal" className="flex-1 p-6 m-0">
                    <TradingTerminal />
                  </TabsContent>
                  
                  <TabsContent value="positions" className="flex-1 m-0">
                    <ScrollArea className="h-full">
                      <div className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-foreground">Open Positions</h3>
                            <Badge variant="secondary" className="text-xs">
                              {trades.length}
                            </Badge>
                          </div>
                          
                          {trades.length === 0 ? (
                            <Card className="xm-card">
                              <CardContent className="p-8 text-center">
                                <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                                <p className="text-muted-foreground">No open positions</p>
                                <p className="text-sm text-muted-foreground mt-1">Start trading to see your positions here</p>
                              </CardContent>
                            </Card>
                          ) : (
                            <div className="space-y-3">
                              {trades.map((trade) => (
                                <Card key={trade.id} className="xm-card">
                                  <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="flex items-center gap-3">
                                        <Badge variant={trade.type === 'buy' ? 'default' : 'destructive'} className="text-xs">
                                          {trade.type.toUpperCase()}
                                        </Badge>
                                        <span className="font-semibold text-foreground">{trade.symbol}</span>
                                      </div>
                                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive">
                                        ×
                                      </Button>
                                    </div>
                                    
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Volume:</span>
                                        <span className="font-mono">{trade.amount} lots</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Open:</span>
                                        <span className="font-mono">{trade.open_price.toFixed(5)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Current:</span>
                                        <span className="font-mono">{trade.current_price.toFixed(5)}</span>
                                      </div>
                                      <Separator />
                                      <div className="flex justify-between font-semibold">
                                        <span>P&L:</span>
                                        <span className={trade.pnl >= 0 ? 'text-success' : 'text-destructive'}>
                                          {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                                        </span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="analytics" className="flex-1 m-0">
                    <ScrollArea className="h-full">
                      <div className="p-6">
                        <PortfolioAnalytics />
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};