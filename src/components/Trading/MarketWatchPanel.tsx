import { useState } from 'react';
import { Plus, MoreHorizontal, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRealTimeMarketData } from '@/hooks/useMarketData';
import { cn } from '@/lib/utils';

import { platformConfig } from '@/config/platform';

// Get supported symbols from platform config
const SUPPORTED_SYMBOLS = platformConfig.trading.supportedPairs.map(pair => pair.symbol);
const FOREX_SYMBOLS = SUPPORTED_SYMBOLS.filter(s => ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF', 'NZDUSD', 'EURGBP', 'EURJPY', 'GBPJPY'].includes(s));
const METALS_SYMBOLS = SUPPORTED_SYMBOLS.filter(s => s.startsWith('XAU') || s.startsWith('XAG'));
const INDICES_SYMBOLS = SUPPORTED_SYMBOLS.filter(s => ['US30', 'US500', 'NAS100', 'GER30', 'UK100', 'JPN225'].includes(s));
const ENERGY_SYMBOLS = SUPPORTED_SYMBOLS.filter(s => s.includes('USOIL') || s.includes('UKOIL'));

export const MarketWatchPanel = () => {
  const [activeTab, setActiveTab] = useState('watchlist');
  
  const { data: forexData, isLoading: forexLoading } = useRealTimeMarketData(FOREX_SYMBOLS);
  const { data: metalsData, isLoading: metalsLoading } = useRealTimeMarketData(METALS_SYMBOLS);
  const { data: indicesData, isLoading: indicesLoading } = useRealTimeMarketData(INDICES_SYMBOLS);
  const { data: energyData, isLoading: energyLoading } = useRealTimeMarketData(ENERGY_SYMBOLS);

  const renderPriceRow = (price: any, isLoading: boolean) => {
    if (isLoading) {
      return (
        <div className="animate-pulse">
          <div className="h-12 bg-muted rounded-lg"></div>
        </div>
      );
    }

    const isPositive = price?.change >= 0;
    const isCrypto = price?.symbol?.includes('BTC') || price?.symbol?.includes('ETH') || price?.symbol?.includes('USD');

    return (
      <div 
        key={price?.symbol}
        className="flex items-center justify-between py-3 px-4 border-b border-border/50 last:border-b-0 hover:bg-muted/50 transition-colors"
      >
        <div className="flex-1">
          <div className="font-semibold text-sm">{price?.symbol}</div>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          {/* Sell Price */}
          <div className="text-center min-w-[80px]">
            <div className={cn(
              "font-mono",
              isPositive ? "text-success" : "text-danger"
            )}>
              {isCrypto ? 
                price?.price?.toLocaleString('en-US', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                }) :
                price?.bid?.toFixed(price?.symbol?.includes('JPY') ? 3 : 5)
              }
            </div>
          </div>
          
          {/* Buy Price */}
          <div className="text-center min-w-[80px]">
            <div className={cn(
              "font-mono",
              isPositive ? "text-success" : "text-danger"
            )}>
              {isCrypto ? 
                price?.price?.toLocaleString('en-US', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                }) :
                price?.ask?.toFixed(price?.symbol?.includes('JPY') ? 3 : 5)
              }
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold">Market Watch</h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
            <TabsTrigger value="forex">Forex</TabsTrigger>
            <TabsTrigger value="metals">Metals</TabsTrigger>
            <TabsTrigger value="indices">Indices</TabsTrigger>
          </TabsList>

          <TabsContent value="watchlist" className="space-y-1">
            <div className="p-4">
              <div className="flex items-center justify-between py-2 px-0 text-sm text-muted-foreground border-b border-border mb-4">
                <div className="flex-1">Instrument</div>
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-[80px]">Sell</div>
                  <div className="text-center min-w-[80px]">Buy</div>
                </div>
              </div>
              <div className="space-y-1">
                {[...forexData || [], ...metalsData || [], ...indicesData || [], ...energyData || []].slice(0, 10).map((price, index) => renderPriceRow(price, false))}
                {(forexLoading || metalsLoading || indicesLoading || energyLoading) && Array(5).fill(0).map((_, i) => (
                  <div key={`watchlist-loading-${i}`}>{renderPriceRow(null, true)}</div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="forex" className="space-y-1">
            <div className="p-4">
              <div className="flex items-center justify-between py-2 px-0 text-sm text-muted-foreground border-b border-border mb-4">
                <div className="flex-1">Instrument</div>
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-[80px]">Sell</div>
                  <div className="text-center min-w-[80px]">Buy</div>
                </div>
              </div>
              <div className="space-y-1">
                {forexData?.map((price, index) => renderPriceRow(price, forexLoading)) || 
                 (forexLoading && Array(6).fill(0).map((_, i) => (
                   <div key={`forex-loading-${i}`}>{renderPriceRow(null, true)}</div>
                 )))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="metals" className="space-y-1">
            <div className="p-4">
              <div className="flex items-center justify-between py-2 px-0 text-sm text-muted-foreground border-b border-border mb-4">
                <div className="flex-1">Instrument</div>
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-[80px]">Sell</div>
                  <div className="text-center min-w-[80px]">Buy</div>
                </div>
              </div>
              <div className="space-y-1">
                {[...metalsData || [], ...energyData || []].map((price, index) => renderPriceRow(price, metalsLoading || energyLoading))}
                {(metalsLoading || energyLoading) && Array(3).fill(0).map((_, i) => (
                  <div key={`metals-loading-${i}`}>{renderPriceRow(null, true)}</div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="indices" className="space-y-1">
            <div className="p-4">
              <div className="flex items-center justify-between py-2 px-0 text-sm text-muted-foreground border-b border-border mb-4">
                <div className="flex-1">Instrument</div>
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-[80px]">Sell</div>
                  <div className="text-center min-w-[80px]">Buy</div>
                </div>
              </div>
              <div className="space-y-1">
                {indicesData?.map((price, index) => renderPriceRow(price, indicesLoading)) || 
                 (indicesLoading && Array(3).fill(0).map((_, i) => (
                   <div key={`indices-loading-${i}`}>{renderPriceRow(null, true)}</div>
                 )))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
    </div>
  );
};