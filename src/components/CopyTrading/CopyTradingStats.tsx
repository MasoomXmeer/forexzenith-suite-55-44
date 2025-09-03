import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Users, Copy, BarChart3, Target, Shield, Award } from 'lucide-react';

// Mock data for analytics
const performanceData = [
  { date: '2024-01', myPerformance: 5.2, benchmark: 2.1, topTraders: 8.5 },
  { date: '2024-02', myPerformance: 8.7, benchmark: 3.2, topTraders: 12.1 },
  { date: '2024-03', myPerformance: 12.1, benchmark: 4.8, topTraders: 15.3 },
  { date: '2024-04', myPerformance: 15.3, benchmark: 6.1, topTraders: 18.9 },
  { date: '2024-05', myPerformance: 18.9, benchmark: 7.5, topTraders: 22.4 },
  { date: '2024-06', myPerformance: 22.4, benchmark: 8.9, topTraders: 26.8 },
  { date: '2024-07', myPerformance: 26.8, benchmark: 10.2, topTraders: 31.2 },
  { date: '2024-08', myPerformance: 31.2, benchmark: 11.8, topTraders: 35.6 },
  { date: '2024-09', myPerformance: 28.5, benchmark: 13.1, topTraders: 32.1 },
  { date: '2024-10', myPerformance: 33.7, benchmark: 14.6, topTraders: 38.4 },
  { date: '2024-11', myPerformance: 38.2, benchmark: 16.2, topTraders: 42.8 },
  { date: '2024-12', myPerformance: 42.8, benchmark: 17.9, topTraders: 47.1 },
];

const monthlyReturns = [
  { month: 'Jan', return: 5.2, copies: 2 },
  { month: 'Feb', return: 3.5, copies: 2 },
  { month: 'Mar', return: 3.4, copies: 3 },
  { month: 'Apr', return: 3.2, copies: 3 },
  { month: 'May', return: 3.6, copies: 3 },
  { month: 'Jun', return: 3.5, copies: 3 },
  { month: 'Jul', return: 4.4, copies: 3 },
  { month: 'Aug', return: 4.4, copies: 3 },
  { month: 'Sep', return: -2.7, copies: 3 },
  { month: 'Oct', return: 5.2, copies: 3 },
  { month: 'Nov', return: 4.5, copies: 3 },
  { month: 'Dec', return: 4.6, copies: 3 },
];

const allocationData = [
  { name: 'Alex Thompson', value: 5000, color: '#22c55e' },
  { name: 'Mike Rodriguez', value: 3000, color: '#3b82f6' },
  { name: 'Sarah Chen', value: 2500, color: '#f59e0b' },
  { name: 'Available Cash', value: 4500, color: '#6b7280' },
];

const traderPerformance = [
  { trader: 'Alex Thompson', return: 15.2, risk: 6.2, sharpe: 2.4, allocation: 33 },
  { trader: 'Mike Rodriguez', return: 11.3, risk: 7.1, sharpe: 1.8, allocation: 20 },
  { trader: 'Sarah Chen', return: 9.8, risk: 5.5, sharpe: 2.1, allocation: 17 },
  { trader: 'Emma Wilson', return: 8.5, risk: 4.8, sharpe: 2.0, allocation: 0 },
  { trader: 'David Kim', return: 7.2, risk: 3.9, sharpe: 1.9, allocation: 0 },
];

const riskMetrics = [
  { metric: 'Portfolio Beta', value: 0.85, status: 'good' },
  { metric: 'Correlation Risk', value: 0.45, status: 'medium' },
  { metric: 'Concentration Risk', value: 0.33, status: 'medium' },
  { metric: 'Leverage Ratio', value: 1.2, status: 'good' },
];

export const CopyTradingStats: React.FC = () => {
  const [timeRange, setTimeRange] = useState('1Y');
  const [activeTab, setActiveTab] = useState('performance');

  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#6b7280'];

  return (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Return</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+42.8%</div>
            <p className="text-xs text-muted-foreground">vs +17.9% benchmark</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.34</div>
            <p className="text-xs text-muted-foreground">Risk-adjusted return</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Max Drawdown</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">-5.2%</div>
            <p className="text-xs text-muted-foreground">Peak to trough</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78.5%</div>
            <p className="text-xs text-muted-foreground">Profitable months</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="allocation">Allocation</TabsTrigger>
            <TabsTrigger value="traders">Traders</TabsTrigger>
            <TabsTrigger value="risk">Risk</TabsTrigger>
          </TabsList>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1M">1 Month</SelectItem>
              <SelectItem value="3M">3 Months</SelectItem>
              <SelectItem value="6M">6 Months</SelectItem>
              <SelectItem value="1Y">1 Year</SelectItem>
              <SelectItem value="ALL">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cumulative Performance</CardTitle>
              <CardDescription>
                Your copy trading performance vs benchmark and top traders average
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [`${value}%`, name === 'myPerformance' ? 'My Performance' : name === 'benchmark' ? 'Benchmark' : 'Top Traders Avg']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="myPerformance" 
                    stroke="#22c55e" 
                    fill="#22c55e" 
                    fillOpacity={0.3}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="topTraders" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.1}
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

          <Card>
            <CardHeader>
              <CardTitle>Monthly Returns</CardTitle>
              <CardDescription>Monthly performance breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyReturns}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}%`, 'Return']} />
                  <Bar 
                    dataKey="return" 
                    fill="#22c55e"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allocation" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Allocation</CardTitle>
                <CardDescription>Distribution of your copy trading portfolio</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={allocationData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {allocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Allocation Details</CardTitle>
                <CardDescription>Breakdown by trader and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {allocationData.slice(0, -1).map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${item.value.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">
                          {((item.value / 15000) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="traders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trader Performance Comparison</CardTitle>
              <CardDescription>Performance metrics for followed traders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {traderPerformance.map((trader) => (
                  <div key={trader.trader} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{trader.trader}</h4>
                        {trader.allocation > 0 && (
                          <Copy className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-6 text-center">
                      <div>
                        <div className="text-xs text-muted-foreground">Return</div>
                        <div className="font-medium text-green-600">+{trader.return}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Risk Score</div>
                        <div className="font-medium">{trader.risk}/10</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Sharpe Ratio</div>
                        <div className="font-medium">{trader.sharpe}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Allocation</div>
                        <div className="font-medium">{trader.allocation}%</div>
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
                <CardDescription>Portfolio risk assessment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {riskMetrics.map((metric) => (
                    <div key={metric.metric} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{metric.metric}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{metric.value}</span>
                        <div className={`w-2 h-2 rounded-full ${
                          metric.status === 'good' ? 'bg-green-500' :
                          metric.status === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Diversification</CardTitle>
                <CardDescription>Portfolio diversification analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Strategy Diversification</span>
                      <span>85%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }} />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Geographic Diversification</span>
                      <span>72%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '72%' }} />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Time Horizon Diversification</span>
                      <span>68%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '68%' }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};