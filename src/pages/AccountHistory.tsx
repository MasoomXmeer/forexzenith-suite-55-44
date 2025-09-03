import { useState } from "react";
import { ChevronRight, History, TrendingUp, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MobileHeader } from "@/components/Layout/MobileHeader";
import { XMBottomNav } from "@/components/Layout/XMBottomNav";
import { useNavigate } from "react-router-dom";
import { useHistoryData } from "@/hooks/useHistoryData";

export default function AccountHistory() {
  const navigate = useNavigate();
  const { summary, loading } = useHistoryData();

  const historyItems = [
    {
      title: "Trading History",
      description: "View all your trading activity and performance",
      route: "/trading-history",
      icon: TrendingUp,
      stats: `${summary.totalTrades} trades • ${summary.totalTrades > 0 ? ((summary.winningTrades / summary.totalTrades) * 100).toFixed(1) : 0}% win rate`
    },
    {
      title: "Transactions History", 
      description: "Track deposits, withdrawals and transfers",
      route: "/transaction-history",
      icon: DollarSign,
      stats: `$${summary.totalDeposits.toFixed(0)} deposits • $${summary.totalWithdrawals.toFixed(0)} withdrawals`
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <MobileHeader title="Account History" showNotifications={false} />
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
        <XMBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <MobileHeader 
        title="Account History" 
        showNotifications={false}
      />
      
      <div className="p-4 space-y-6">
        {/* Overview Card */}
        <Card className="p-6 bg-gradient-card border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <History className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Account Activity</h2>
              <p className="text-sm text-muted-foreground">Complete overview of your trading history</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="text-center p-4 rounded-lg bg-success/5 border border-success/20">
              <div className="text-2xl font-bold text-success">
                {summary.totalTrades > 0 ? ((summary.winningTrades / summary.totalTrades) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className={`text-2xl font-bold ${
                summary.totalProfitLoss >= 0 ? 'text-success' : 'text-destructive'
              }`}>
                {summary.totalProfitLoss >= 0 ? '+' : ''}${summary.totalProfitLoss.toFixed(0)}
              </div>
              <div className="text-sm text-muted-foreground">Total P&L</div>
            </div>
          </div>
        </Card>
        
        {/* History Items */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">History & Records</h3>
          {historyItems.map((item) => (
            <Card 
              key={item.title}
              className="p-4 border-border bg-card cursor-pointer hover:bg-accent/50 transition-all duration-200 hover:shadow-md group"
              onClick={() => navigate(item.route)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {item.stats}
                      </Badge>
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Card>
          ))}
        </div>
        
        {/* Quick Stats */}
        <Card className="p-4 bg-muted/30 border-border">
          <h3 className="font-semibold text-foreground mb-3">Quick Summary</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-foreground">{summary.totalTrades}</div>
              <div className="text-xs text-muted-foreground">Total Trades</div>
            </div>
            <div>
              <div className="text-lg font-bold text-success">${summary.totalDeposits.toFixed(0)}</div>
              <div className="text-xs text-muted-foreground">Deposits</div>
            </div>
            <div>
              <div className="text-lg font-bold text-destructive">${summary.totalWithdrawals.toFixed(0)}</div>
              <div className="text-xs text-muted-foreground">Withdrawals</div>
            </div>
          </div>
        </Card>
      </div>
      
      <XMBottomNav />
    </div>
  );
}