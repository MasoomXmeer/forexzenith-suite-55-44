import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MarketCardProps {
  symbol: string;
  name: string;
  price: string;
  change: string;
  changePercent: string;
  isPositive: boolean;
  onClick?: () => void;
}

export const MarketCard = ({ 
  symbol, 
  name, 
  price, 
  change, 
  changePercent, 
  isPositive,
  onClick 
}: MarketCardProps) => {
  return (
    <Card 
      className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">{symbol}</h3>
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-danger" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">{name}</p>
        </div>
        
        <div className="text-right">
          <p className="font-semibold text-foreground">{price}</p>
          <div className="flex items-center gap-1">
            <span className={cn(
              "text-sm font-medium",
              isPositive ? "text-success" : "text-danger"
            )}>
              {change}
            </span>
            <span className={cn(
              "text-xs",
              isPositive ? "text-success" : "text-danger"
            )}>
              ({changePercent})
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};