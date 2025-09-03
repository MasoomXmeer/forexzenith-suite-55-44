import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  TrendingDown, 
  Play, 
  Pause, 
  BarChart3, 
  DollarSign,
  Clock,
  Shield,
  Zap,
  Target
} from 'lucide-react';
import TradingViewWidget from '@/components/TradingView/TradingViewWidget';
import { useRealTimeMarketData } from '@/hooks/useMarketData';
import { useRealTrading } from '@/contexts/RealTradingContext';

interface OrderData {
  symbol: string;
  type: 'buy' | 'sell';
  orderType: 'market' | 'limit' | 'stop';
  volume: number;
  price?: number;
  stopLoss?: number;
  takeProfit?: number;
  leverage: number;
}

export const XMTradingInterface = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('EURUSD');
  const [orderData, setOrderData] = useState<OrderData>({
    symbol: 'EURUSD',
    type: 'buy',
    orderType: 'market',
    volume: 0.01,
    leverage: 500
  });

  const watchlistSymbols = [
    'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 
    'XAUUSD', 'XAGUSD', 'USOIL', 'US30', 'US500'
  ];

  const { data: marketData, isLoading: loading } = useRealTimeMarketData(watchlistSymbols);
  const { openTrade } = useRealTrading();

  const connectionStatus = marketData && marketData.length > 0 ? 'connected' : 'disconnected';

  const currentPrice = marketData?.find(m => m.symbol === selectedSymbol)?.price || 1.0850;
  const currentChange = marketData?.find(m => m.symbol === selectedSymbol)?.changePercent || 0;

  const formatPrice = (price: number, symbol: string) => {
    const digits = symbol.includes('JPY') ? 3 : 5;
    return price.toFixed(digits);
  };

  const handlePlaceOrder = () => {
    const trade = {
      symbol: orderData.symbol,
      type: orderData.type,
      amount: orderData.volume,
      open_price: currentPrice,
      current_price: currentPrice,
      leverage: orderData.leverage,
      stop_loss: orderData.stopLoss,
      take_profit: orderData.takeProfit
    };

    openTrade(trade);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* XM-style Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="font-bold text-xl text-[#E31E24]">XM Trading</div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-muted-foreground">
                  {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-green-600 border-green-600">
                Live Account
              </Badge>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Balance</div>
                <div className="font-bold text-lg">$10,000.00</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-120px)]">
          {/* Watchlist Sidebar */}
          <div className="col-span-3">
            <Card className="h-full">
              <div className="p-4 border-b bg-gradient-to-r from-[#E31E24] to-[#B71C1C] text-white">
                <h3 className="font-semibold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Market Watch
                </h3>
              </div>
              <div className="p-2 max-h-[600px] overflow-y-auto">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-sm text-muted-foreground mt-2">Loading markets...</p>
                  </div>
                ) : (
                   <div className="space-y-1">
                     {watchlistSymbols.map((symbol) => {
                       const data = marketData?.find(m => m.symbol === symbol);
                       const price = data?.price || Math.random() * 2;
                       const change = data?.changePercent || (Math.random() - 0.5) * 2;
                      const isPositive = change > 0;
                      
                      return (
                        <div
                          key={symbol}
                          className={`p-3 rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                            selectedSymbol === symbol ? 'bg-[#E31E24]/10 border-l-4 border-[#E31E24]' : ''
                          }`}
                          onClick={() => setSelectedSymbol(symbol)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-sm">{symbol}</div>
                              <div className="text-xs text-muted-foreground">
                                {symbol.includes('USD') ? 'Major' : symbol.startsWith('XAU') ? 'Metal' : 'Index'}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-mono text-sm font-medium">
                                {formatPrice(price, symbol)}
                              </div>
                              <div className={`text-xs flex items-center gap-1 ${
                                isPositive ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {isPositive ? (
                                  <TrendingUp className="h-3 w-3" />
                                ) : (
                                  <TrendingDown className="h-3 w-3" />
                                )}
                                {Math.abs(change).toFixed(2)}%
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Main Chart Area */}
          <div className="col-span-6">
            <Card className="h-full">
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{selectedSymbol}</h2>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="font-mono text-2xl font-bold">
                        {formatPrice(currentPrice, selectedSymbol)}
                      </span>
                      <Badge variant={currentChange > 0 ? "default" : "destructive"} className="text-xs">
                        {currentChange > 0 ? '+' : ''}{currentChange.toFixed(2)}%
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div>Spread: 1.0 pips</div>
                    <div>Last Update: {new Date().toLocaleTimeString()}</div>
                  </div>
                </div>
              </div>

              {/* TradingView Chart */}
              <div className="flex-1">
                <TradingViewWidget
                  symbol={`FX:${selectedSymbol}`}
                  height={450}
                  theme="light"
                  interval="15"
                  hide_top_toolbar={false}
                  className="border-0"
                />
              </div>
            </Card>
          </div>

          {/* Order Panel */}
          <div className="col-span-3">
            <Card className="h-full">
              <div className="p-4 border-b bg-gradient-to-r from-[#1A1A1A] to-[#000000] text-white">
                <h3 className="font-semibold flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Order Entry
                </h3>
              </div>

              <div className="p-4 flex-1">
                <Tabs defaultValue="market" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="market" className="text-xs">Market</TabsTrigger>
                    <TabsTrigger value="limit" className="text-xs">Limit</TabsTrigger>
                    <TabsTrigger value="stop" className="text-xs">Stop</TabsTrigger>
                  </TabsList>

                  <TabsContent value="market" className="space-y-4">
                    <OrderForm 
                      orderData={{...orderData, orderType: 'market'}}
                      setOrderData={setOrderData}
                      currentPrice={currentPrice}
                      onPlaceOrder={handlePlaceOrder}
                      selectedSymbol={selectedSymbol}
                    />
                  </TabsContent>

                  <TabsContent value="limit" className="space-y-4">
                    <OrderForm 
                      orderData={{...orderData, orderType: 'limit'}}
                      setOrderData={setOrderData}
                      currentPrice={currentPrice}
                      onPlaceOrder={handlePlaceOrder}
                      selectedSymbol={selectedSymbol}
                    />
                  </TabsContent>

                  <TabsContent value="stop" className="space-y-4">
                    <OrderForm 
                      orderData={{...orderData, orderType: 'stop'}}
                      setOrderData={setOrderData}
                      currentPrice={currentPrice}
                      onPlaceOrder={handlePlaceOrder}
                      selectedSymbol={selectedSymbol}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Order Form Component
interface OrderFormProps {
  orderData: OrderData;
  setOrderData: (data: OrderData) => void;
  currentPrice: number;
  onPlaceOrder: () => void;
  selectedSymbol: string;
}

const OrderForm: React.FC<OrderFormProps> = ({ 
  orderData, 
  setOrderData, 
  currentPrice, 
  onPlaceOrder, 
  selectedSymbol 
}) => {
  return (
    <div className="space-y-4">
      {/* Volume */}
      <div>
        <label className="text-sm font-medium mb-2 block">Volume (Lots)</label>
        <Input
          type="number"
          step="0.01"
          min="0.01"
          value={orderData.volume}
          onChange={(e) => setOrderData({...orderData, volume: parseFloat(e.target.value)})}
          className="w-full"
        />
      </div>

      {/* Price (for limit/stop orders) */}
      {orderData.orderType !== 'market' && (
        <div>
          <label className="text-sm font-medium mb-2 block">Price</label>
          <Input
            type="number"
            step="0.00001"
            value={orderData.price || currentPrice}
            onChange={(e) => setOrderData({...orderData, price: parseFloat(e.target.value)})}
          />
        </div>
      )}

      {/* Leverage */}
      <div>
        <label className="text-sm font-medium mb-2 block">Leverage</label>
        <Select 
          value={orderData.leverage.toString()} 
          onValueChange={(value) => setOrderData({...orderData, leverage: parseInt(value)})}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="50">1:50</SelectItem>
            <SelectItem value="100">1:100</SelectItem>
            <SelectItem value="200">1:200</SelectItem>
            <SelectItem value="500">1:500</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stop Loss */}
      <div>
        <label className="text-sm font-medium mb-2 block">Stop Loss (Optional)</label>
        <Input
          type="number"
          step="0.00001"
          placeholder="0.00000"
          value={orderData.stopLoss || ''}
          onChange={(e) => setOrderData({...orderData, stopLoss: e.target.value ? parseFloat(e.target.value) : undefined})}
        />
      </div>

      {/* Take Profit */}
      <div>
        <label className="text-sm font-medium mb-2 block">Take Profit (Optional)</label>
        <Input
          type="number"
          step="0.00001"
          placeholder="0.00000"
          value={orderData.takeProfit || ''}
          onChange={(e) => setOrderData({...orderData, takeProfit: e.target.value ? parseFloat(e.target.value) : undefined})}
        />
      </div>

      <Separator />

      {/* Margin Calculation */}
      <div className="bg-muted/30 p-3 rounded-lg">
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>Margin Required:</span>
            <span className="font-medium">
              ${((orderData.volume * currentPrice * 100000) / orderData.leverage).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Contract Size:</span>
            <span className="font-medium">{(orderData.volume * 100000).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Order Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button 
          onClick={() => {
            setOrderData({...orderData, type: 'buy'});
            onPlaceOrder();
          }}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold"
        >
          <TrendingUp className="h-4 w-4 mr-1" />
          BUY
        </Button>
        
        <Button 
          onClick={() => {
            setOrderData({...orderData, type: 'sell'});
            onPlaceOrder();
          }}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold"
        >
          <TrendingDown className="h-4 w-4 mr-1" />
          SELL
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-1 text-xs">
        <Button variant="outline" size="sm" onClick={() => setOrderData({...orderData, volume: 0.01})}>
          0.01
        </Button>
        <Button variant="outline" size="sm" onClick={() => setOrderData({...orderData, volume: 0.1})}>
          0.1
        </Button>
        <Button variant="outline" size="sm" onClick={() => setOrderData({...orderData, volume: 1.0})}>
          1.0
        </Button>
      </div>
    </div>
  );
};

export default XMTradingInterface;