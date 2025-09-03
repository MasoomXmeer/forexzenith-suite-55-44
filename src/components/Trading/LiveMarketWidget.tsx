import { useRealTimeMarketData } from '@/hooks/useMarketData';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface LiveMarketWidgetProps {
  symbols?: string[];
  compact?: boolean;
  showViewAll?: boolean;
  className?: string;
}

export const LiveMarketWidget = ({ 
  symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD'], 
  compact = false,
  showViewAll = true,
  className = ''
}: LiveMarketWidgetProps) => {
  const { data: marketData, isLoading } = useRealTimeMarketData(symbols);

  if (isLoading) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Live Markets</h3>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
        <div className="space-y-2">
          {Array.from({ length: compact ? 2 : 4 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center animate-pulse">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-muted rounded"></div>
                <div>
                  <div className="h-3 w-12 bg-muted rounded mb-1"></div>
                  <div className="h-2 w-8 bg-muted rounded"></div>
                </div>
              </div>
              <div className="text-right">
                <div className="h-3 w-12 bg-muted rounded mb-1"></div>
                <div className="h-2 w-8 bg-muted rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  const displayData = compact ? marketData?.slice(0, 2) : marketData;

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm">Live Markets</h3>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      </div>
      
      <div className="space-y-2 mb-3">
        {displayData?.map((price) => {
          const isPositive = price.changePercent >= 0;
          return (
            <div key={price.symbol} className="flex justify-between items-center group hover:bg-muted/50 p-2 rounded-md transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-primary/10 to-primary/20 rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">
                    {price.symbol.slice(0, 2)}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-sm">{price.symbol}</div>
                  <div className="text-xs text-muted-foreground">{price.category}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-sm">
                  {price.price.toFixed(price.symbol.includes('JPY') ? 3 : 5)}
                </div>
                <div className="flex items-center gap-1">
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <Badge 
                    variant={isPositive ? "default" : "secondary"}
                    className={`text-xs h-5 ${
                      isPositive 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    {isPositive ? '+' : ''}{price.changePercent.toFixed(2)}%
                  </Badge>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showViewAll && (
        <Button variant="ghost" size="sm" asChild className="w-full text-primary hover:text-primary/80">
          <Link to="/trading">
            View All Markets →
          </Link>
        </Button>
      )}
    </Card>
  );
};