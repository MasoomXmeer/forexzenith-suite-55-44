import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Users, Star, Calendar, Target, BarChart3, PieChart } from 'lucide-react';

interface Trader {
  id: string;
  name: string;
  avatar: string;
  rank: number;
  return1M: number;
  return3M: number;
  return1Y: number;
  winRate: number;
  followers: number;
  copiers: number;
  riskScore: number;
  maxDrawdown: number;
  totalTrades: number;
  strategy: string;
  isVerified: boolean;
  isFollowing: boolean;
  isCopying: boolean;
}

interface TraderProfileDialogProps {
  trader: Trader;
  isOpen: boolean;
  onClose: () => void;
  onFollow: () => void;
  onCopy: () => void;
}

// Mock performance data
const performanceData = [
  { month: 'Jan', return: 5.2, benchmark: 2.1 },
  { month: 'Feb', return: 8.7, benchmark: 3.2 },
  { month: 'Mar', return: 12.1, benchmark: 4.8 },
  { month: 'Apr', return: 15.3, benchmark: 6.1 },
  { month: 'May', return: 18.9, benchmark: 7.5 },
  { month: 'Jun', return: 22.4, benchmark: 8.9 },
  { month: 'Jul', return: 26.8, benchmark: 10.2 },
  { month: 'Aug', return: 31.2, benchmark: 11.8 },
  { month: 'Sep', return: 28.5, benchmark: 13.1 },
  { month: 'Oct', return: 33.7, benchmark: 14.6 },
  { month: 'Nov', return: 38.2, benchmark: 16.2 },
  { month: 'Dec', return: 42.8, benchmark: 17.9 },
];

const tradingActivity = [
  { symbol: 'EURUSD', trades: 45, winRate: 82, pnl: 1250 },
  { symbol: 'GBPUSD', trades: 38, winRate: 76, pnl: 980 },
  { symbol: 'XAUUSD', trades: 22, winRate: 73, pnl: 2100 },
  { symbol: 'USDJPY', trades: 31, winRate: 79, pnl: 750 },
  { symbol: 'USOIL', trades: 18, winRate: 67, pnl: 420 },
];

export const TraderProfileDialog: React.FC<TraderProfileDialogProps> = ({
  trader,
  isOpen,
  onClose,
  onFollow,
  onCopy,
}) => {
  const getRiskBadgeColor = (score: number) => {
    if (score <= 3) return 'bg-green-100 text-green-800';
    if (score <= 6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getRiskLabel = (score: number) => {
    if (score <= 3) return 'Low Risk';
    if (score <= 6) return 'Medium Risk';
    return 'High Risk';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={trader.avatar} alt={trader.name} />
              <AvatarFallback>{trader.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-2xl">{trader.name}</DialogTitle>
                <Badge variant="outline">#{trader.rank}</Badge>
                {trader.isVerified && (
                  <Badge variant="secondary">
                    <Star className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <DialogDescription className="text-base">
                {trader.strategy} • {trader.followers.toLocaleString()} followers • {trader.copiers.toLocaleString()} copiers
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <Button variant={trader.isFollowing ? "secondary" : "outline"} onClick={onFollow}>
                {trader.isFollowing ? 'Following' : 'Follow'}
              </Button>
              <Button variant={trader.isCopying ? "destructive" : "default"} onClick={onCopy}>
                {trader.isCopying ? 'Stop Copy' : 'Copy Trader'}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="trading">Trading Activity</TabsTrigger>
            <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">1 Year Return</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${trader.return1Y >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {trader.return1Y >= 0 ? '+' : ''}{trader.return1Y.toFixed(1)}%
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    vs {trader.return3M.toFixed(1)}% (3M)
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{trader.winRate.toFixed(1)}%</div>
                  <Progress value={trader.winRate} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className={`text-sm ${getRiskBadgeColor(trader.riskScore)}`}>
                    {getRiskLabel(trader.riskScore)}
                  </Badge>
                  <div className="text-xs text-muted-foreground mt-1">
                    Score: {trader.riskScore}/10
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>About This Trader</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Strategy</div>
                    <div className="font-medium">{trader.strategy}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Total Trades</div>
                    <div className="font-medium">{trader.totalTrades.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Max Drawdown</div>
                    <div className="font-medium text-red-600">{trader.maxDrawdown.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Active Since</div>
                    <div className="font-medium">Jan 2023</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Trading Philosophy</h4>
                  <p className="text-sm text-muted-foreground">
                    Focused on momentum-based strategies with strict risk management. 
                    Uses technical analysis combined with fundamental market drivers to identify high-probability setups.
                    Maintains disciplined position sizing and always uses stop losses.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Chart</CardTitle>
                <CardDescription>12-month return vs benchmark</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [`${value}%`, name === 'return' ? 'Trader' : 'Benchmark']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="return" 
                      stroke="#22c55e" 
                      fill="#22c55e" 
                      fillOpacity={0.3}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="benchmark" 
                      stroke="#6b7280" 
                      fill="#6b7280" 
                      fillOpacity={0.1}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Best Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-green-600">+24.7%</div>
                  <div className="text-xs text-muted-foreground">March 2024</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Worst Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-red-600">-3.2%</div>
                  <div className="text-xs text-muted-foreground">August 2024</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Sharpe Ratio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">2.34</div>
                  <div className="text-xs text-muted-foreground">Risk-adjusted return</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trading" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Trading Activity by Symbol</CardTitle>
                <CardDescription>Last 30 days performance breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tradingActivity.map((activity) => (
                    <div key={activity.symbol} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="font-medium">{activity.symbol}</div>
                        <Badge variant="outline">{activity.trades} trades</Badge>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{activity.winRate}% win rate</div>
                        <div className={`text-sm ${activity.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {activity.pnl >= 0 ? '+' : ''}${activity.pnl}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risk" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Risk Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Value at Risk (VaR)</span>
                      <span className="text-sm font-medium">2.3%</span>
                    </div>
                    <Progress value={23} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Maximum Drawdown</span>
                      <span className="text-sm font-medium text-red-600">{trader.maxDrawdown}%</span>
                    </div>
                    <Progress value={Math.abs(trader.maxDrawdown)} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Volatility</span>
                      <span className="text-sm font-medium">12.4%</span>
                    </div>
                    <Progress value={42} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk Assessment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">{trader.riskScore}/10</div>
                    <Badge className={`${getRiskBadgeColor(trader.riskScore)}`}>
                      {getRiskLabel(trader.riskScore)}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Position Sizing</span>
                      <span className="text-green-600">Conservative</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Stop Loss Usage</span>
                      <span className="text-green-600">Always</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Leverage</span>
                      <span className="text-yellow-600">Moderate</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Correlation Risk</span>
                      <span className="text-green-600">Low</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};