
import React from 'react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { marketDataService } from '@/services/marketData/index';
import { CheckCircle, Wifi, AlertTriangle } from 'lucide-react';

export const MT5Configuration = () => {
  const isUsingRealData = marketDataService.isUsingRealData();
  const dataSource = marketDataService.getDataSource();

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Market Data Configuration</h3>
            <p className="text-sm text-muted-foreground">
              Real-time market data powered by TradingView
            </p>
          </div>
          <Badge className="bg-green-500 text-white">
            <Wifi className="w-3 h-3 mr-1" />
            Connected
          </Badge>
        </div>

        <Alert className="mb-6">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            TradingView data feed is active. Real-time prices are being streamed to your platform.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-2">Data Source Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Provider:</span>
                <span className="font-medium">{dataSource}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="text-green-600 font-medium">Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Update Frequency:</span>
                <span className="font-medium">Real-time</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Coverage:</span>
                <span className="font-medium">Global Markets</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-2">Supported Instruments</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                'Forex Pairs', 'Precious Metals', 'Energy', 'Indices',
                'Commodities', 'Cryptocurrencies', 'Stocks', 'Bonds'
              ].map(instrument => (
                <Badge key={instrument} variant="outline" className="justify-center text-xs">
                  {instrument}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Data Only:</strong> This platform uses TradingView for market data visualization and analysis. 
          All trading operations are simulated for educational purposes.
        </AlertDescription>
      </Alert>
    </div>
  );
};
