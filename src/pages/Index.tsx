import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRealTimeMarketData } from '@/hooks/useMarketData';
import { MarketCard } from '@/components/Trading/MarketCard';
import { marketDataService } from '@/services/marketData/index';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  BarChart3, 
  Globe,
  Shield,
  Award,
  Zap,
  Clock,
  ArrowRight,
  Star,
  CheckCircle,
  Play
} from 'lucide-react';
import { HeroSection } from '@/components/Layout/HeroSection';

import { platformConfig } from '@/config/platform';

// Use only supported symbols from platform config
const POPULAR_PAIRS = ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD', 'US500', 'USOIL'];
const SUPPORTED_SYMBOLS = platformConfig.trading.supportedPairs.map(pair => pair.symbol);

const Index = () => {
  const { data: marketData, isLoading } = useRealTimeMarketData(POPULAR_PAIRS.filter(symbol => SUPPORTED_SYMBOLS.includes(symbol)));

  const platformStats = [
    { label: 'Active Traders', value: '2,000,000+', icon: Users, trend: '+12%', color: 'text-blue-600' },
    { label: 'Daily Volume', value: '$2.5B', icon: BarChart3, trend: '+8%', color: 'text-green-600' },
    { label: 'Trading Pairs', value: '1,000+', icon: Globe, trend: 'stable', color: 'text-purple-600' },
    { label: 'Avg. Spread', value: '0.0 pips', icon: TrendingDown, trend: '-15%', color: 'text-orange-600' },
  ];

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast Execution',
      description: 'Execute trades in milliseconds with our cutting-edge technology and tier-1 liquidity providers.',
      highlight: '< 0.1s execution'
    },
    {
      icon: Shield,
      title: 'Regulated & Secure',
      description: 'Trade with confidence. Regulated by top-tier financial authorities with segregated client funds.',
      highlight: 'Tier 1 Licensed'
    },
    {
      icon: DollarSign,
      title: 'Ultra-Low Spreads',
      description: 'Maximize your profits with spreads starting from 0.0 pips on major currency pairs.',
      highlight: 'From 0.0 pips'
    },
    {
      icon: Clock,
      title: '24/7 Trading',
      description: 'Never miss an opportunity. Trade forex, indices, and commodities around the clock.',
      highlight: 'Always Open'
    },
    {
      icon: BarChart3,
      title: 'Advanced Tools',
      description: 'Professional trading tools, real-time charts, and technical analysis for informed decisions.',
      highlight: '100+ Indicators'
    },
    {
      icon: Award,
      title: 'Award Winning',
      description: 'Recognized globally for excellence in trading technology and customer service.',
      highlight: 'Best Platform 2024'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Professional Trader',
      comment: 'The execution speed and spreads are unmatched. This platform has significantly improved my trading performance.',
      rating: 5,
      avatar: '👩‍💼'
    },
    {
      name: 'Michael Chen',
      role: 'Investment Manager',
      comment: 'Excellent platform with professional-grade tools. The customer support is exceptional.',
      rating: 5,
      avatar: '👨‍💻'
    },
    {
      name: 'Emma Rodriguez',
      role: 'Day Trader',
      comment: 'Finally found a broker that understands traders\' needs. Great spreads and reliable platform.',
      rating: 5,
      avatar: '👩‍🔬'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      
      {/* Live Market Overview Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Badge variant="outline" className="text-primary border-primary/20">
                Live Market Data
              </Badge>
              {marketDataService.isUsingMT5Data() && (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  MT5 Connected
                </Badge>
              )}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Real-Time Market Prices</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Trade the world's most popular instruments with competitive spreads and lightning-fast execution
            </p>
          </div>

          {/* Forex Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-center">Popular Forex Pairs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                Array(6).fill(0).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-20 bg-muted rounded"></div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                marketData?.map((price) => (
                  <MarketCard 
                    key={price.symbol}
                    symbol={price.symbol}
                    name={price.name}
                    price={price.price.toFixed(price.symbol.includes('JPY') ? 3 : 5)}
                    change={price.change.toFixed(price.symbol.includes('JPY') ? 3 : 5)}
                    changePercent={`${price.changePercent.toFixed(2)}%`}
                    isPositive={price.change >= 0}
                    onClick={() => {}}
                  />
                ))
              )}
            </div>
          </div>

          {/* Remove crypto section entirely since it's not supported */}

          <div className="text-center">
            <Button asChild size="lg" className="shadow-lg">
              <Link to="/trading">
                Start Trading Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Platform Statistics */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Platform Statistics</h2>
            <p className="text-muted-foreground text-lg">Trusted by millions of traders worldwide</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {platformStats.map((stat, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-background to-muted/20">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-center mb-4">
                    <div className={`p-3 rounded-full bg-primary/10`}>
                      <stat.icon className={`h-8 w-8 ${stat.color}`} />
                    </div>
                  </div>
                  <CardTitle className="text-3xl font-bold">{stat.value}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{stat.label}</p>
                  <Badge 
                    variant={stat.trend.startsWith('+') ? 'default' : stat.trend.startsWith('-') ? 'secondary' : 'outline'}
                    className="text-xs"
                  >
                    {stat.trend.startsWith('+') && <TrendingUp className="h-3 w-3 mr-1" />}
                    {stat.trend.startsWith('-') && <TrendingDown className="h-3 w-3 mr-1" />}
                    {stat.trend}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 text-primary border-primary/20">
              Why Choose Us
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Professional Trading Made Simple</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto text-lg">
              Experience institutional-grade trading technology with retail-friendly accessibility
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-background to-muted/10">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="h-8 w-8 text-primary" />
                    </div>
                    <Badge variant="secondary" className="text-xs font-medium">
                      {feature.highlight}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Traders Say</h2>
            <p className="text-muted-foreground text-lg">Join thousands of satisfied traders worldwide</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground italic leading-relaxed">
                    "{testimonial.comment}"
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{testimonial.avatar}</div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Start Trading?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join millions of traders who trust Aone Prime FX for their trading success. 
            Open your account today and experience the difference.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="text-lg px-8 py-6 shadow-xl">
              <Link to="/signup">
                Open Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
              <Link to="/trading">
                <Play className="mr-2 h-5 w-5" />
                Try Demo
              </Link>
            </Button>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>No minimum deposit</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Free demo account</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>24/7 support</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
