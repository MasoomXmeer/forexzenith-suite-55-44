import React, { useState } from "react";
import { 
  TrendingUp, TrendingDown, RotateCcw, DollarSign, Activity, 
  BarChart3, Target, Settings, RefreshCw, Bell, ChevronUp, ChevronDown,
  Plus, Search, Filter, Menu, X, Zap, PieChart, LineChart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useGestures } from "@/hooks/useGestures";
import { useRealTimeMarketData } from "@/hooks/useMarketData";
import { useRealTrading } from "@/contexts/RealTradingContext";
import { useAuth } from "@/contexts/AuthContext.minimal";
import { useTradingAccount } from "@/hooks/useTradingAccount";
import { TradingTerminal } from "./TradingTerminal";
import { MarketWatchPanel } from "./MarketWatchPanel";
import { QuickActions } from "./QuickActions";

interface Position {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  volume: number;
  openPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
}

const MOCK_POSITIONS: Position[] = [
  {
    id: '1',
    symbol: 'EURUSD',
    type: 'BUY',
    volume: 0.1,
    openPrice: 1.0850,
    currentPrice: 1.0875,
    pnl: 25.00,
    pnlPercent: 2.3
  },
  {
    id: '2',
    symbol: 'GBPUSD',
    type: 'SELL',
    volume: 0.05,
    openPrice: 1.2650,
    currentPrice: 1.2620,
    pnl: 15.00,
    pnlPercent: 1.2
  }
];

export const MobileTradingInterface = () => {
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [scale, setScale] = useState(1);
  const [activeTab, setActiveTab] = useState("overview");
  const [menuOpen, setMenuOpen] = useState(false);

  const { user, profile } = useAuth();
  const { trades } = useRealTrading();
  const { primaryAccount } = useTradingAccount();
  
  const watchlistSymbols = ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", "XAUUSD"];
  const { data: marketData } = useRealTimeMarketData(watchlistSymbols);

  const gestureRef = useGestures({
    onSwipeLeft: () => {
      const tabs = ["overview", "positions", "terminal", "markets"];
      const currentIndex = tabs.indexOf(activeTab);
      const nextIndex = (currentIndex + 1) % tabs.length;
      setActiveTab(tabs[nextIndex]);
    },
    onSwipeRight: () => {
      const tabs = ["overview", "positions", "terminal", "markets"];
      const currentIndex = tabs.indexOf(activeTab);
      const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
      setActiveTab(tabs[prevIndex]);
    },
    onSwipeUp: () => {
      setSelectedPosition(null);
    },
    onDoubleTap: () => {
      console.log('Double tapped - quick action');
    },
    onPinch: (newScale) => {
      setScale(Math.max(0.8, Math.min(1.2, newScale)));
    },
    threshold: 50
  });

  const formatPrice = (price: number, symbol: string = "") => {
    const digits = symbol.includes("JPY") ? 3 : symbol.startsWith("XAU") ? 2 : 5;
    return price.toFixed(digits);
  };
  
  const formatPnL = (pnl: number) => (pnl >= 0 ? '+' : '') + pnl.toFixed(2);

  const totalPnL = MOCK_POSITIONS.reduce((sum, pos) => sum + pos.pnl, 0);
  const totalEquity = (primaryAccount?.balance || 10000) + totalPnL;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 safe-area-pb">
      {/* Mobile Header */}
      <header className="xm-nav safe-area-top">
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
              <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Advanced Charts
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Refresh Data
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Account Summary Card */}
      <div className="px-4 py-3">
        <Card className="xm-card border-0 bg-gradient-to-br from-primary/5 via-background to-primary/10">
          <CardContent className="p-4">
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
                  ${totalEquity.toLocaleString()}
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
                  {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div 
        ref={gestureRef}
        className="flex-1 px-4"
        style={{ transform: `scale(${scale})`, transformOrigin: 'center top' }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          {/* Tab Navigation */}
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
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Button className="h-12 gap-2 bg-gradient-to-r from-success to-success/80">
                    <TrendingUp className="h-4 w-4" />
                    Quick Buy
                  </Button>
                  <Button variant="outline" className="h-12 gap-2 border-destructive text-destructive hover:bg-destructive hover:text-white">
                    <TrendingDown className="h-4 w-4" />
                    Quick Sell
                  </Button>
                </div>
                <Button variant="outline" className="w-full h-10 gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Close All Positions
                </Button>
              </CardContent>
            </Card>

            {/* Top Movers */}
            <Card className="xm-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Top Movers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {marketData?.slice(0, 4).map((market) => (
                  <div key={market.symbol} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div>
                      <div className="font-semibold text-sm">{market.symbol}</div>
                      <div className="text-xs text-muted-foreground">{market.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm">{formatPrice(market.price, market.symbol)}</div>
                      <div className={`text-xs flex items-center gap-1 ${
                        market.changePercent >= 0 ? 'text-success' : 'text-destructive'
                      }`}>
                        {market.changePercent >= 0 ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                        {Math.abs(market.changePercent).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Positions Tab */}
          <TabsContent value="positions" className="space-y-4 m-0">
            <Card className="xm-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <PieChart className="h-4 w-4 text-primary" />
                    Active Positions
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {MOCK_POSITIONS.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {MOCK_POSITIONS.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-muted-foreground">No open positions</p>
                    <p className="text-sm text-muted-foreground mt-1">Start trading to see your positions</p>
                  </div>
                ) : (
                  MOCK_POSITIONS.map((position) => (
                    <Card 
                      key={position.id}
                      className="xm-card cursor-pointer transition-all duration-200 active:scale-95"
                      onClick={() => setSelectedPosition(position)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Badge 
                              variant={position.type === 'BUY' ? 'default' : 'destructive'}
                              className="text-xs"
                            >
                              {position.type}
                            </Badge>
                            <span className="font-semibold text-sm">{position.symbol}</span>
                          </div>
                          <div className={`font-semibold text-sm ${
                            position.pnl >= 0 ? 'text-success' : 'text-destructive'
                          }`}>
                            ${formatPnL(position.pnl)}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-muted-foreground">Volume:</span>
                            <div className="font-mono">{position.volume} lots</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Open:</span>
                            <div className="font-mono">{formatPrice(position.openPrice)}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trading Terminal Tab */}
          <TabsContent value="terminal" className="space-y-4 m-0">
            <Card className="xm-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Trading Terminal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TradingTerminal />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Markets Tab */}
          <TabsContent value="markets" className="space-y-4 m-0">
            <Card className="xm-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <LineChart className="h-4 w-4 text-primary" />
                  Market Watch
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <MarketWatchPanel />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Position Detail Sheet */}
      {selectedPosition && (
        <Sheet open={!!selectedPosition} onOpenChange={() => setSelectedPosition(null)}>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Badge variant={selectedPosition.type === 'BUY' ? 'default' : 'destructive'}>
                  {selectedPosition.type}
                </Badge>
                {selectedPosition.symbol}
              </SheetTitle>
            </SheetHeader>
            
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Volume</div>
                  <div className="font-mono text-lg">{selectedPosition.volume} lots</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Open Price</div>
                  <div className="font-mono text-lg">{formatPrice(selectedPosition.openPrice)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Current Price</div>
                  <div className="font-mono text-lg">{formatPrice(selectedPosition.currentPrice)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">P&L</div>
                  <div className={`font-mono text-lg font-bold ${
                    selectedPosition.pnl >= 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    ${formatPnL(selectedPosition.pnl)}
                  </div>
                </div>
              </div>

              <Card className="xm-card bg-gradient-to-br from-primary/5 to-primary/10">
                <CardContent className="p-4 text-center">
                  <div className="text-sm text-muted-foreground mb-2">Total P&L</div>
                  <div className={`text-2xl font-bold ${
                    selectedPosition.pnl >= 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    ${formatPnL(selectedPosition.pnl)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    ({selectedPosition.pnlPercent >= 0 ? '+' : ''}{selectedPosition.pnlPercent.toFixed(1)}%)
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="lg" className="h-12">
                  Modify Position
                </Button>
                <Button variant="destructive" size="lg" className="h-12">
                  Close Position
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Gesture Hint */}
      <div className="text-center text-xs text-muted-foreground px-4 py-2">
        Swipe to navigate • Pinch to zoom • Tap for details
      </div>
    </div>
  );
};