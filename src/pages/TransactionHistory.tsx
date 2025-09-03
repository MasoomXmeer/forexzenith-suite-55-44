import { useState } from "react";
import { ArrowLeft, MoreVertical, Copy, Calendar, DollarSign, ArrowUpDown, ArrowDown, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MobileHeader } from "@/components/Layout/MobileHeader";
import { XMBottomNav } from "@/components/Layout/XMBottomNav";
import { useHistoryData } from "@/hooks/useHistoryData";
import { formatDistance } from "date-fns";

export default function TransactionHistory() {
  const [activeTab, setActiveTab] = useState<"all" | "3months" | "lastMonth">("lastMonth");
  const { transactions, summary, loading, error, fetchHistoryData, getDateRange } = useHistoryData();

  const handleTabChange = (tab: "all" | "3months" | "lastMonth") => {
    setActiveTab(tab);
    fetchHistoryData(tab);
  };

  const dateRange = getDateRange(activeTab);

  const getTransactionIcon = (type: string, status: string) => {
    if (type === 'deposit') return <ArrowDown className="h-4 w-4 text-success" />;
    if (type === 'withdrawal') {
      return status === 'pending' 
        ? <ArrowUpDown className="h-4 w-4 text-warning" />
        : <ArrowUp className="h-4 w-4 text-destructive" />;
    }
    return <DollarSign className="h-4 w-4 text-muted-foreground" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <MobileHeader title="Transactions History" showNotifications={false} />
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
        title="Transactions History" 
        showNotifications={false}
      />
      
      <div className="p-4 space-y-6">
        {/* Tabs */}
        <div className="flex">
          <Button
            variant="ghost"
            className={`flex-1 text-sm transition-colors ${activeTab === "all" 
              ? "text-primary border-b-2 border-primary bg-primary/5" 
              : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => handleTabChange("all")}
          >
            All History
          </Button>
          <Button
            variant="ghost"
            className={`flex-1 text-sm transition-colors ${activeTab === "3months" 
              ? "text-primary border-b-2 border-primary bg-primary/5" 
              : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => handleTabChange("3months")}
          >
            Last 3 Months
          </Button>
          <Button
            variant="ghost"
            className={`flex-1 text-sm transition-colors ${activeTab === "lastMonth" 
              ? "text-primary border-b-2 border-primary bg-primary/5" 
              : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => handleTabChange("lastMonth")}
          >
            Last Month
          </Button>
        </div>

        {/* Date Range Display */}
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Period</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide">From</label>
              <div className="text-base font-medium text-foreground">
                {dateRange.from.toLocaleDateString()}
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide">To</label>
              <div className="text-base font-medium text-foreground">
                {dateRange.to.toLocaleDateString()}
              </div>
            </div>
          </div>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 text-center bg-card border-border">
            <div className="flex items-center justify-center mb-2">
              <ArrowDown className="h-5 w-5 text-success" />
            </div>
            <div className="text-xl font-bold text-foreground">${summary.totalDeposits.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">Deposits</div>
          </Card>
          
          <Card className="p-4 text-center bg-card border-border">
            <div className="flex items-center justify-center mb-2">
              <ArrowUpDown className="h-5 w-5 text-warning" />
            </div>
            <div className="text-xl font-bold text-foreground">${summary.totalRequestedWithdrawals.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">Requested</div>
          </Card>
          
          <Card className="p-4 text-center bg-card border-border">
            <div className="flex items-center justify-center mb-2">
              <ArrowUp className="h-5 w-5 text-destructive" />
            </div>
            <div className="text-xl font-bold text-foreground">${summary.totalWithdrawals.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">Withdrawals</div>
          </Card>
        </div>

        {/* Transactions List */}
        {transactions.length > 0 ? (
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Recent Transactions
            </h3>
            {transactions.slice(0, 10).map((transaction) => (
              <Card key={transaction.id} className="p-4 bg-card border-border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-muted/30">
                      {getTransactionIcon(transaction.type, transaction.status)}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground capitalize">
                        {transaction.type}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {transaction.currency || 'USD'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      transaction.type === 'deposit' 
                        ? 'text-success' 
                        : 'text-destructive'
                    }`}>
                      {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </div>
                    <Badge 
                      variant={
                        transaction.status === 'completed' ? 'default' :
                        transaction.status === 'pending' ? 'secondary' : 'destructive'
                      }
                      className="text-xs"
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
                
                {transaction.transaction_hash && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Hash:</span>
                    <code className="px-2 py-1 bg-muted/50 rounded text-xs font-mono">
                      {transaction.transaction_hash.substring(0, 16)}...
                    </code>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    {formatDistance(new Date(transaction.created_at), new Date(), { addSuffix: true })}
                  </span>
                  {transaction.payment_method_id && (
                    <Badge variant="outline" className="text-xs">
                      Method: {transaction.payment_method_id}
                    </Badge>
                  )}
                </div>
              </Card>
            ))}
            
            {transactions.length > 10 && (
              <Card className="p-4 text-center bg-muted/30">
                <p className="text-muted-foreground">
                  Showing 10 of {transactions.length} transactions
                </p>
                <Button variant="ghost" className="mt-2 text-primary">
                  View All Transactions
                </Button>
              </Card>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-24 h-24 rounded-full bg-muted/30 flex items-center justify-center mb-4">
              <DollarSign className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No Transactions Found</h3>
            <p className="text-center text-muted-foreground">
              No transactions were found for the selected period.
            </p>
          </div>
        )}
      </div>
      
      <XMBottomNav />
    </div>
  );
}