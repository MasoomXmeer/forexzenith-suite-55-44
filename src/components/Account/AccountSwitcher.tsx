import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext.minimal";
import { toast } from "@/hooks/use-toast";
import { 
  CreditCard, 
  Plus, 
  Settings, 
  TrendingUp, 
  DollarSign,
  Smartphone,
  Monitor,
  Globe
} from "lucide-react";

interface TradingAccount {
  id: string;
  account_number: string;
  account_type: 'demo' | 'micro' | 'standard' | 'zero' | 'ultra_low';
  platform: 'MT4' | 'MT5' | 'WebTrader';
  currency: string;
  leverage: number;
  balance: number;
  equity: number;
  margin: number;
  free_margin: number;
  is_active: boolean;
  is_primary: boolean;
}

const AccountSwitcher = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<TradingAccount | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const accountTypeLabels = {
    demo: { label: "Demo", color: "secondary" },
    micro: { label: "Micro", color: "default" },
    standard: { label: "Standard", color: "default" },
    zero: { label: "Zero Spread", color: "destructive" },
    ultra_low: { label: "Ultra Low", color: "default" }
  };

  const platformIcons = {
    MT4: Monitor,
    MT5: Smartphone,
    WebTrader: Globe
  };

  useEffect(() => {
    if (user) {
      fetchAccounts();
    }
  }, [user]);

  const fetchAccounts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('trading_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false });

      if (error) throw error;

      setAccounts(data || []);
      if (data && data.length > 0) {
        const primary = data.find(acc => acc.is_primary) || data[0];
        setSelectedAccount(primary);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load trading accounts",
        variant: "destructive"
      });
    }
  };

  const createAccount = async (formData: any) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const accountNumber = 'XM' + Math.floor(Math.random() * 99999999).toString().padStart(8, '0');
      
      const { error } = await supabase
        .from('trading_accounts')
        .insert([{
          user_id: user.id,
          account_number: accountNumber,
          account_type: formData.accountType,
          platform: formData.platform,
          currency: formData.currency,
          leverage: parseInt(formData.leverage),
          is_primary: accounts.length === 0
        }]);

      if (error) throw error;

      toast({
        title: "Account Created",
        description: `New ${formData.accountType} account created successfully`
      });

      setShowCreateDialog(false);
      fetchAccounts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const switchAccount = async (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    if (account) {
      setSelectedAccount(account);
      toast({
        title: "Account Switched",
        description: `Switched to ${account.account_type} account ${account.account_number}`
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Current Account Display */}
      {selectedAccount && (
        <Card className="p-3 md:p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                <CreditCard className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-foreground text-sm md:text-base truncate">{selectedAccount.account_number}</p>
                  <Badge variant={accountTypeLabels[selectedAccount.account_type].color as any} className="text-xs">
                    {accountTypeLabels[selectedAccount.account_type].label}
                  </Badge>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {selectedAccount.platform} • {selectedAccount.currency} • 1:{selectedAccount.leverage}
                </p>
              </div>
            </div>
            <div className="text-left md:text-right">
              <p className="text-xl md:text-2xl font-bold text-primary">${selectedAccount.balance.toLocaleString()}</p>
              <p className="text-xs md:text-sm text-muted-foreground">Balance</p>
            </div>
          </div>
        </Card>
      )}

      {/* Account Switcher */}
      <Card className="p-3 md:p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0 mb-4">
          <h3 className="text-base md:text-lg font-semibold">Trading Accounts</h3>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="w-full md:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                <span className="md:hidden">Add New Account</span>
                <span className="hidden md:inline">New Account</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-md mx-auto">
              <DialogHeader>
                <DialogTitle>Create Trading Account</DialogTitle>
              </DialogHeader>
              <CreateAccountForm onSubmit={createAccount} isLoading={isLoading} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-2 md:space-y-3">
          {accounts.map((account) => {
            const PlatformIcon = platformIcons[account.platform];
            return (
              <div
                key={account.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors touch-feedback ${
                  selectedAccount?.id === account.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-muted/50'
                }`}
                onClick={() => switchAccount(account.id)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <PlatformIcon className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm md:text-base truncate">{account.account_number}</p>
                        <Badge 
                          variant={accountTypeLabels[account.account_type].color as any}
                          className="text-xs"
                        >
                          {accountTypeLabels[account.account_type].label}
                        </Badge>
                        {account.is_primary && <Badge variant="outline" className="text-xs">Primary</Badge>}
                      </div>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {account.platform} • {account.currency} • 1:{account.leverage}
                      </p>
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="font-semibold text-sm md:text-base">${account.balance.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      Equity: ${account.equity.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {accounts.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">No trading accounts found</p>
            <p className="text-xs mt-1">Create your first account to get started</p>
          </div>
        )}
      </Card>
    </div>
  );
};

const CreateAccountForm = ({ onSubmit, isLoading }: { onSubmit: (data: any) => void; isLoading: boolean }) => {
  const [formData, setFormData] = useState({
    accountType: 'demo',
    platform: 'MT5',
    currency: 'USD',
    leverage: '100'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="accountType">Account Type</Label>
        <Select value={formData.accountType} onValueChange={(value) => setFormData({...formData, accountType: value})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="demo">Demo Account</SelectItem>
            <SelectItem value="micro">Micro Account</SelectItem>
            <SelectItem value="standard">Standard Account</SelectItem>
            <SelectItem value="zero">Zero Spread Account</SelectItem>
            <SelectItem value="ultra_low">Ultra Low Account</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="platform">Trading Platform</Label>
        <Select value={formData.platform} onValueChange={(value) => setFormData({...formData, platform: value})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MT4">MetaTrader 4</SelectItem>
            <SelectItem value="MT5">MetaTrader 5</SelectItem>
            <SelectItem value="WebTrader">XM WebTrader</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="currency">Base Currency</Label>
        <Select value={formData.currency} onValueChange={(value) => setFormData({...formData, currency: value})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USD">USD</SelectItem>
            <SelectItem value="EUR">EUR</SelectItem>
            <SelectItem value="GBP">GBP</SelectItem>
            <SelectItem value="JPY">JPY</SelectItem>
            <SelectItem value="AUD">AUD</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="leverage">Leverage</Label>
        <Select value={formData.leverage} onValueChange={(value) => setFormData({...formData, leverage: value})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1:1</SelectItem>
            <SelectItem value="50">1:50</SelectItem>
            <SelectItem value="100">1:100</SelectItem>
            <SelectItem value="200">1:200</SelectItem>
            <SelectItem value="500">1:500</SelectItem>
            <SelectItem value="888">1:888</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Account"}
      </Button>
    </form>
  );
};

export default AccountSwitcher;