import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, MessageCircle, Share2, TrendingUp, TrendingDown, BarChart3, Eye, Filter } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SocialPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRank: number;
  isVerified: boolean;
  timestamp: string;
  content: string;
  type: 'market_insight' | 'trade_idea' | 'educational' | 'milestone';
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  tradeData?: {
    symbol: string;
    direction: 'buy' | 'sell';
    entry: number;
    target?: number;
    stopLoss?: number;
    confidence: number;
  };
  marketData?: {
    symbol: string;
    analysis: string;
    timeframe: string;
  };
}

const mockPosts: SocialPost[] = [
  {
    id: '1',
    authorId: '1',
    authorName: 'Alex Thompson',
    authorAvatar: '/avatars/alex.jpg',
    authorRank: 1,
    isVerified: true,
    timestamp: '2024-01-05T10:30:00Z',
    content: 'EURUSD showing strong bullish momentum after breaking key resistance at 1.1050. Looking for a move towards 1.1120 with tight stop at 1.1020. Fed dovish stance supporting EUR strength.',
    type: 'trade_idea',
    likes: 124,
    comments: 18,
    shares: 7,
    isLiked: false,
    tradeData: {
      symbol: 'EURUSD',
      direction: 'buy',
      entry: 1.1055,
      target: 1.1120,
      stopLoss: 1.1020,
      confidence: 85,
    },
  },
  {
    id: '2',
    authorId: '2',
    authorName: 'Sarah Chen',
    authorAvatar: '/avatars/sarah.jpg',
    authorRank: 2,
    isVerified: true,
    timestamp: '2024-01-05T09:15:00Z',
    content: 'Gold continues to show strength as inflation concerns persist. Key level to watch is $2,050 resistance. If we break above, next target is $2,080. Risk management is crucial in current volatility.',
    type: 'market_insight',
    likes: 89,
    comments: 12,
    shares: 4,
    isLiked: true,
    marketData: {
      symbol: 'XAUUSD',
      analysis: 'Bullish breakout above resistance',
      timeframe: '4H',
    },
  },
  {
    id: '3',
    authorId: '3',
    authorName: 'Mike Rodriguez',
    authorAvatar: '/avatars/mike.jpg',
    authorRank: 3,
    isVerified: false,
    timestamp: '2024-01-05T08:45:00Z',
    content: 'Just hit 100 consecutive profitable trades! 🎉 Key lessons learned: 1) Stick to your strategy 2) Risk management is everything 3) Patience pays off. Thanks to everyone following my journey!',
    type: 'milestone',
    likes: 256,
    comments: 43,
    shares: 21,
    isLiked: true,
  },
  {
    id: '4',
    authorId: '4',
    authorName: 'Emma Wilson',
    authorAvatar: '/avatars/emma.jpg',
    authorRank: 4,
    isVerified: true,
    timestamp: '2024-01-05T07:20:00Z',
    content: 'Educational tip: When trading news events, always check the economic calendar and understand the potential impact. High-impact news can cause significant volatility. Use proper position sizing!',
    type: 'educational',
    likes: 67,
    comments: 8,
    shares: 15,
    isLiked: false,
  },
];

export const SocialFeed: React.FC = () => {
  const [posts, setPosts] = useState<SocialPost[]>(mockPosts);
  const [filter, setFilter] = useState<string>('all');
  const [newPost, setNewPost] = useState('');

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ));
  };

  const handleShare = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    setPosts(prev => prev.map(p => 
      p.id === postId 
        ? { ...p, shares: p.shares + 1 }
        : p
    ));
    
    toast({
      title: "Post Shared",
      description: `Shared ${post?.authorName}'s post with your followers`,
    });
  };

  const handlePostSubmit = () => {
    if (!newPost.trim()) return;
    
    const post: SocialPost = {
      id: Date.now().toString(),
      authorId: 'current-user',
      authorName: 'You',
      authorAvatar: '/avatars/user.jpg',
      authorRank: 0,
      isVerified: false,
      timestamp: new Date().toISOString(),
      content: newPost,
      type: 'market_insight',
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
    };
    
    setPosts(prev => [post, ...prev]);
    setNewPost('');
    
    toast({
      title: "Post Published",
      description: "Your post has been shared with the community",
    });
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'trade_idea':
        return <TrendingUp className="h-4 w-4" />;
      case 'market_insight':
        return <BarChart3 className="h-4 w-4" />;
      case 'educational':
        return <Eye className="h-4 w-4" />;
      case 'milestone':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getPostTypeBadge = (type: string) => {
    const typeLabels = {
      'trade_idea': 'Trade Idea',
      'market_insight': 'Market Insight',
      'educational': 'Educational',
      'milestone': 'Milestone',
    };
    return typeLabels[type as keyof typeof typeLabels] || type;
  };

  const filteredPosts = filter === 'all' 
    ? posts 
    : posts.filter(post => post.type === filter);

  return (
    <div className="space-y-6">
      {/* Post Composer */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Share Your Insights</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Share your market insights, trade ideas, or educational content..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex justify-between items-center">
            <Select defaultValue="market_insight">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Post type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="market_insight">Market Insight</SelectItem>
                <SelectItem value="trade_idea">Trade Idea</SelectItem>
                <SelectItem value="educational">Educational</SelectItem>
                <SelectItem value="milestone">Milestone</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handlePostSubmit} disabled={!newPost.trim()}>
              Publish Post
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filter:</span>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All posts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Posts</SelectItem>
            <SelectItem value="trade_idea">Trade Ideas</SelectItem>
            <SelectItem value="market_insight">Market Insights</SelectItem>
            <SelectItem value="educational">Educational</SelectItem>
            <SelectItem value="milestone">Milestones</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Social Feed */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              {/* Post Header */}
              <div className="flex items-start gap-3 mb-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={post.authorAvatar} alt={post.authorName} />
                  <AvatarFallback>{post.authorName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold">{post.authorName}</h4>
                    {post.authorRank > 0 && (
                      <Badge variant="outline" className="text-xs">
                        #{post.authorRank}
                      </Badge>
                    )}
                    {post.isVerified && (
                      <Badge variant="secondary" className="text-xs">
                        Verified
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {getPostTypeIcon(post.type)}
                      <span className="ml-1">{getPostTypeBadge(post.type)}</span>
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(post.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Post Content */}
              <div className="mb-4">
                <p className="text-sm leading-relaxed">{post.content}</p>
                
                {/* Trade Data */}
                {post.tradeData && (
                  <div className="mt-3 p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={post.tradeData.direction === 'buy' ? 'default' : 'destructive'}>
                          {post.tradeData.direction.toUpperCase()} {post.tradeData.symbol}
                        </Badge>
                        <span className="text-sm">Confidence: {post.tradeData.confidence}%</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Entry:</span>
                        <span className="ml-1 font-medium">{post.tradeData.entry}</span>
                      </div>
                      {post.tradeData.target && (
                        <div>
                          <span className="text-muted-foreground">Target:</span>
                          <span className="ml-1 font-medium text-green-600">{post.tradeData.target}</span>
                        </div>
                      )}
                      {post.tradeData.stopLoss && (
                        <div>
                          <span className="text-muted-foreground">Stop:</span>
                          <span className="ml-1 font-medium text-red-600">{post.tradeData.stopLoss}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Market Data */}
                {post.marketData && (
                  <div className="mt-3 p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{post.marketData.symbol}</Badge>
                      <span className="text-xs text-muted-foreground">{post.marketData.timeframe}</span>
                    </div>
                    <p className="text-xs mt-1">{post.marketData.analysis}</p>
                  </div>
                )}
              </div>

              {/* Post Actions */}
              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(post.id)}
                    className={post.isLiked ? 'text-red-500' : ''}
                  >
                    <Heart className={`h-4 w-4 mr-1 ${post.isLiked ? 'fill-current' : ''}`} />
                    {post.likes}
                  </Button>
                  
                  <Button variant="ghost" size="sm">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    {post.comments}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare(post.id)}
                  >
                    <Share2 className="h-4 w-4 mr-1" />
                    {post.shares}
                  </Button>
                </div>
                
                <Button variant="outline" size="sm">
                  Follow Trade
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};