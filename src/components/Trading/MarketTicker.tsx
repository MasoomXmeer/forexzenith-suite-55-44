import { useRealTimeMarketData } from '@/hooks/useMarketData';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarketTickerProps {
  symbols?: string[];
  className?: string;
}

export const MarketTicker = ({ 
  symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD', 'US500'],
  className = ''
}: MarketTickerProps) => {
  const { data: marketData, isLoading } = useRealTimeMarketData(symbols);

  if (isLoading || !marketData?.length) {
    return (
      <div className={cn("flex items-center gap-6 overflow-hidden", className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 animate-pulse">
            <div className="h-3 w-12 bg-muted rounded"></div>
            <div className="h-3 w-8 bg-muted rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div className="flex items-center gap-6 animate-marquee whitespace-nowrap">
        {[...marketData, ...marketData].map((price, index) => {
          const isPositive = price.changePercent >= 0;
          return (
            <div key={`${price.symbol}-${index}`} className="flex items-center gap-2 text-sm">
              <span className="font-medium text-foreground">{price.symbol}</span>
              <span className="text-foreground">
                {price.price.toFixed(price.symbol.includes('JPY') ? 3 : 5)}
              </span>
              <div className="flex items-center gap-1">
                {isPositive ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                )}
                <span className={cn(
                  "text-xs font-medium",
                  isPositive ? "text-green-600" : "text-red-600"
                )}>
                  {isPositive ? '+' : ''}{price.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};