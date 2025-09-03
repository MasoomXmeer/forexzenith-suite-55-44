import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TraderProfileDialog } from './TraderProfileDialog';
import { CopyAmountDialog } from './CopyAmountDialog';
import { TrendingUp, TrendingDown, Users, Star, Search, Filter } from 'lucide-react';
import { useCopyTrading } from '@/hooks/useCopyTrading';
import { toast } from '@/hooks/use-toast';

export const TraderLeaderboard: React.FC = () => {
  const { copyTraders, isLoading } = useCopyTrading();
  const [sortBy, setSortBy] = useState('performance_return_1y');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrader, setSelectedTrader] = useState<any>(null);
  const [copyDialogTrader, setCopyDialogTrader] = useState<any>(null);

  const getRiskBadgeColor = (score: number) => {
    if (score <= 3) return 'bg-green-100 text-green-800';
    if (score <= 6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getRiskLabel = (score: number) => {
    if (score <= 3) return 'Low';
    if (score <= 6) return 'Medium';
    return 'High';
  };

  const filteredTraders = copyTraders.filter(trader =>
    trader.trader_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (trader.trading_strategy && trader.trading_strategy.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedTraders = [...filteredTraders].sort((a, b) => {
    switch (sortBy) {
      case 'performance_return_1y':
        return b.performance_return_1y - a.performance_return_1y;
      case 'performance_return_3m':
        return b.performance_return_3m - a.performance_return_3m;
      case 'performance_return_1m':
        return b.performance_return_1m - a.performance_return_1m;
      case 'win_rate':
        return b.win_rate - a.win_rate;
      case 'total_followers':
        return b.total_followers - a.total_followers;
      case 'risk_level':
        return a.risk_level - b.risk_level;
      default:
        return 0;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading copy traders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search traders by name or strategy..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="performance_return_1y">1Y Return</SelectItem>
            <SelectItem value="performance_return_3m">3M Return</SelectItem>
            <SelectItem value="performance_return_1m">1M Return</SelectItem>
            <SelectItem value="win_rate">Win Rate</SelectItem>
            <SelectItem value="total_followers">Followers</SelectItem>
            <SelectItem value="risk_level">Risk Score</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Traders Grid */}
      <div className="grid gap-4">
        {sortedTraders.map((trader, index) => (
          <Card key={trader.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Trader Info */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-sm">
                      #{index + 1}
                    </Badge>
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>{trader.trader_name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{trader.trader_name}</h3>
                      {trader.is_verified && (
                        <Badge variant="secondary" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{trader.trading_strategy}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-muted-foreground">
                        <Users className="h-3 w-3 inline mr-1" />
                        {trader.total_followers.toLocaleString()} followers
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {trader.total_copiers.toLocaleString()} copiers
                      </span>
                    </div>
                  </div>
                </div>

                {/* Performance Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">1Y Return</div>
                    <div className={`text-sm font-bold ${trader.performance_return_1y >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {trader.performance_return_1y >= 0 ? '+' : ''}{trader.performance_return_1y.toFixed(1)}%
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Win Rate</div>
                    <div className="text-sm font-bold">{trader.win_rate.toFixed(1)}%</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Risk Score</div>
                    <Badge className={`text-xs ${getRiskBadgeColor(trader.risk_level)}`}>
                      {getRiskLabel(trader.risk_level)}
                    </Badge>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Max DD</div>
                    <div className="text-sm font-bold text-red-600">{trader.max_drawdown.toFixed(1)}%</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedTrader(trader)}>
                    View Profile
                  </Button>
                  
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setCopyDialogTrader(trader)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Copy Trader
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sortedTraders.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            {searchTerm ? 'No traders found matching your search' : 'No copy traders available'}
          </p>
        </div>
      )}

      {/* Trader Profile Dialog */}
      {selectedTrader && (
        <TraderProfileDialog
          trader={selectedTrader}
          isOpen={!!selectedTrader}
          onClose={() => setSelectedTrader(null)}
          onFollow={() => {}}
          onCopy={() => setCopyDialogTrader(selectedTrader)}
        />
      )}

      {/* Copy Amount Dialog */}
      {copyDialogTrader && (
        <CopyAmountDialog
          trader={copyDialogTrader}
          isOpen={!!copyDialogTrader}
          onClose={() => setCopyDialogTrader(null)}
        />
      )}
    </div>
  );
};