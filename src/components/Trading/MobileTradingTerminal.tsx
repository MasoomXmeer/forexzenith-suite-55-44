import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Activity, 
  DollarSign,
  List
} from "lucide-react";
import { platformConfig } from "@/config/platform";
import { useRealTimeMarketData } from "@/hooks/useMarketData";
import { useRealTrading } from "@/contexts/RealTradingContext";
import { TradingViewWidget } from "@/components/TradingView/TradingViewWidget";
import { toast } from "@/hooks/use-toast";

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

export const MobileTradingTerminal = () => {
  const [selectedSymbol, setSelectedSymbol] = useState("EURUSD");
  const [orderData, setOrderData] = useState<OrderData>({
    symbol: "EURUSD",
    type: "buy",
    orderType: "market",
    amount: 0.01,
    leverage: "1:500"
  });
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
  
  const [watchlist] = useState(platformConfig.trading.supportedPairs.slice(0, 8));
  const watchlistSymbols = watchlist.map(p => p.symbol);
  const { data: marketData } = useRealTimeMarketData(watchlistSymbols);
  const { openTrade } = useRealTrading();

  const currentPriceData = marketData?.find(p => p.symbol === selectedSymbol);
  const currentPrice = currentPriceData?.bid || 1.0850;
  const priceChange = currentPriceData?.changePercent || 0;

  const handlePlaceOrder = (type: "buy" | "sell") => {
    const trade = {
      symbol: selectedSymbol,
      type,
      amount: orderData.amount,
      open_price: currentPrice,
      current_price: currentPrice,
      leverage: parseInt(orderData.leverage.split(':')[1]),
      stop_loss: orderData.stopLoss,
      take_profit: orderData.takeProfit
    };

    openTrade(trade);
    
    toast({
      title: "Order Placed",
      description: `${type.toUpperCase()} ${selectedSymbol} - ${orderData.amount} lots`
    });
  };

  const formatPrice = (price: number, symbol: string) => {
    const digits = symbol.includes("JPY") ? 3 : 5;
    return price.toFixed(digits);
  };

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
    };
    return mappings[symbol] || `FX:${symbol}`;
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-8rem)] overflow-hidden">
      {/* Header with Symbol Selection */}
      <div className="p-3 bg-background border-b">
        <div className="flex items-center justify-between gap-2">
          <Sheet open={isWatchlistOpen} onOpenChange={setIsWatchlistOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <List className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
              <SheetHeader className="p-4 border-b">
                <SheetTitle>Market Watch</SheetTitle>
              </SheetHeader>
              <div className="overflow-y-auto max-h-[calc(100vh-8rem)]">
                {watchlist.map((pair) => {
                  const priceData = marketData?.find(p => p.symbol === pair.symbol);
                  const price = priceData?.bid || Math.random() * 2;
                  const change = priceData?.changePercent || (Math.random() - 0.5) * 2;
                  const isPositive = change > 0;
                  
                  return (
                    <button
                      key={pair.symbol}
                      className={`w-full p-3 border-b transition-colors ${
                        selectedSymbol === pair.symbol ? 'bg-primary/10' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => {
                        setSelectedSymbol(pair.symbol);
                        setOrderData(prev => ({ ...prev, symbol: pair.symbol }));
                        setIsWatchlistOpen(false);
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div className="text-left">
                          <div className="font-medium text-sm">{pair.symbol}</div>
                          <div className="text-xs text-muted-foreground">{pair.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-sm">{formatPrice(price, pair.symbol)}</div>
                          <div className={`text-xs flex items-center gap-1 justify-end ${
                            isPositive ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {Math.abs(change).toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex-1">
            <div className="font-semibold text-lg">{selectedSymbol}</div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl">{formatPrice(currentPrice, selectedSymbol)}</span>
              <Badge variant={priceChange > 0 ? "default" : "destructive"} className="text-xs">
                {priceChange > 0 ? '+' : ''}{priceChange.toFixed(2)}%
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0">
        <TradingViewWidget
          symbol={getTradingViewSymbol(selectedSymbol)}
          height={300}
          theme="light"
          interval="15"
          hide_top_toolbar={true}
        />
      </div>

      {/* Trading Controls */}
      <div className="p-3 bg-background border-t">
        <Tabs defaultValue="trade" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-3">
            <TabsTrigger value="trade">Trade</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="trade" className="space-y-3 mt-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Amount (Lots)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={orderData.amount}
                  onChange={(e) => setOrderData({...orderData, amount: parseFloat(e.target.value)})}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Leverage</label>
                <Select value={orderData.leverage} onValueChange={(value) => 
                  setOrderData({...orderData, leverage: value})
                }>
                  <SelectTrigger className="h-8 text-sm">
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
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={() => handlePlaceOrder("buy")}
                className="h-12 bg-green-600 hover:bg-green-700 text-white font-semibold"
              >
                <ArrowUpCircle className="h-5 w-5 mr-2" />
                BUY
              </Button>
              <Button 
                onClick={() => handlePlaceOrder("sell")}
                className="h-12 bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                <ArrowDownCircle className="h-5 w-5 mr-2" />
                SELL
              </Button>
            </div>

            <div className="text-xs text-center text-muted-foreground">
              Margin: ${((orderData.amount * currentPrice * 100000) / parseInt(orderData.leverage.split(':')[1])).toFixed(2)}
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-3 mt-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Stop Loss</label>
                <Input
                  type="number"
                  step="0.00001"
                  placeholder="Optional"
                  value={orderData.stopLoss || ''}
                  onChange={(e) => setOrderData({...orderData, stopLoss: e.target.value ? parseFloat(e.target.value) : undefined})}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Take Profit</label>
                <Input
                  type="number"
                  step="0.00001"
                  placeholder="Optional"
                  value={orderData.takeProfit || ''}
                  onChange={(e) => setOrderData({...orderData, takeProfit: e.target.value ? parseFloat(e.target.value) : undefined})}
                  className="h-8 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Order Type</label>
              <Select value={orderData.orderType} onValueChange={(value: any) => 
                setOrderData({...orderData, orderType: value})
              }>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="market">Market</SelectItem>
                  <SelectItem value="limit">Limit</SelectItem>
                  <SelectItem value="stop">Stop</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};