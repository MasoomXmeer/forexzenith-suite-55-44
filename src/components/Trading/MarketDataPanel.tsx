import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  TrendingUp, TrendingDown, Wifi, WifiOff, 
  RefreshCw, Activity, AlertTriangle, CheckCircle 
} from "lucide-react";
import { useRealTimeMarketData } from "@/hooks/useMarketData";
import { marketDataService } from "@/services/marketData";
import { platformConfig } from "@/config/platform";
import { formatCurrency } from "@/utils/trading";

interface ApiStatus {
  provider: string;
  status: string;
  connected: boolean;
  lastUpdate: number;
}

export const MarketDataPanel = () => {
  const symbols = platformConfig.trading.supportedPairs.map(p => p.symbol);
  const { data: marketPrices, isLoading, refetch } = useRealTimeMarketData(symbols);
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const testApiConnections = async () => {
    setIsTestingConnection(true);
    try {
      const connected = await marketDataService.testConnection();
      setApiStatus({ 
        connected, 
        provider: 'onetickmarkets', 
        status: connected ? 'active' : 'error', 
        lastUpdate: Date.now() 
      });
    } catch (error) {
      console.error('Failed to test API connections:', error);
      setApiStatus({ 
        connected: false, 
        provider: 'onetickmarkets', 
        status: 'error', 
        lastUpdate: Date.now() 
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  useEffect(() => {
    testApiConnections();
  }, []);

  const formatPrice = (price: number, symbol: string) => {
    if (symbol.includes('JPY')) return price.toFixed(3);
    if (symbol.startsWith('XAU')) return price.toFixed(2);
    if (symbol.startsWith('XAG')) return price.toFixed(3);
    if (symbol.includes('OIL')) return price.toFixed(3);
    if (['US30', 'US500', 'NAS100', 'GER30', 'UK100', 'JPN225'].includes(symbol)) return price.toFixed(1);
    return price.toFixed(5);
  };

  const getPriceColor = (changePercent: number) => {
    if (changePercent > 0) return "text-green-600";
    if (changePercent < 0) return "text-red-600";
    return "text-muted-foreground";
  };

  const getSourceBadgeColor = (source: string) => {
    if (source?.includes('exchange')) return "bg-green-100 text-green-800";
    if (source?.includes('alpha')) return "bg-blue-100 text-blue-800";
    if (source?.includes('fixer')) return "bg-purple-100 text-purple-800";
    if (source?.includes('simulation')) return "bg-orange-100 text-orange-800";
    return "bg-gray-100 text-gray-800";
  };

  const groupedPrices = marketPrices?.reduce((acc, price) => {
    const category = price.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(price);
    return acc;
  }, {} as Record<string, typeof marketPrices>) || {};

  const ApiStatusIndicator = ({ name, status }: { name: string; status: boolean }) => (
    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
      <span className="text-sm font-medium">{name}</span>
      <div className="flex items-center gap-2">
        {status ? (
          <CheckCircle className="h-4 w-4 text-green-600" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-red-600" />
        )}
        <Badge variant={status ? "default" : "destructive"} className="text-xs">
          {status ? "Connected" : "Failed"}
        </Badge>
      </div>
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Real Market Data
            </CardTitle>
            <CardDescription>
              Live market prices from multiple data sources
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={testApiConnections}
              disabled={isTestingConnection}
            >
              {isTestingConnection ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Wifi className="h-4 w-4" />
              )}
              Test APIs
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="prices" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="prices">Market Prices</TabsTrigger>
            <TabsTrigger value="status">API Status</TabsTrigger>
          </TabsList>
          
          <TabsContent value="prices" className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                <span>Loading market data...</span>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                {Object.entries(groupedPrices).map(([category, prices]) => (
                  <div key={category} className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 sticky top-0 bg-background py-2">
                      {category}
                    </h3>
                    <div className="grid gap-3">
                      {prices?.map((price) => (
                        <div
                          key={price.symbol}
                          className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div>
                              <div className="font-medium">{price.symbol}</div>
                              <div className="text-sm text-muted-foreground">{price.name}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-lg font-bold">
                                {formatPrice(price.price, price.symbol)}
                              </div>
                              <div className={`text-sm flex items-center gap-1 ${getPriceColor(price.changePercent)}`}>
                                {price.changePercent > 0 ? (
                                  <TrendingUp className="h-3 w-3" />
                                ) : price.changePercent < 0 ? (
                                  <TrendingDown className="h-3 w-3" />
                                ) : null}
                                {price.changePercent > 0 ? '+' : ''}
                                {price.changePercent.toFixed(2)}%
                              </div>
                            </div>
                            
                            <div className="text-right text-sm text-muted-foreground">
                              <div>Bid: {formatPrice(price.bid, price.symbol)}</div>
                              <div>Ask: {formatPrice(price.ask, price.symbol)}</div>
                            </div>
                            
                            <div className="flex flex-col gap-1">
                              <Badge className={getSourceBadgeColor(price.source || '')}>
                                {price.source?.replace('simulation-enhanced', 'sim').replace('-api', '') || 'API'}
                              </Badge>
                              <div className="text-xs text-muted-foreground">
                                {new Date(price.timestamp).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            )}
          </TabsContent>
          
          <TabsContent value="status" className="space-y-4">
            <div className="grid gap-3">
              <div className="text-sm text-muted-foreground mb-2">
                API Connection Status - Last tested: {apiStatus ? new Date(apiStatus.lastUpdate).toLocaleTimeString() : 'Not tested'}
              </div>
              
              {apiStatus && (
                <>
                  <ApiStatusIndicator name="OneTick Markets API" status={apiStatus.connected} />
                </>
              )}
              
              <div className="mt-4 p-3 rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">Data Source</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>• Primary: OneTick Markets API</div>
                  <div>• Provides real-time market data for all instruments</div>
                  <div>• Direct connection to professional data feeds</div>
                </div>
              </div>
              
              <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Current Status</h4>
                <div className="text-sm text-blue-800">
                  {apiStatus?.connected ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Connected to {apiStatus.provider} - Status: {apiStatus.status}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <WifiOff className="h-4 w-4" />
                      Connection failed - Check network connectivity
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};