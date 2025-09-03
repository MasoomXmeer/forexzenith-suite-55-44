import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TraderProfileDialog } from './TraderProfileDialog';
import { TrendingUp, TrendingDown, Users, Star, Search, Filter } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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

const mockTraders: Trader[] = [
  {
    id: '1',
    name: 'Alex Thompson',
    avatar: '/avatars/alex.jpg',
    rank: 1,
    return1M: 15.2,
    return3M: 42.8,
    return1Y: 156.3,
    winRate: 78.5,
    followers: 2340,
    copiers: 580,
    riskScore: 6.2,
    maxDrawdown: -8.5,
    totalTrades: 347,
    strategy: 'Scalping & Momentum',
    isVerified: true,
    isFollowing: false,
    isCopying: false,
  },
  {
    id: '2',
    name: 'Sarah Chen',
    avatar: '/avatars/sarah.jpg',
    rank: 2,
    return1M: 12.7,
    return3M: 38.4,
    return1Y: 142.1,
    winRate: 82.3,
    followers: 1890,
    copiers: 425,
    riskScore: 4.8,
    maxDrawdown: -6.2,
    totalTrades: 256,
    strategy: 'Swing Trading',
    isVerified: true,
    isFollowing: true,
    isCopying: false,
  },
  {
    id: '3',
    name: 'Mike Rodriguez',
    avatar: '/avatars/mike.jpg',
    rank: 3,
    return1M: 11.3,
    return3M: 35.6,
    return1Y: 128.9,
    winRate: 75.8,
    followers: 1567,
    copiers: 312,
    riskScore: 7.1,
    maxDrawdown: -12.3,
    totalTrades: 492,
    strategy: 'News Trading',
    isVerified: false,
    isFollowing: false,
    isCopying: true,
  },
  {
    id: '4',
    name: 'Emma Wilson',
    avatar: '/avatars/emma.jpg',
    rank: 4,
    return1M: 9.8,
    return3M: 31.2,
    return1Y: 115.7,
    winRate: 79.1,
    followers: 1234,
    copiers: 278,
    riskScore: 5.5,
    maxDrawdown: -9.1,
    totalTrades: 189,
    strategy: 'Technical Analysis',
    isVerified: true,
    isFollowing: false,
    isCopying: false,
  },
];

export const TraderLeaderboard: React.FC = () => {
  const [traders, setTraders] = useState<Trader[]>(mockTraders);
  const [sortBy, setSortBy] = useState('return1Y');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrader, setSelectedTrader] = useState<Trader | null>(null);

  const handleFollow = (traderId: string) => {
    setTraders(prev => prev.map(trader => 
      trader.id === traderId 
        ? { ...trader, isFollowing: !trader.isFollowing, followers: trader.isFollowing ? trader.followers - 1 : trader.followers + 1 }
        : trader
    ));
    
    const trader = traders.find(t => t.id === traderId);
    toast({
      title: trader?.isFollowing ? "Unfollowed" : "Following",
      description: `You are now ${trader?.isFollowing ? 'not following' : 'following'} ${trader?.name}`,
    });
  };

  const handleCopy = (traderId: string) => {
    setTraders(prev => prev.map(trader => 
      trader.id === traderId 
        ? { ...trader, isCopying: !trader.isCopying, copiers: trader.isCopying ? trader.copiers - 1 : trader.copiers + 1 }
        : trader
    ));
    
    const trader = traders.find(t => t.id === traderId);
    toast({
      title: trader?.isCopying ? "Stopped Copying" : "Started Copying",
      description: `Copy trading ${trader?.isCopying ? 'stopped' : 'started'} for ${trader?.name}`,
    });
  };

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

  const filteredTraders = traders.filter(trader =>
    trader.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trader.strategy.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <SelectItem value="return1Y">1Y Return</SelectItem>
            <SelectItem value="return3M">3M Return</SelectItem>
            <SelectItem value="return1M">1M Return</SelectItem>
            <SelectItem value="winRate">Win Rate</SelectItem>
            <SelectItem value="followers">Followers</SelectItem>
            <SelectItem value="riskScore">Risk Score</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Traders Grid */}
      <div className="grid gap-4">
        {filteredTraders.map((trader) => (
          <Card key={trader.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Trader Info */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-sm">
                      #{trader.rank}
                    </Badge>
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={trader.avatar} alt={trader.name} />
                      <AvatarFallback>{trader.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{trader.name}</h3>
                      {trader.isVerified && (
                        <Badge variant="secondary" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{trader.strategy}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-muted-foreground">
                        <Users className="h-3 w-3 inline mr-1" />
                        {trader.followers.toLocaleString()} followers
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {trader.copiers.toLocaleString()} copiers
                      </span>
                    </div>
                  </div>
                </div>

                {/* Performance Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">1Y Return</div>
                    <div className={`text-sm font-bold ${trader.return1Y >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {trader.return1Y >= 0 ? '+' : ''}{trader.return1Y.toFixed(1)}%
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Win Rate</div>
                    <div className="text-sm font-bold">{trader.winRate.toFixed(1)}%</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Risk Score</div>
                    <Badge className={`text-xs ${getRiskBadgeColor(trader.riskScore)}`}>
                      {getRiskLabel(trader.riskScore)}
                    </Badge>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Max DD</div>
                    <div className="text-sm font-bold text-red-600">{trader.maxDrawdown.toFixed(1)}%</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedTrader(trader)}>
                        View Profile
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                  
                  <Button
                    variant={trader.isFollowing ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => handleFollow(trader.id)}
                  >
                    {trader.isFollowing ? 'Following' : 'Follow'}
                  </Button>
                  
                  <Button
                    variant={trader.isCopying ? "destructive" : "default"}
                    size="sm"
                    onClick={() => handleCopy(trader.id)}
                  >
                    {trader.isCopying ? 'Stop Copy' : 'Copy'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trader Profile Dialog */}
      {selectedTrader && (
        <TraderProfileDialog
          trader={selectedTrader}
          isOpen={!!selectedTrader}
          onClose={() => setSelectedTrader(null)}
          onFollow={() => handleFollow(selectedTrader.id)}
          onCopy={() => handleCopy(selectedTrader.id)}
        />
      )}
    </div>
  );
};