import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, TrendingDown, BarChart3, Settings } from 'lucide-react';

interface TradingViewWidgetProps {
  symbol?: string;
  theme?: 'light' | 'dark';
  width?: string | number;
  height?: string | number;
  interval?: string;
  timezone?: string;
  style?: '1' | '2' | '3' | '8' | '9';
  locale?: string;
  toolbar_bg?: string;
  enable_publishing?: boolean;
  hide_top_toolbar?: boolean;
  hide_legend?: boolean;
  save_image?: boolean;
  className?: string;
}

declare global {
  interface Window {
    TradingView: any;
  }
}

export const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({
  symbol = 'FX:EURUSD',
  theme = 'light',
  width = '100%',
  height = 500,
  interval = '1',
  timezone = 'Etc/UTC',
  style = '1',
  locale = 'en',
  toolbar_bg = '#f1f3f6',
  enable_publishing = false,
  hide_top_toolbar = false,
  hide_legend = false,
  save_image = false,
  className = ''
}) => {
  const container = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState(symbol);
  const [selectedInterval, setSelectedInterval] = useState(interval);

  // Popular trading symbols
  const popularSymbols = [
    { label: 'EUR/USD', value: 'FX:EURUSD' },
    { label: 'GBP/USD', value: 'FX:GBPUSD' },
    { label: 'USD/JPY', value: 'FX:USDJPY' },
    { label: 'AUD/USD', value: 'FX:AUDUSD' },
    { label: 'USD/CAD', value: 'FX:USDCAD' },
    { label: 'XAU/USD (Gold)', value: 'TVC:GOLD' },
    { label: 'XAG/USD (Silver)', value: 'TVC:SILVER' },
    { label: 'US30 (Dow)', value: 'TVC:DJI' },
    { label: 'US500 (S&P)', value: 'TVC:SPX500' },
    { label: 'NAS100', value: 'TVC:NDX' }
  ];

  const timeframes = [
    { label: '1m', value: '1' },
    { label: '5m', value: '5' },
    { label: '15m', value: '15' },
    { label: '1h', value: '60' },
    { label: '4h', value: '240' },
    { label: '1D', value: '1D' },
    { label: '1W', value: '1W' }
  ];

  useEffect(() => {
    let script: HTMLScriptElement;

    const initWidget = () => {
      if (container.current && window.TradingView) {
        try {
          // Clear previous widget
          container.current.innerHTML = '';
          
          new window.TradingView.widget({
            container_id: container.current.id,
            width,
            height,
            symbol: selectedSymbol,
            interval: selectedInterval,
            timezone,
            theme: theme === 'dark' ? 'dark' : 'light',
            style,
            locale,
            toolbar_bg,
            enable_publishing,
            hide_top_toolbar,
            hide_legend,
            save_image,
            studies: [
              'MASimple@tv-basicstudies',
              'RSI@tv-basicstudies',
              'MACD@tv-basicstudies'
            ],
            show_popup_button: true,
            popup_width: '1000',
            popup_height: '650'
          });
          
          setIsLoading(false);
          setError(null);
        } catch (err) {
          console.error('TradingView widget error:', err);
          setError('Failed to load chart widget');
          setIsLoading(false);
        }
      }
    };

    // Load TradingView script if not already loaded
    if (!window.TradingView) {
      script = document.createElement('script');
      script.id = 'tradingview-widget-loading-script';
      script.src = 'https://s3.tradingview.com/tv.js';
      script.type = 'text/javascript';
      script.onload = initWidget;
      script.onerror = () => {
        setError('Failed to load TradingView script');
        setIsLoading(false);
      };
      document.head.appendChild(script);
    } else {
      initWidget();
    }

    return () => {
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [selectedSymbol, selectedInterval, theme, width, height, timezone, style, locale, toolbar_bg, enable_publishing, hide_top_toolbar, hide_legend, save_image]);

  if (error) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center h-64 text-center">
          <div>
            <TrendingDown className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Chart Error</h3>
            <p className="text-muted-foreground">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      {/* Chart Controls */}
      <div className="p-4 border-b bg-background/50 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span className="font-semibold">Advanced Chart</span>
          </div>
          <Badge variant="outline" className="text-xs">
            TradingView
          </Badge>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Symbol Selector */}
          <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {popularSymbols.map((sym) => (
                <SelectItem key={sym.value} value={sym.value}>
                  {sym.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Timeframe Selector */}
          <Select value={selectedInterval} onValueChange={setSelectedInterval}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeframes.map((tf) => (
                <SelectItem key={tf.value} value={tf.value}>
                  {tf.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading advanced chart...</span>
            </div>
          </div>
        )}
        
        <div
          id={`tradingview_${Math.random().toString(36).substring(7)}`}
          ref={container}
          style={{ height: typeof height === 'number' ? `${height}px` : height }}
        />
      </div>
    </Card>
  );
};

export default TradingViewWidget;