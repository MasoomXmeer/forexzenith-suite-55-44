import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext.minimal";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart as PieChartIcon,
  BarChart3,
  Download
} from "lucide-react";

interface AccountSummary {
  id: string;
  account_number: string;
  account_type: string;
  platform: string;
  currency: string;
  balance: number;
  equity: number;
  margin: number;
  free_margin: number;
  pnl: number;
  trades_count: number;
  winning_trades: number;
  losing_trades: number;
}

const ConsolidatedReporting = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<AccountSummary[]>([]);
  const [consolidatedData, setConsolidatedData] = useState({
    totalBalance: 0,
    totalEquity: 0,
    totalMargin: 0,
    totalPnL: 0,
    totalTrades: 0,
    winRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchConsolidatedData();
    }
  }, [user]);

  const fetchConsolidatedData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Fetch all trading accounts
      const { data: accountsData, error: accountsError } = await supabase
        .from('trading_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (accountsError) throw accountsError;

      // Fetch trades data for each account
      const accountsWithStats = await Promise.all(
        (accountsData || []).map(async (account) => {
          const { data: trades, error: tradesError } = await supabase
            .from('trades')
            .select('*')
            .eq('trading_account_id', account.id);

          if (tradesError) throw tradesError;

          const totalPnL = trades?.reduce((sum, trade) => sum + (trade.pnl || 0), 0) || 0;
          const winningTrades = trades?.filter(trade => (trade.pnl || 0) > 0).length || 0;
          const losingTrades = trades?.filter(trade => (trade.pnl || 0) < 0).length || 0;

          return {
            ...account,
            pnl: totalPnL,
            trades_count: trades?.length || 0,
            winning_trades: winningTrades,
            losing_trades: losingTrades
          };
        })
      );

      setAccounts(accountsWithStats);

      // Calculate consolidated totals
      const totals = accountsWithStats.reduce(
        (acc, account) => ({
          totalBalance: acc.totalBalance + account.balance,
          totalEquity: acc.totalEquity + account.equity,
          totalMargin: acc.totalMargin + account.margin,
          totalPnL: acc.totalPnL + account.pnl,
          totalTrades: acc.totalTrades + account.trades_count,
          totalWinning: acc.totalWinning + account.winning_trades,
          totalLosing: acc.totalLosing + account.losing_trades
        }),
        { totalBalance: 0, totalEquity: 0, totalMargin: 0, totalPnL: 0, totalTrades: 0, totalWinning: 0, totalLosing: 0 }
      );

      const winRate = totals.totalTrades > 0 ? (totals.totalWinning / totals.totalTrades) * 100 : 0;

      setConsolidatedData({
        totalBalance: totals.totalBalance,
        totalEquity: totals.totalEquity,
        totalMargin: totals.totalMargin,
        totalPnL: totals.totalPnL,
        totalTrades: totals.totalTrades,
        winRate
      });

    } catch (error: any) {
      console.error('Error fetching consolidated data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const balanceChartData = accounts.map(account => ({
    name: account.account_number.slice(-4),
    balance: account.balance,
    equity: account.equity,
    type: account.account_type
  }));

  const pnlChartData = accounts.map(account => ({
    name: account.account_number.slice(-4),
    pnl: account.pnl,
    trades: account.trades_count
  }));

  const accountTypeDistribution = accounts.reduce((acc, account) => {
    const existing = acc.find(item => item.name === account.account_type);
    if (existing) {
      existing.value += account.balance;
      existing.count += 1;
    } else {
      acc.push({
        name: account.account_type,
        value: account.balance,
        count: 1
      });
    }
    return acc;
  }, [] as any[]);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  if (isLoading) {
    return <div className="p-4">Loading consolidated report...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="p-3 md:p-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg flex-shrink-0">
              <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg md:text-2xl font-bold text-foreground truncate">
                ${consolidatedData.totalBalance.toLocaleString()}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground">Total Balance</p>
            </div>
          </div>
        </Card>

        <Card className="p-3 md:p-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-1.5 md:p-2 bg-secondary/10 rounded-lg flex-shrink-0">
              <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-secondary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg md:text-2xl font-bold text-foreground truncate">
                ${consolidatedData.totalEquity.toLocaleString()}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground">Total Equity</p>
            </div>
          </div>
        </Card>

        <Card className="p-3 md:p-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className={`p-1.5 md:p-2 rounded-lg flex-shrink-0 ${consolidatedData.totalPnL >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              {consolidatedData.totalPnL >= 0 ? 
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-green-600" /> :
                <TrendingDown className="h-4 w-4 md:h-5 md:w-5 text-red-600" />
              }
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-lg md:text-2xl font-bold truncate ${consolidatedData.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${consolidatedData.totalPnL.toLocaleString()}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground">Total P&L</p>
            </div>
          </div>
        </Card>

        <Card className="p-3 md:p-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-1.5 md:p-2 bg-accent/10 rounded-lg flex-shrink-0">
              <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-accent" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg md:text-2xl font-bold text-foreground">{consolidatedData.winRate.toFixed(1)}%</p>
              <p className="text-xs md:text-sm text-muted-foreground">Win Rate</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts and Analysis */}
      <Tabs defaultValue="overview" className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0">
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="overview" className="flex-1 md:flex-none text-xs md:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="performance" className="flex-1 md:flex-none text-xs md:text-sm">Performance</TabsTrigger>
            <TabsTrigger value="distribution" className="flex-1 md:flex-none text-xs md:text-sm">Distribution</TabsTrigger>
          </TabsList>
          <Button variant="outline" size="sm" className="w-full md:w-auto">
            <Download className="h-4 w-4 mr-2" />
            <span className="md:hidden">Export</span>
            <span className="hidden md:inline">Export Report</span>
          </Button>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <Card className="p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold mb-4">Account Balances</h3>
            <div className="h-48 md:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={balanceChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, '']} />
                  <Bar dataKey="balance" fill="hsl(var(--primary))" />
                  <Bar dataKey="equity" fill="hsl(var(--secondary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Account Details Table */}
          <Card className="p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold mb-4">Account Details</h3>
            <div className="space-y-3">
              {accounts.map((account) => (
                <div key={account.id} className="p-3 border border-border rounded-lg">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0">
                    <div className="flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm md:text-base truncate">{account.account_number}</p>
                          <Badge variant="outline" className="text-xs">
                            {account.account_type}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {account.platform}
                          </Badge>
                        </div>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          {account.currency} • {account.trades_count} trades
                        </p>
                      </div>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="font-semibold text-sm md:text-base">${account.balance.toLocaleString()}</p>
                      <p className={`text-xs md:text-sm ${account.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        P&L: ${account.pnl.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {accounts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No account data available</p>
                <p className="text-xs mt-1">Create trading accounts to view consolidated reports</p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">P&L by Account</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pnlChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'P&L']} />
                  <Line type="monotone" dataKey="pnl" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Account Type Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={accountTypeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: $${value.toLocaleString()}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {accountTypeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Balance']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConsolidatedReporting;