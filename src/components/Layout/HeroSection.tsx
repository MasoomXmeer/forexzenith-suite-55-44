
import { ArrowRight, Shield, TrendingUp, Users, Award, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { XMButton } from "@/components/UI/XMButton";
import { XMCard } from "@/components/UI/XMCard";
import { NavLink } from "react-router-dom";
import { useRealTimeMarketData } from "@/hooks/useMarketData";
import { Badge } from "@/components/ui/badge";
import { marketDataService } from "@/services/marketData";
import { MarketStatus } from "@/components/Trading/MarketStatus";

export const HeroSection = () => {
  const majorPairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'XAUUSD'];
  const { data: marketData, isLoading } = useRealTimeMarketData(majorPairs);

  const stats = [
    { icon: Users, label: "Trusted by", value: "2M+", subtitle: "Active Traders" },
    { icon: TrendingUp, label: "Access to", value: "1,000+", subtitle: "Trading Instruments" },
    { icon: Shield, label: "Regulated", value: "Tier 1", subtitle: "Global Licenses" },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-white">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#E31E24]/10 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#1A1A1A]/5 to-transparent rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 py-12 lg:py-20 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Trust Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#E31E24]/10 to-[#B71C1C]/10 border border-[#E31E24]/20 rounded-full text-sm text-[#E31E24] font-medium">
              <Award className="h-4 w-4 mr-2" />
              Award-Winning Trading Platform
            </div>

            {/* Main Headline */}
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight text-gray-900">
                Trade Forex Like a{" "}
                <span className="bg-gradient-to-r from-[#E31E24] to-[#B71C1C] bg-clip-text text-transparent">
                  Professional
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Experience ultra-low spreads from 0.0 pips, lightning-fast execution, and access to 1,000+ trading instruments on our award-winning platform.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <NavLink to="/signup">
                <XMButton size="lg" className="text-lg px-8 py-4 shadow-xl">
                  Start Trading Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </XMButton>
              </NavLink>
              <NavLink to="/trading">
                <XMButton variant="outline" size="lg" className="text-lg px-8 py-4">
                  Try Demo Account
                </XMButton>
              </NavLink>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-2 gap-4 pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-[#E31E24] to-[#B71C1C] rounded-full flex items-center justify-center">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Regulated</div>
                  <div className="text-sm text-gray-600">Tier 1 Licenses</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-[#E31E24] to-[#B71C1C] rounded-full flex items-center justify-center">
                  <Globe className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Global</div>
                  <div className="text-sm text-gray-600">24/7 Support</div>
                </div>
              </div>
            </div>

            {/* Risk Warning */}
            <p className="text-sm text-gray-500 pt-4 border-t border-gray-200">
              <strong>Risk Warning:</strong> CFDs are complex instruments and come with a high risk of losing money rapidly due to leverage. You should consider whether you understand how CFDs work and whether you can afford to take the high risk of losing your money.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start mb-2">
                    <stat.icon className="h-5 w-5 text-[#E31E24] mr-2" />
                    <span className="text-sm text-gray-600">{stat.label}</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.subtitle}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Live Market Data */}
          <div className="space-y-6">
            <div className="text-center lg:text-left">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl font-bold text-gray-900">Live Market Prices</h3>
                <MarketStatus />
              </div>
              <p className="text-gray-600">Real-time pricing on major trading instruments</p>
            </div>

            <div className="space-y-3">
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, index) => (
                  <XMCard key={index} className="animate-pulse">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                        <div>
                          <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-24"></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-12"></div>
                      </div>
                    </div>
                  </XMCard>
                ))
              ) : (
                marketData?.map((instrument, index) => (
                  <XMCard key={index} hover className="group cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-[#E31E24] to-[#B71C1C] rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {instrument.symbol.slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 group-hover:text-[#E31E24] transition-colors">
                            {instrument.symbol}
                          </div>
                          <div className="text-sm text-gray-600">
                            {instrument.category}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          {instrument.price.toFixed(instrument.symbol.includes('JPY') ? 3 : 5)}
                        </div>
                        <div className="flex items-center space-x-1">
                          <Badge 
                            variant={instrument.changePercent >= 0 ? "default" : "secondary"}
                            className={`text-xs font-medium ${
                              instrument.changePercent >= 0 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {instrument.changePercent >= 0 ? '+' : ''}
                            {instrument.changePercent.toFixed(2)}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </XMCard>
                ))
              )}
            </div>

            {/* View All Markets Link */}
            <div className="text-center pt-4">
              <NavLink to="/trading">
                <Button variant="ghost" className="text-[#E31E24] hover:text-[#B71C1C] font-medium">
                  View All Markets
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
