import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    TradingView: any;
  }
}

interface TradingViewTickerProps {
  symbols?: Array<{
    proName: string;
    title: string;
  }>;
  colorTheme?: 'light' | 'dark';
  isTransparent?: boolean;
  showSymbolLogo?: boolean;
  locale?: string;
  largeChartUrl?: string;
  className?: string;
}

export const TradingViewTicker = ({
  symbols = [
    { proName: "FOREXCOM:EURUSD", title: "EUR/USD" },
    { proName: "FOREXCOM:GBPUSD", title: "GBP/USD" },
    { proName: "FOREXCOM:USDJPY", title: "USD/JPY" },
    { proName: "FOREXCOM:XAUUSD", title: "Gold" },
    { proName: "BITSTAMP:BTCUSD", title: "Bitcoin" },
    { proName: "BITSTAMP:ETHUSD", title: "Ethereum" },
    { proName: "TVC:DJI", title: "Dow Jones" },
    { proName: "OANDA:SPX500USD", title: "S&P 500" },
    { proName: "OANDA:NAS100USD", title: "NASDAQ" },
    { proName: "FOREXCOM:USOIL", title: "Oil" }
  ],
  colorTheme = 'dark',
  isTransparent = false,
  showSymbolLogo = true,
  locale = 'en',
  largeChartUrl = '',
  className = ''
}: TradingViewTickerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    // Clean up previous widget
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    // Create widget container
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container__widget';
    
    if (containerRef.current) {
      containerRef.current.appendChild(widgetContainer);
    }

    // Create and append script
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: symbols.map(symbol => ({
        proName: symbol.proName,
        title: symbol.title
      })),
      showSymbolLogo: showSymbolLogo,
      isTransparent: isTransparent,
      displayMode: "adaptive",
      colorTheme: colorTheme,
      locale: locale,
      largeChartUrl: largeChartUrl
    });

    widgetContainer.appendChild(script);
    scriptRef.current = script;

    return () => {
      // Cleanup
      if (scriptRef.current && scriptRef.current.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current);
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbols, colorTheme, isTransparent, showSymbolLogo, locale, largeChartUrl]);

  return (
    <div 
      className={cn("tradingview-widget-container overflow-hidden", className)}
      ref={containerRef}
      style={{ height: '46px' }}
    />
  );
};