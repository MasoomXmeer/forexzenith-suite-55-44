import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Activity, 
  DollarSign,
  AlertTriangle,
  Info,
  X
} from "lucide-react";
import { platformConfig } from "@/config/platform";
import { useRealTimeMarketData } from "@/hooks/useMarketData";
import { useTradingLogic } from "@/hooks/useTradingLogic";
import { TradingViewWidget } from "@/components/TradingView/TradingViewWidget";
import { PositionsPanel } from "@/components/Trading/PositionsPanel";

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

export const TradingTerminal = () => {
  const [selectedSymbol, setSelectedSymbol] = useState("EURUSD");
  const [chartKey, setChartKey] = useState(0);
  const [orderData, setOrderData] = useState<OrderData>({
    symbol: "EURUSD",
    type: "buy",
    orderType: "market",
    amount: 0.01,
    leverage: "1:500"
  });
  const [watchlist, setWatchlist] = useState(platformConfig.trading.supportedPairs.slice(0, 8));
  const watchlistSymbols = watchlist.map(p => p.symbol);
  const { data: marketData } = useRealTimeMarketData(watchlistSymbols);
  
  // Use the new trading logic hook
  const { 
    openPositions, 
    accountMetrics, 
    isLoading,
    openTrade, 
    closePosition,
    calculateRequiredMargin,
    getRiskMetrics
  } = useTradingLogic();

  // Convert market symbols to TradingView format
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
      'NAS100': 'TVC:NDX',
      'GER30': 'TVC:DEU40',
      'UK100': 'TVC:UKX',
      'JPN225': 'TVC:NI225'
    };
    return mappings[symbol] || `FX:${symbol}`;
  };

  // Generate price history for charts
  const generatePriceHistory = (basePrice: number) => {
    const history = [];
    let price = basePrice;
    const now = Date.now();
    
    for (let i = 100; i >= 0; i--) {
      const change = (Math.random() - 0.5) * 0.02;
      price = price * (1 + change);
      history.push({
        time: now - (i * 60000), // 1 minute intervals
        price: price,
        volume: Math.random() * 1000000
      });
    }
    return history;
  };

  const currentPriceData = marketData?.find(p => p.symbol === selectedSymbol);
  const currentPrice = currentPriceData?.bid || 1.0850;
  const priceHistory = generatePriceHistory(currentPrice);
  const priceChange = ((currentPrice - priceHistory[0].price) / priceHistory[0].price) * 100;
  
  // Handle place order with new trading logic
  const handlePlaceOrder = async () => {
    await openTrade({
      symbol: orderData.symbol,
      type: orderData.type,
      amount: orderData.amount,
      leverage: parseInt(orderData.leverage.split(':')[1]),
      stopLoss: orderData.stopLoss,
      takeProfit: orderData.takeProfit,
      price: orderData.orderType === 'market' ? undefined : orderData.price
    });
  };

  const formatPrice = (price: number, symbol: string) => {
    const digits = symbol.includes("JPY") ? 3 : 5;
    return price.toFixed(digits);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Watchlist & Market Overview */}
      <Card className="p-4">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Market Watch
        </h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {watchlist.map((pair) => {
            const priceData = marketData?.find(p => p.symbol === pair.symbol);
            const price = priceData?.bid || Math.random() * 2;
            const change = priceData?.change || (Math.random() - 0.5) * 2;
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
                  setChartKey(prev => prev + 1);
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
                      isPositive ? 'text-green-600' : 'text-red-600'
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
      </Card>

      {/* Chart & Trading */}
      <Card className="p-4 lg:col-span-2">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-semibold text-foreground text-lg">{selectedSymbol}</h3>
            <div className="flex items-center gap-2">
              <span className="font-mono text-2xl">{formatPrice(currentPrice, selectedSymbol)}</span>
              <Badge variant={priceChange > 0 ? "default" : "destructive"} className="text-xs">
                {priceChange > 0 ? '+' : ''}{priceChange.toFixed(2)}%
              </Badge>
            </div>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <div>Spread: {platformConfig.trading.supportedPairs.find(p => p.symbol === selectedSymbol)?.baseSpread || 1.0}</div>
            <div>Last Update: {new Date().toLocaleTimeString()}</div>
          </div>
        </div>

        {/* TradingView Chart */}
        <div className="mb-6">
          <TradingViewWidget
            key={chartKey}
            symbol={getTradingViewSymbol(selectedSymbol)}
            height={400}
            theme="light"
            interval="15"
            className="border-0"
            hide_top_toolbar={true}
          />
        </div>

        {/* Order Panel */}
        <Tabs defaultValue="buy" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy" className="text-green-600">Buy</TabsTrigger>
            <TabsTrigger value="sell" className="text-red-600">Sell</TabsTrigger>
          </TabsList>
          
          <TabsContent value="buy" className="space-y-4">
            <OrderForm
              orderData={{...orderData, type: "buy", symbol: selectedSymbol}}
              setOrderData={setOrderData}
              currentPrice={currentPrice}
              onPlaceOrder={handlePlaceOrder}
              type="buy"
            />
          </TabsContent>
          
          <TabsContent value="sell" className="space-y-4">
            <OrderForm
              orderData={{...orderData, type: "sell", symbol: selectedSymbol}}
              setOrderData={setOrderData}
              currentPrice={currentPrice}
              onPlaceOrder={handlePlaceOrder}
              type="sell"
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

interface OrderFormProps {
  orderData: OrderData;
  setOrderData: (data: OrderData) => void;
  currentPrice: number;
  onPlaceOrder: () => void;
  type: "buy" | "sell";
}

const OrderForm = ({ orderData, setOrderData, currentPrice, onPlaceOrder, type }: OrderFormProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
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
            onChange={(e) => setOrderData({...orderData, amount: parseFloat(e.target.value)})}
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
      </div>

      <div className="space-y-3">
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

      <div className="col-span-2">
        <Button 
          onClick={onPlaceOrder}
          className={`w-full h-12 text-white font-semibold ${
            type === "buy" 
              ? "bg-green-600 hover:bg-green-700" 
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {type === "buy" ? (
            <ArrowUpCircle className="h-5 w-5 mr-2" />
          ) : (
            <ArrowDownCircle className="h-5 w-5 mr-2" />
          )}
          {type === "buy" ? "Buy" : "Sell"} {orderData.symbol}
        </Button>

        <div className="mt-2 text-xs text-muted-foreground text-center">
          Margin Required: ${((orderData.amount * currentPrice * 100000) / parseInt(orderData.leverage.split(':')[1])).toFixed(2)}
        </div>
      </div>
    </div>
  );
};