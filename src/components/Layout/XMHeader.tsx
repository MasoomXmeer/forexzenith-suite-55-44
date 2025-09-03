import { useState } from 'react';
import { Menu, User, Bell, HelpCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext.minimal';
import { useTradingAccount } from '@/hooks/useTradingAccount';


interface XMHeaderProps {
  showBalance?: boolean;
  balance?: string;
  accountNumber?: string;
  accountType?: string;
  isVerified?: boolean;
}

export const XMHeader = ({ 
  showBalance = true, 
  balance: propBalance, 
  accountNumber: propAccountNumber,
  accountType: propAccountType,
  isVerified = true 
}: XMHeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile } = useAuth();
  const { primaryAccount } = useTradingAccount();

  // Use real data or fallback to props
  const balance = primaryAccount?.balance?.toFixed(2) || profile?.balance?.toFixed(2) || propBalance || "0.00";
  const accountNumber = primaryAccount?.account_number || propAccountNumber || "N/A";
  const accountType = primaryAccount?.account_type || propAccountType || "Standard";

  return (
    <>
      {/* Main Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50 safe-area-top">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left - Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="p-2"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>

          {/* Center - Logo/Brand */}
          <div className="flex items-center gap-2">
            <div className="text-xl font-bold text-primary">XM</div>
            <Badge variant="outline" className="text-xs">15 YEARS</Badge>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="p-2">
              <HelpCircle className="h-5 w-5" />
            </Button>
            <Button asChild className="bg-success hover:bg-success-hover text-white text-sm px-4 py-2">
              <Link to="/funding">Deposit</Link>
            </Button>
          </div>
        </div>

        {/* Account Info Section (when showBalance is true) */}
        {showBalance && (
          <div className="px-4 py-3 border-t border-border/50">
            {/* Account Type Pills */}
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-success text-white">Real</Badge>
              <Badge variant="outline">MT5</Badge>
              <Badge variant="outline">Standard</Badge>
              <Badge variant="outline">Islamic</Badge>
            </div>

            {/* Account Details */}
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">
                {accountType} ({accountNumber})
              </div>
              <div className="flex items-center gap-3">
                <div className="text-3xl font-bold">${balance}</div>
                <Button variant="ghost" size="sm" className="p-1">
                  <div className="w-4 h-4 border-2 border-muted-foreground rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full"></div>
                  </div>
                </Button>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>$0.00 (0.00%)</span>
                {isVerified && (
                  <Badge className="bg-success text-white text-xs">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mr-1"></div>
                    Verified
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}
        
      </header>

      {/* Slide-out Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm">
          <div className="fixed left-0 top-0 bottom-0 w-80 bg-background border-r border-border shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <span className="text-lg font-semibold">SP</span>
                </div>
                <div>
                  <div className="font-semibold">Shabnam Perween</div>
                  <div className="text-sm text-muted-foreground">metrofashiondhanbad@gmail.com</div>
                  {isVerified && (
                    <Badge className="bg-success text-white text-xs mt-1">Verified</Badge>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-4 space-y-2">
              <Link 
                to="/dashboard" 
                className="block p-3 rounded-lg hover:bg-muted transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                to="/trading" 
                className="block p-3 rounded-lg hover:bg-muted transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Trading
              </Link>
              <Link 
                to="/portfolio" 
                className="block p-3 rounded-lg hover:bg-muted transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Portfolio
              </Link>
              <Link 
                to="/funding" 
                className="block p-3 rounded-lg hover:bg-muted transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Funding
              </Link>
              <Link 
                to="/settings" 
                className="block p-3 rounded-lg hover:bg-muted transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Settings
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};