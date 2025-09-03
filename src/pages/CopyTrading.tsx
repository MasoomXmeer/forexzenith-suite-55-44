import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { TraderLeaderboard } from '@/components/CopyTrading/TraderLeaderboard';
import { PortfolioCopying } from '@/components/CopyTrading/PortfolioCopying';
import { SocialFeed } from '@/components/CopyTrading/SocialFeed';
import { CopyTradingStats } from '@/components/CopyTrading/CopyTradingStats';
import { TraderApplicationDialog } from '@/components/CopyTrading/TraderApplicationDialog';
import { TrendingUp, Users, Copy, BarChart3, Star, Plus } from 'lucide-react';
import { useCopyTrading } from '@/hooks/useCopyTrading';

export default function CopyTrading() {
  const [activeTab, setActiveTab] = useState('leaderboard');
  const { myCopyRelationships, checkCopyTraderStatus } = useCopyTrading();
  const [traderStatus, setTraderStatus] = useState<any>(null);

  useEffect(() => {
    const checkStatus = async () => {
      const status = await checkCopyTraderStatus();
      setTraderStatus(status);
    };
    checkStatus();
  }, [checkCopyTraderStatus]);

  const totalAllocated = myCopyRelationships.reduce((sum, rel) => sum + rel.allocated_amount, 0);
  const totalValue = myCopyRelationships.reduce((sum, rel) => sum + rel.current_value, 0);
  const totalPnL = myCopyRelationships.reduce((sum, rel) => sum + rel.total_profit_loss, 0);
  const activeCopies = myCopyRelationships.filter(rel => rel.status === 'active').length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Copy Trading Dashboard</h1>
            <p className="text-muted-foreground">
              Follow and copy successful traders automatically
            </p>
          </div>
          
          {/* Trader Application Button */}
          {!traderStatus && (
            <TraderApplicationDialog
              trigger={
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <Star className="h-4 w-4 mr-2" />
                  Become a Copy Trader
                </Button>
              }
            />
          )}
          
          {traderStatus && (
            <div className="flex items-center gap-2">
              <div className="text-sm">
                <div className="font-medium">Trader Status:</div>
                <div className={`text-xs ${
                  traderStatus.status === 'approved' ? 'text-green-600' : 
                  traderStatus.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {traderStatus.status.toUpperCase()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Copies</CardTitle>
            <Copy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCopies}</div>
            <p className="text-xs text-muted-foreground">of {myCopyRelationships.length} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Allocated</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAllocated.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all positions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Value</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Live portfolio value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalPnL >= 0 ? '+' : ''}${totalPnL.toLocaleString()}
            </div>
            <p className={`text-xs ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalAllocated > 0 ? `${((totalPnL / totalAllocated) * 100).toFixed(2)}%` : '0%'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="leaderboard">Trader Rankings</TabsTrigger>
          <TabsTrigger value="copying">My Copies</TabsTrigger>
          <TabsTrigger value="social">Social Feed</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard" className="space-y-4">
          <TraderLeaderboard />
        </TabsContent>

        <TabsContent value="copying" className="space-y-4">
          <PortfolioCopying />
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <SocialFeed />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <CopyTradingStats />
        </TabsContent>
      </Tabs>
    </div>
  );
}