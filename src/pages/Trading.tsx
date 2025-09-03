import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext.minimal";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Activity, 
  ArrowUpCircle,
  ArrowDownCircle,
  DollarSign,
  RefreshCw,
  Target,
  ChevronUp,
  ChevronDown,
  Zap,
  PieChart,
  LineChart,
  X,
  Shield,
  Settings,
  Bell,
  Menu,
  Eye,
  EyeOff
} from "lucide-react";
import { TradingViewWidget } from "@/components/TradingView/TradingViewWidget";
import { useRealTimeMarketData } from "@/hooks/useMarketData";
import { useTradingLogic } from "@/hooks/useTradingLogic";
import { useTradingAccount } from "@/hooks/useTradingAccount";
import { platformConfig } from "@/config/platform";

interface OrderData {
  symbol: string;
  type: "buy" | "sell";
  orderType: "market" | "limit" | "stop";
  amount: number;
  price?: number;
  stopLoss?: number;
  takeProfit?: number;
  leverage: string;
}

const Trading = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedSymbol, setSelectedSymbol] = useState("EURUSD");
  const [showBalance, setShowBalance] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const [orderData, setOrderData] = useState<OrderData>({
    symbol: "EURUSD",
    type: "buy",
    orderType: "market",
    amount: 0.01,
    leverage: "1:500"
  });

  // Get watchlist from platform config
  const [watchlist] = useState(platformConfig.trading.supportedPairs.slice(0, 8));
  const watchlistSymbols = watchlist.map(p => p.symbol);
  const { data: marketData } = useRealTimeMarketData(watchlistSymbols);
  const { primaryAccount } = useTradingAccount();
  
  // Use advanced trading logic
  const { 
    openPositions, 
    accountMetrics, 
    isLoading,
    openTrade, 
    closePosition,
    calculateRequiredMargin,
    getRiskMetrics
  } = useTradingLogic();

  // Auto-refresh prices every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Convert to TradingView format
  const getTradingViewSymbol = (symbol: string): string => {
    const mappings: { [key: string]: string } = {
      'EURUSD': 'FX:EURUSD',
      'GBPUSD': 'FX:GBPUSD', 
      'USDJPY': 'FX:USDJPY',
      'AUDUSD': 'FX:AUDUSD',
      'USDCAD': 'FX:USDCAD',
      'XAUUSD': 'TVC:GOLD',
      'XAGUSD': 'TVC:SILVER',
      'USOIL': 'TVC:USOIL',
      'US30': 'TVC:DJI',
      'US500': 'TVC:SPX500',
      'NAS100': 'TVC:NDX'
    };
    return mappings[symbol] || `FX:${symbol}`;
  };

  const currentPriceData = marketData?.find(p => p.symbol === selectedSymbol);
  const currentPrice = currentPriceData?.bid || 1.0850;

  const handlePlaceOrder = async () => {
    try {
      await openTrade({
        symbol: orderData.symbol,
        type: orderData.type,
        amount: orderData.amount,
        leverage: parseInt(orderData.leverage.split(':')[1]),
        stopLoss: orderData.stopLoss,
        takeProfit: orderData.takeProfit,
        price: orderData.orderType === 'market' ? undefined : orderData.price
      });
    } catch (error: any) {
      toast({
        title: "Trade Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const formatPrice = (price: number, symbol: string = "") => {
    const digits = symbol.includes("JPY") ? 3 : symbol.startsWith("XAU") ? 2 : 5;
    return price.toFixed(digits);
  };

  const formatPnL = (pnl: number) => (pnl >= 0 ? '+' : '') + pnl.toFixed(2);

  const totalPnL = openPositions.reduce((sum, pos) => sum + pos.pnl, 0);
  const balance = accountMetrics?.balance || primaryAccount?.balance || 10000;
  const totalEquity = balance + totalPnL;
  const riskMetrics = getRiskMetrics();

  // Mobile render
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        {/* Mobile Header */}
        <header className="xm-nav border-b">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-primary rounded-lg">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-foreground">AonePrime</h1>
                  <p className="text-xs text-muted-foreground">Trading Terminal</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                  <span className="text-muted-foreground">Live</span>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8">
                  <Menu className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Account Summary Card */}
        <div className="px-4 py-3">
          <Card className="xm-card border-0 bg-gradient-to-br from-primary/5 via-background to-primary/10">
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Balance</span>
                  <div className="flex items-center gap-2">
                    <p className={`font-mono text-lg font-bold text-foreground transition-all duration-300 ${
                      showBalance ? 'opacity-100' : 'opacity-0'
                    }`}>
                      {showBalance ? `$${balance.toLocaleString()}` : '****'}
                    </p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={() => setShowBalance(!showBalance)}
                    >
                      {showBalance ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Equity</span>
                  <p className={`font-mono text-lg font-bold text-foreground transition-all duration-300 ${
                    showBalance ? 'opacity-100' : 'opacity-0'
                  }`}>
                    {showBalance ? `$${totalEquity.toLocaleString()}` : '****'}
                  </p>
                </div>
              </div>
              
              <Separator className="my-3" />
              
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
                    {formatPnL(totalPnL)}
                  </span>
                </div>
              </div>
              
              {/* Progress bar for margin level */}
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Margin Level</span>
                  <span className="font-medium">{accountMetrics?.marginLevel?.toFixed(0) || 'N/A'}%</span>
                </div>
                <Progress value={Math.min(100, accountMetrics?.marginLevel || 0)} className="h-2" />
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1 px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-2 -mx-4 px-4">
              <TabsList className="grid w-full grid-cols-4 h-12 bg-muted/50">
                <TabsTrigger value="overview" className="text-xs gap-1 flex-col py-1">
                  <DollarSign className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="positions" className="text-xs gap-1 flex-col py-1">
                  <PieChart className="h-4 w-4" />
                  Positions
                </TabsTrigger>
                <TabsTrigger value="terminal" className="text-xs gap-1 flex-col py-1">
                  <Activity className="h-4 w-4" />
                  Trading
                </TabsTrigger>
                <TabsTrigger value="markets" className="text-xs gap-1 flex-col py-1">
                  <LineChart className="h-4 w-4" />
                  Markets
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 m-0">
              {/* Quick Actions */}
              <Card className="xm-card">
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="h-4 w-4 text-primary" />
                    <h3 className="text-base font-semibold">Quick Actions</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        className="h-12 gap-2 bg-gradient-to-r from-success to-success/80"
                        onClick={() => {
                          setOrderData(prev => ({...prev, type: "buy", symbol: selectedSymbol}));
                          handlePlaceOrder();
                        }}
                        disabled={isLoading}
                      >
                        <TrendingUp className="h-4 w-4" />
                        Quick Buy
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-12 gap-2 border-destructive text-destructive hover:bg-destructive hover:text-white"
                        onClick={() => {
                          setOrderData(prev => ({...prev, type: "sell", symbol: selectedSymbol}));
                          handlePlaceOrder();
                        }}
                        disabled={isLoading}
                      >
                        <TrendingDown className="h-4 w-4" />
                        Quick Sell
                      </Button>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full h-10 gap-2"
                      onClick={() => {
                        openPositions.forEach(pos => closePosition(pos.id));
                      }}
                      disabled={isLoading || openPositions.length === 0}
                    >
                      <X className="h-4 w-4" />
                      Close All Positions ({openPositions.length})
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Symbol Selector */}
              <Card className="xm-card">
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="h-4 w-4 text-primary" />
                    <h3 className="text-base font-semibold">Select Symbol</h3>
                  </div>
                  <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {watchlist.map((pair) => (
                        <SelectItem key={pair.symbol} value={pair.symbol} className="h-12">
                          <div className="flex items-center justify-between w-full">
                            <span className="font-medium">{pair.symbol}</span>
                            <span className="text-sm text-muted-foreground ml-2">{pair.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Current Price</span>
                      <span className="font-mono text-lg">{formatPrice(currentPrice, selectedSymbol)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Positions Tab */}
            <TabsContent value="positions" className="space-y-4 m-0">
              <Card className="xm-card">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Open Positions</span>
                    <Badge variant="secondary">{openPositions.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {openPositions.length === 0 ? (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-muted-foreground">No open positions</p>
                      <p className="text-sm text-muted-foreground mt-1">Start trading to see your positions here</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {openPositions.map((position) => (
                        <div key={position.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant={position.type === 'buy' ? 'default' : 'destructive'} className="text-xs">
                                {position.type.toUpperCase()}
                              </Badge>
                              <span className="font-semibold">{position.symbol}</span>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                              onClick={() => closePosition(position.id)}
                              disabled={isLoading}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">Amount</div>
                              <div className="font-mono">{position.amount} lots</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Open Price</div>
                              <div className="font-mono">{formatPrice(position.openPrice, position.symbol)}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Current Price</div>
                              <div className="font-mono">{formatPrice(position.currentPrice, position.symbol)}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">P&L</div>
                              <div className={`font-mono font-semibold ${
                                position.pnl >= 0 ? 'text-success' : 'text-destructive'
                              }`}>
                                ${formatPnL(position.pnl)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Trading Terminal Tab */}
            <TabsContent value="terminal" className="space-y-4 m-0">
              <Card className="xm-card">
                <CardHeader>
                  <CardTitle>Place Order</CardTitle>
                </CardHeader>
                <CardContent>
                  <OrderForm
                    orderData={{...orderData, symbol: selectedSymbol}}
                    setOrderData={setOrderData}
                    currentPrice={currentPrice}
                    onPlaceOrder={handlePlaceOrder}
                    isLoading={isLoading}
                    requiredMargin={calculateRequiredMargin ? 
                      calculateRequiredMargin(selectedSymbol, orderData.amount, parseInt(orderData.leverage.split(':')[1]), currentPrice) : 
                      (orderData.amount * currentPrice * 100000) / parseInt(orderData.leverage.split(':')[1])
                    }
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Markets Tab */}
            <TabsContent value="markets" className="space-y-4 m-0">
              <Card className="xm-card">
                <CardHeader>
                  <CardTitle>Market Watch</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {watchlist.map((pair) => {
                      const priceData = marketData?.find(p => p.symbol === pair.symbol);
                      const price = priceData?.bid || Math.random() * 2;
                      const change = priceData?.changePercent || (Math.random() - 0.5) * 2;
                      const isPositive = change > 0;
                      
                      return (
                        <div
                          key={pair.symbol}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                            selectedSymbol === pair.symbol ? 'bg-primary/10 border-primary' : 'border-border'
                          }`}
                          onClick={() => setSelectedSymbol(pair.symbol)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-sm">{pair.symbol}</div>
                              <div className="text-xs text-muted-foreground">{pair.name}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-mono text-sm">{formatPrice(price, pair.symbol)}</div>
                              <div className={`text-xs flex items-center gap-1 ${
                                isPositive ? 'text-success' : 'text-destructive'
                              }`}>
                                {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                {Math.abs(change).toFixed(2)}%
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  // Desktop render
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
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                <span>Live Data</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setRefreshKey(prev => prev + 1)} className="h-9 w-9">
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
        <aside className="w-80 border-r bg-card/50 backdrop-blur-sm flex flex-col">
          {/* Account Summary */}
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
                      <div className="flex items-center gap-2">
                        <p className={`font-mono text-lg font-bold text-foreground transition-all ${
                          showBalance ? 'opacity-100' : 'opacity-0'
                        }`}>
                          {showBalance ? `$${balance.toLocaleString()}` : '****'}
                        </p>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0"
                          onClick={() => setShowBalance(!showBalance)}
                        >
                          {showBalance ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Equity</span>
                      <p className={`font-mono text-lg font-bold text-foreground transition-all ${
                        showBalance ? 'opacity-100' : 'opacity-0'
                      }`}>
                        {showBalance ? `$${totalEquity.toLocaleString()}` : '****'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Free Margin</span>
                      <p className="font-mono font-medium text-success">
                        ${(accountMetrics?.freeMargin || balance).toLocaleString()}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Margin Level</span>
                      <p className={`font-mono font-semibold ${
                        (accountMetrics?.marginLevel || 0) > 200 ? 'text-success' : 
                        (accountMetrics?.marginLevel || 0) > 100 ? 'text-warning' : 'text-destructive'
                      }`}>
                        {accountMetrics?.marginLevel?.toFixed(0) || 'N/A'}%
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
                        {formatPnL(totalPnL)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                <ScrollArea className="h-full">
                  <div className="px-4 space-y-2">
                    {watchlist.map((pair) => {
                      const priceData = marketData?.find(p => p.symbol === pair.symbol);
                      const price = priceData?.bid || Math.random() * 2;
                      const change = priceData?.changePercent || (Math.random() - 0.5) * 2;
                      const isPositive = change > 0;
                      
                      return (
                        <div
                          key={pair.symbol}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                            selectedSymbol === pair.symbol ? 'bg-primary/10 border-primary' : 'border-border'
                          }`}
                          onClick={() => {
                            setSelectedSymbol(pair.symbol);
                            setOrderData(prev => ({ ...prev, symbol: pair.symbol }));
                          }}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-sm">{pair.symbol}</div>
                              <div className="text-xs text-muted-foreground">{pair.name}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-mono text-sm">{formatPrice(price, pair.symbol)}</div>
                              <div className={`text-xs flex items-center gap-1 ${
                                isPositive ? 'text-success' : 'text-destructive'
                              }`}>
                                {isPositive ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                {Math.abs(change).toFixed(2)}%
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </aside>

        {/* Main Content */}
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
                        variant={(currentPriceData?.changePercent || 0) >= 0 ? "default" : "destructive"}
                        className="text-sm px-3 py-1"
                      >
                        {(currentPriceData?.changePercent || 0) >= 0 ? (
                          <ChevronUp className="h-4 w-4 mr-1" />
                        ) : (
                          <ChevronDown className="h-4 w-4 mr-1" />
                        )}
                        {Math.abs(currentPriceData?.changePercent || 0).toFixed(2)}%
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex items-center gap-4">
                    <span>Spread: {platformConfig.trading.supportedPairs.find(p => p.symbol === selectedSymbol)?.baseSpread || 1.0} pips</span>
                    <span>Positions: {openPositions.filter(p => p.symbol === selectedSymbol).length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chart and Terminal Layout */}
          <div className="flex-1 flex">
            {/* Chart Area */}
            <div className="flex-1 p-6">
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

            {/* Right Panel - Trading Interface */}
            <div className="w-96 border-l bg-card/30 backdrop-blur-sm">
              <Tabs defaultValue="terminal" className="h-full flex flex-col">
                <div className="border-b px-6 py-3">
                  <TabsList className="grid w-full grid-cols-2 h-10 bg-muted/50">
                    <TabsTrigger value="terminal" className="text-sm gap-2">
                      <Activity className="h-4 w-4" />
                      Trading
                    </TabsTrigger>
                    <TabsTrigger value="positions" className="text-sm gap-2">
                      <PieChart className="h-4 w-4" />
                      Positions ({openPositions.length})
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="terminal" className="flex-1 p-6 m-0">
                  <OrderForm
                    orderData={{...orderData, symbol: selectedSymbol}}
                    setOrderData={setOrderData}
                    currentPrice={currentPrice}
                    onPlaceOrder={handlePlaceOrder}
                    isLoading={isLoading}
                    requiredMargin={calculateRequiredMargin ? 
                      calculateRequiredMargin(selectedSymbol, orderData.amount, parseInt(orderData.leverage.split(':')[1]), currentPrice) : 
                      (orderData.amount * currentPrice * 100000) / parseInt(orderData.leverage.split(':')[1])
                    }
                  />
                </TabsContent>
                
                <TabsContent value="positions" className="flex-1 m-0">
                  <ScrollArea className="h-full">
                    <div className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-foreground">Open Positions</h3>
                          <Badge variant="secondary" className="text-xs">
                            {openPositions.length}
                          </Badge>
                        </div>
                        
                        {openPositions.length === 0 ? (
                          <Card className="xm-card">
                            <CardContent className="p-8 text-center">
                              <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                              <p className="text-muted-foreground">No open positions</p>
                              <p className="text-sm text-muted-foreground mt-1">Start trading to see your positions here</p>
                            </CardContent>
                          </Card>
                        ) : (
                          <div className="space-y-3">
                            {openPositions.map((position) => (
                              <Card key={position.id} className="xm-card">
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                      <Badge variant={position.type === 'buy' ? 'default' : 'destructive'} className="text-xs">
                                        {position.type.toUpperCase()}
                                      </Badge>
                                      <span className="font-semibold text-foreground">{position.symbol}</span>
                                    </div>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                      onClick={() => closePosition(position.id)}
                                      disabled={isLoading}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Amount:</span>
                                      <span className="font-mono">{position.amount} lots</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Open Price:</span>
                                      <span className="font-mono">{formatPrice(position.openPrice, position.symbol)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Current:</span>
                                      <span className="font-mono">{formatPrice(position.currentPrice, position.symbol)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">P&L:</span>
                                      <span className={`font-mono font-semibold ${
                                        position.pnl >= 0 ? 'text-success' : 'text-destructive'
                                      }`}>
                                        ${formatPnL(position.pnl)}
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
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

interface OrderFormProps {
  orderData: OrderData;
  setOrderData: (data: OrderData) => void;
  currentPrice: number;
  onPlaceOrder: () => void;
  isLoading: boolean;
  requiredMargin: number;
}

const OrderForm = ({ orderData, setOrderData, currentPrice, onPlaceOrder, isLoading, requiredMargin }: OrderFormProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium">Order Type</label>
          <Select value={orderData.orderType} onValueChange={(value: any) => 
            setOrderData({...orderData, orderType: value})
          }>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="market">Market</SelectItem>
              <SelectItem value="limit">Limit</SelectItem>
              <SelectItem value="stop">Stop</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium">Amount (Lots)</label>
          <Input
            type="number"
            step="0.01"
            min="0.01"
            value={orderData.amount}
            onChange={(e) => setOrderData({...orderData, amount: parseFloat(e.target.value) || 0.01})}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Leverage</label>
          <Select value={orderData.leverage} onValueChange={(value) => 
            setOrderData({...orderData, leverage: value})
          }>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {platformConfig.trading.leverageOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {orderData.orderType !== "market" && (
          <div>
            <label className="text-sm font-medium">Price</label>
            <Input
              type="number"
              step="0.00001"
              value={orderData.price || currentPrice}
              onChange={(e) => setOrderData({...orderData, price: parseFloat(e.target.value)})}
            />
          </div>
        )}

        <div>
          <label className="text-sm font-medium">Stop Loss</label>
          <Input
            type="number"
            step="0.00001"
            placeholder="Optional"
            value={orderData.stopLoss || ''}
            onChange={(e) => setOrderData({...orderData, stopLoss: e.target.value ? parseFloat(e.target.value) : undefined})}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Take Profit</label>
          <Input
            type="number"
            step="0.00001"
            placeholder="Optional"
            value={orderData.takeProfit || ''}
            onChange={(e) => setOrderData({...orderData, takeProfit: e.target.value ? parseFloat(e.target.value) : undefined})}
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={() => {
              setOrderData({...orderData, type: "buy"});
              onPlaceOrder();
            }}
            disabled={isLoading}
            className="bg-success hover:bg-success/90 text-white font-semibold"
          >
            <ArrowUpCircle className="h-4 w-4 mr-2" />
            Buy {orderData.symbol}
          </Button>
          <Button 
            onClick={() => {
              setOrderData({...orderData, type: "sell"});
              onPlaceOrder();
            }}
            disabled={isLoading}
            variant="destructive"
            className="font-semibold"
          >
            <ArrowDownCircle className="h-4 w-4 mr-2" />
            Sell {orderData.symbol}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center space-y-1">
          <div>Current Price: {(currentPrice).toFixed(5)}</div>
          <div>Margin Required: ${requiredMargin.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
};

export default Trading;