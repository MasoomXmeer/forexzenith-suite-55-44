import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAdminData } from "@/hooks/useAdminData";
import { MT5Configuration } from "@/components/Admin/MT5Configuration";
import { SupportManagement } from "@/components/Admin/SupportManagement";
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Settings, 
  Plus,
  Edit,
  Trash2,
  Eye,
  Loader2,
  Activity
} from "lucide-react";

const AdminPanel = () => {
  const { toast } = useToast();
  const {
    stats,
    users,
    trades,
    tradingAccounts,
    markets,
    paymentMethods,
    settings,
    loading,
    error,
    createMarket,
    updateMarket,
    deleteMarket,
    updatePaymentMethod,
    updateSetting
  } = useAdminData();

  const [newMarket, setNewMarket] = useState({
    symbol: "",
    name: "",
    basePrice: "",
    spread: ""
  });

  const handleCreateMarket = async () => {
    if (!newMarket.symbol || !newMarket.name || !newMarket.basePrice || !newMarket.spread) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    try {
      await createMarket({
        symbol: newMarket.symbol,
        name: newMarket.name,
        base_price: parseFloat(newMarket.basePrice),
        current_price: parseFloat(newMarket.basePrice),
        spread: parseFloat(newMarket.spread)
      });

      setNewMarket({ symbol: "", name: "", basePrice: "", spread: "" });
      toast({
        title: "Success",
        description: "Market created successfully"
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create market",
        variant: "destructive"
      });
    }
  };

  const handleToggleMarket = async (marketId: string, currentState: boolean) => {
    try {
      await updateMarket(marketId, { is_active: !currentState });
      toast({
        title: "Success",
        description: `Market ${!currentState ? 'activated' : 'deactivated'} successfully`
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update market",
        variant: "destructive"
      });
    }
  };

  const handleTogglePaymentMethod = async (methodId: string, currentState: boolean) => {
    try {
      await updatePaymentMethod(methodId, { is_enabled: !currentState });
      toast({
        title: "Success",
        description: `Payment method ${!currentState ? 'enabled' : 'disabled'} successfully`
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update payment method",
        variant: "destructive"
      });
    }
  };

  const handleDeleteMarket = async (marketId: string) => {
    if (!confirm("Are you sure you want to delete this market?")) return;
    
    try {
      await deleteMarket(marketId);
      toast({
        title: "Success",
        description: "Market deleted successfully"
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete market",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading admin panel...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-2">Error</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
          <Badge variant="outline" className="px-3 py-1">
            AonePrime Control Center
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
               <div>
                 <p className="text-sm text-muted-foreground">Total Users</p>
                 <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
               </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
               <div>
                 <p className="text-sm text-muted-foreground">Active Trades</p>
                 <p className="text-2xl font-bold">{stats.activeTrades}</p>
               </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-warning" />
              </div>
               <div>
                 <p className="text-sm text-muted-foreground">Total Volume</p>
                 <p className="text-2xl font-bold">${(stats.totalVolume / 1000000).toFixed(1)}M</p>
               </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-danger/10 rounded-lg">
                <Settings className="h-6 w-6 text-danger" />
              </div>
               <div>
                 <p className="text-sm text-muted-foreground">Commission</p>
                 <p className="text-2xl font-bold">${(stats.totalCommission / 1000).toFixed(1)}K</p>
               </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="support" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8 text-xs md:text-sm">
            <TabsTrigger value="support">Support</TabsTrigger>
            <TabsTrigger value="accounts" className="hidden sm:flex">Accounts</TabsTrigger>
            <TabsTrigger value="mt5">Market Data</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="markets">Markets</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Support Management Tab */}
          <TabsContent value="support">
            <SupportManagement />
          </TabsContent>

          {/* Trading Accounts Management Tab */}
          <TabsContent value="accounts" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Trading Accounts Management</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Accounts</p>
                      <p className="text-2xl font-bold">{tradingAccounts.length}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-success/10 rounded-lg">
                      <Activity className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Active Accounts</p>
                      <p className="text-2xl font-bold">{tradingAccounts.filter(acc => acc.is_active).length}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-warning/10 rounded-lg">
                      <DollarSign className="h-6 w-6 text-warning" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Balance</p>
                      <p className="text-2xl font-bold">${tradingAccounts.reduce((sum, acc) => sum + acc.balance, 0).toLocaleString()}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Equity</p>
                      <p className="text-2xl font-bold">${tradingAccounts.reduce((sum, acc) => sum + acc.equity, 0).toLocaleString()}</p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">All Trading Accounts</h4>
                <div className="space-y-3">
                  {tradingAccounts.map((account) => (
                    <div key={account.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-border rounded-lg gap-4">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold">{account.account_number}</p>
                            <Badge variant={account.account_type === 'demo' ? 'secondary' : 'default'} className="text-xs">
                              {account.account_type}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {account.platform}
                            </Badge>
                            {account.is_primary && <Badge variant="default" className="text-xs">Primary</Badge>}
                            {!account.is_active && <Badge variant="destructive" className="text-xs">Inactive</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {account.currency} • 1:{account.leverage} • Created: {new Date(account.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between md:justify-end gap-4">
                        <div className="text-right">
                          <p className="font-semibold text-lg">${account.balance.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">
                            Equity: ${account.equity.toLocaleString()} | Margin: ${account.margin.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Free Margin: ${account.free_margin.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={account.is_active} 
                            onCheckedChange={() => {
                              // Handle account activation/deactivation
                              toast({
                                title: "Info",
                                description: "Account status management will be implemented in admin functions"
                              });
                            }}
                          />
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {tradingAccounts.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No trading accounts found</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Market Data Tab */}
          <TabsContent value="mt5">
            <MT5Configuration />
          </TabsContent>

          {/* Portfolio Management Tab */}
          <TabsContent value="portfolio">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Portfolio Management Overview</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <DollarSign className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
                      <p className="text-2xl font-bold">${stats.totalPortfolioValue}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-success/10 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Active Portfolios</p>
                      <p className="text-2xl font-bold">{stats.activePortfolios}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-warning/10 rounded-lg">
                      <Activity className="h-6 w-6 text-warning" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Positions</p>
                      <p className="text-2xl font-bold">{stats.totalPositions}</p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Recent Portfolio Activities</h4>
                <div className="space-y-2">
                  {trades.slice(0, 10).map((trade) => (
                    <div key={trade.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant={trade.type === 'buy' ? 'default' : 'destructive'}>
                          {trade.type.toUpperCase()}
                        </Badge>
                        <div>
                          <p className="font-medium">{trade.symbol}</p>
                          <p className="text-sm text-muted-foreground">
                            {trade.amount} lots @ {trade.open_price}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {trade.pnl >= 0 ? '+' : ''}${trade.pnl}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(trade.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Affiliate Management Tab */}
          <TabsContent value="affiliate" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Affiliates</p>
                    <p className="text-2xl font-bold">{users.filter(u => u.is_affiliate).length}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-success/10 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Referrals</p>
                    <p className="text-2xl font-bold">{users.filter(u => u.referred_by).length}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-warning/10 rounded-lg">
                    <DollarSign className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Paid Commissions</p>
                    <p className="text-2xl font-bold">${stats.totalCommission.toLocaleString()}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-danger/10 rounded-lg">
                    <Activity className="h-6 w-6 text-danger" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Payouts</p>
                    <p className="text-2xl font-bold">$0</p>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Affiliate Performance</h3>
              <div className="space-y-4">
                {users.filter(user => user.is_affiliate).map((affiliate) => {
                  const referralCount = users.filter(u => u.referred_by === affiliate.id).length;
                  return (
                    <div key={affiliate.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold">
                            {affiliate.first_name?.[0]}{affiliate.last_name?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold">
                            {affiliate.first_name} {affiliate.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">{affiliate.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Code: {affiliate.referral_code}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Referrals</p>
                            <p className="text-lg font-bold">{referralCount}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Earnings</p>
                            <p className="text-lg font-bold text-success">$0.00</p>
                          </div>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {users.filter(user => user.is_affiliate).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No affiliates found</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* History Management Tab */}
          <TabsContent value="history">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">User History Management</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Trades</p>
                      <p className="text-2xl font-bold">{trades.length}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-success/10 rounded-lg">
                      <Activity className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Active Trades</p>
                      <p className="text-2xl font-bold">{trades.filter(t => t.status === 'open').length}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-warning/10 rounded-lg">
                      <DollarSign className="h-6 w-6 text-warning" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total P&L</p>
                      <p className="text-2xl font-bold">${trades.reduce((sum, t) => sum + t.pnl, 0).toFixed(2)}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <Users className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Active Traders</p>
                      <p className="text-2xl font-bold">{new Set(trades.map(t => t.user_id)).size}</p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Recent Trading Activity</h4>
                <div className="space-y-3">
                  {trades.slice(0, 10).map((trade) => {
                    const trader = users.find(u => u.id === trade.user_id);
                    return (
                      <div key={trade.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-border rounded-lg gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold">
                              {trader?.first_name?.[0]}{trader?.last_name?.[0]}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold">{trade.symbol}</p>
                              <Badge variant={trade.type === 'buy' ? 'default' : 'destructive'}>
                                {trade.type.toUpperCase()}
                              </Badge>
                              <Badge variant="outline">
                                {trade.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {trader?.first_name} {trader?.last_name} • {trade.amount} lots @ ${trade.open_price}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between md:justify-end gap-4">
                          <div className="text-right">
                            <p className={`font-semibold text-lg ${trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {trade.pnl >= 0 ? '+' : ''}${trade.pnl}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(trade.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {trades.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No trading history found</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Markets Tab */}
          <TabsContent value="markets" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Add New Market</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="symbol">Symbol</Label>
                  <Input
                    id="symbol"
                    placeholder="EUR/USD"
                    value={newMarket.symbol}
                    onChange={(e) => setNewMarket({...newMarket, symbol: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Euro / US Dollar"
                    value={newMarket.name}
                    onChange={(e) => setNewMarket({...newMarket, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="basePrice">Base Price</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    step="0.0001"
                    placeholder="1.0847"
                    value={newMarket.basePrice}
                    onChange={(e) => setNewMarket({...newMarket, basePrice: e.target.value})}
                  />
                </div>
                 <div className="flex items-end">
                   <Button className="w-full" onClick={handleCreateMarket}>
                     <Plus className="h-4 w-4 mr-2" />
                     Add Market
                   </Button>
                 </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Manage Markets</h3>
               <div className="space-y-4">
                 {markets.map((market) => (
                   <div key={market.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                     <div className="flex items-center gap-4">
                       <div>
                         <p className="font-semibold">{market.symbol}</p>
                         <p className="text-sm text-muted-foreground">{market.name}</p>
                       </div>
                       <Badge variant={market.is_active ? "default" : "secondary"}>
                         {market.is_active ? "Active" : "Inactive"}
                       </Badge>
                     </div>
                     <div className="flex items-center gap-4">
                       <div className="text-right">
                         <p className="font-semibold">{market.current_price.toFixed(4)}</p>
                         <p className="text-sm text-muted-foreground">Spread: {market.spread} pips</p>
                       </div>
                       <div className="flex items-center gap-2">
                         <Switch 
                           checked={market.is_active} 
                           onCheckedChange={() => handleToggleMarket(market.id, market.is_active)}
                         />
                         <Button variant="ghost" size="icon">
                           <Eye className="h-4 w-4" />
                         </Button>
                         <Button variant="ghost" size="icon">
                           <Edit className="h-4 w-4" />
                         </Button>
                         <Button 
                           variant="ghost" 
                           size="icon"
                           onClick={() => handleDeleteMarket(market.id)}
                         >
                           <Trash2 className="h-4 w-4" />
                         </Button>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">User Management</h3>
               <div className="space-y-4">
                 {users.map((user) => (
                   <div key={user.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                     <div className="flex items-center gap-4">
                       <div>
                         <p className="font-semibold">{user.first_name} {user.last_name}</p>
                         <p className="text-sm text-muted-foreground">{user.email}</p>
                       </div>
                       <Badge variant={user.kyc_status === "verified" ? "default" : "secondary"}>
                         {user.kyc_status}
                       </Badge>
                       <Badge variant="outline">
                         {user.account_type}
                       </Badge>
                     </div>
                     <div className="flex items-center gap-4">
                       <div className="text-right">
                         <p className="font-semibold">${user.balance.toFixed(2)}</p>
                         <p className="text-sm text-muted-foreground">Balance</p>
                       </div>
                       <div className="flex items-center gap-2">
                         <Button variant="ghost" size="icon">
                           <Eye className="h-4 w-4" />
                         </Button>
                         <Button variant="ghost" size="icon">
                           <Edit className="h-4 w-4" />
                         </Button>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
               <div className="space-y-4">
                 {paymentMethods.map((method) => (
                   <div key={method.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                     <div className="flex items-center gap-4">
                       <div>
                         <p className="font-semibold">{method.name}</p>
                         <p className="text-sm text-muted-foreground">{method.provider}</p>
                       </div>
                       <Badge variant={method.is_enabled ? "default" : "secondary"}>
                         {method.is_enabled ? "Enabled" : "Disabled"}
                       </Badge>
                     </div>
                     <div className="flex items-center gap-4">
                       <Switch 
                         checked={method.is_enabled} 
                         onCheckedChange={() => handleTogglePaymentMethod(method.id, method.is_enabled)}
                       />
                       <div className="flex items-center gap-2">
                         <Button variant="ghost" size="icon">
                           <Settings className="h-4 w-4" />
                         </Button>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
             <Card className="p-6">
               <h3 className="text-lg font-semibold mb-4">Platform Settings</h3>
               <div className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {settings.map((setting) => (
                     <div key={setting.key} className="space-y-2">
                       <Label htmlFor={setting.key}>
                         {setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                       </Label>
                       {setting.key === 'maximum_leverage' ? (
                         <select 
                           className="w-full p-2 bg-background border border-border rounded-md"
                           defaultValue={setting.value}
                           onChange={(e) => updateSetting(setting.key, e.target.value)}
                         >
                           <option value="1:50">1:50</option>
                           <option value="1:100">1:100</option>
                           <option value="1:200">1:200</option>
                           <option value="1:500">1:500</option>
                         </select>
                       ) : setting.key.includes('mode') ? (
                         <Switch 
                           checked={setting.value === 'true'}
                           onCheckedChange={(checked) => updateSetting(setting.key, checked.toString())}
                         />
                       ) : (
                         <Input 
                           id={setting.key}
                           type={setting.key.includes('rate') || setting.key.includes('multiplier') ? "number" : "text"}
                           step={setting.key.includes('rate') || setting.key.includes('multiplier') ? "0.01" : undefined}
                           defaultValue={setting.value}
                           onBlur={(e) => updateSetting(setting.key, e.target.value)}
                         />
                       )}
                       {setting.description && (
                         <p className="text-xs text-muted-foreground">{setting.description}</p>
                       )}
                     </div>
                   ))}
                 </div>
               </div>
             </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;