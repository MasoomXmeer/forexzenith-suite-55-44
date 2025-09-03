import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TraderLeaderboard } from '@/components/CopyTrading/TraderLeaderboard';
import { PortfolioCopying } from '@/components/CopyTrading/PortfolioCopying';
import { SocialFeed } from '@/components/CopyTrading/SocialFeed';
import { CopyTradingStats } from '@/components/CopyTrading/CopyTradingStats';
import { TrendingUp, Users, Copy, BarChart3 } from 'lucide-react';

export default function CopyTrading() {
  const [activeTab, setActiveTab] = useState('leaderboard');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Copy Trading Dashboard</h1>
        <p className="text-muted-foreground">
          Follow and copy successful traders automatically
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Copies</CardTitle>
            <Copy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">+1 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Return</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+12.5%</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Following</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Top traders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Copy Volume</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$24,850</div>
            <p className="text-xs text-muted-foreground">Total allocated</p>
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