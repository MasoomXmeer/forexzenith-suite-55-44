import { Bell, Menu, User, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext.minimal";
import { useTradingAccount } from "@/hooks/useTradingAccount";
import { useState } from "react";

interface MobileHeaderProps {
  title: string;
  onMenuClick?: () => void;
  showNotifications?: boolean;
  showBalance?: boolean;
}

export const MobileHeader = ({ title, onMenuClick, showNotifications = true, showBalance = true }: MobileHeaderProps) => {
  const { user, profile } = useAuth();
  const { primaryAccount } = useTradingAccount();
  const [showBalanceValue, setShowBalanceValue] = useState(true);

  const balance = primaryAccount?.balance || profile?.balance || 0;
  const formattedBalance = balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onMenuClick && (
            <Button variant="ghost" size="icon" onClick={onMenuClick}>
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          {showNotifications && (
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
          )}
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Balance Display */}
      {showBalance && user && (
        <div className="px-4 pb-3 flex items-center justify-between border-t border-border/50">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Balance:</span>
            <span className="font-semibold text-foreground">
              ${showBalanceValue ? formattedBalance : "••••••"}
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowBalanceValue(!showBalanceValue)}
            className="h-6 w-6"
          >
            {showBalanceValue ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
        </div>
      )}
    </header>
  );
};