import { Card } from "@/components/ui/card";
import { TrendingUp, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const PortfolioSummary = () => {
  const [showBalance, setShowBalance] = useState(true);
  
  const totalBalance = "12,457.89";
  const dailyChange = "+247.32";
  const dailyChangePercent = "+2.04%";
  const isPositive = true;

  return (
    <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm text-muted-foreground">Total Balance</h2>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setShowBalance(!showBalance)}
          className="h-6 w-6"
        >
          {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </Button>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-foreground">
            ${showBalance ? totalBalance : "••••••"}
          </span>
          <TrendingUp className="h-5 w-5 text-success" />
        </div>
        
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-sm font-medium",
            isPositive ? "text-success" : "text-danger"
          )}>
            {showBalance ? dailyChange : "••••"}
          </span>
          <span className={cn(
            "text-xs",
            isPositive ? "text-success" : "text-danger"
          )}>
            ({showBalance ? dailyChangePercent : "••••"})
          </span>
          <span className="text-xs text-muted-foreground">today</span>
        </div>
      </div>
    </Card>
  );
};