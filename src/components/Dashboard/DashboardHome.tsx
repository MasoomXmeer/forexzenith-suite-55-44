import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Star, Gift, GraduationCap, Users, ChevronRight, TrendingUp, TrendingDown } from "lucide-react";
import { MobileHeader } from "@/components/Layout/MobileHeader";
import { XMBottomNav } from "@/components/Layout/XMBottomNav";
import { useRealTimeMarketData } from "@/hooks/useMarketData";
import { MarketCard } from "@/components/Trading/MarketCard";
import { LiveMarketWidget } from "@/components/Trading/LiveMarketWidget";

export const DashboardHome = () => {
  const majorPairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD', 'US500'];
  const { data: marketData, isLoading } = useRealTimeMarketData(majorPairs);
  return (
    <div className="min-h-screen bg-background">
      <MobileHeader title="" />
      
      <div className="p-4 space-y-6">
        {/* Welcome Banner */}
        <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <img 
                src="/placeholder.svg" 
                alt="Profile" 
                className="w-12 h-12 rounded-full bg-primary/30"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Get Unlimited Cashback</h2>
              <p className="text-sm text-muted-foreground">Join Now</p>
              <Button size="sm" className="mt-2 bg-primary text-primary-foreground">
                Join Now →
              </Button>
            </div>
          </div>
        </Card>

        {/* Accounts Overview */}
        <Card className="p-4 border-border bg-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Accounts Overview</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <div className="text-sm text-muted-foreground">MT5</div>
                <div className="text-sm text-muted-foreground">Demo</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Balance</div>
                <div className="text-sm text-muted-foreground">$10,000</div>
              </div>
              <Button variant="ghost" size="icon">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="mt-4 p-4 bg-card border border-border rounded-lg">
            <div className="text-center mb-2">
              <div className="text-sm text-muted-foreground">Total balance</div>
              <div className="text-2xl font-bold text-foreground">$0.00</div>
            </div>
            <div className="flex justify-around">
              <Button size="sm" className="flex-1 mr-2 bg-green-600 hover:bg-green-700">
                Deposit
              </Button>
              <Button size="sm" variant="outline" className="flex-1 ml-2 border-border">
                Withdraw
              </Button>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full mt-2 text-primary hover:text-primary/80"
            >
              📈 Open MT5
            </Button>
          </div>
        </Card>

        {/* Available Promos & Deposit Bonuses */}
        <Card className="p-4 border-border bg-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Available Promos & Deposit Bonuses</h3>
            <Badge className="bg-green-600 text-white">New</Badge>
          </div>
          
          <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Gift className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <div className="font-medium text-foreground">20% bonus</div>
                <div className="text-sm text-muted-foreground">$30,000 trading bonus</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Receive a 20% trading bonus with our standard promotion. Enrich your trading with UNLIMITED BONUS, BONUS ON BONUS as long as you wish and BONUS EVERY DAY.
            </p>
            <Button size="sm" className="bg-primary text-primary-foreground">
              Claim bonus
            </Button>
          </div>
        </Card>

        {/* Get Friends & Earn $50 */}
        <Card className="p-4 border-border bg-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <img 
                src="/placeholder.svg" 
                alt="Referral" 
                className="w-12 h-12 rounded-full bg-blue-300"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Get Friends? Earn $50 for Each Refer Bonus!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Invite friends to our services and get reward bonuses with every referral. The more you refer, the more you earn!
              </p>
            </div>
          </div>
          <Button size="sm" className="bg-primary text-primary-foreground">
            Get reference
          </Button>
        </Card>

        {/* Live Market Prices */}
        <LiveMarketWidget symbols={majorPairs} />

        {/* Suggested for you */}
        <Card className="p-4 border-border bg-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Suggested for you!</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-foreground">Free Trading Education</h4>
                <p className="text-sm text-muted-foreground">
                  Gain insights from the financial markets and put your trading expertise and In-person events for all traders of all levels
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full border-border">
              Join seminars
            </Button>
          </div>
        </Card>

        {/* Bottom notice */}
        <div className="text-center p-4">
          <p className="text-xs text-muted-foreground">
            Your balance is at risk. Leveraged products may not be suitable for everyone.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Please see our{" "}
            <span className="text-primary underline">Risk Disclosure</span>
          </p>
        </div>
      </div>
      
      <XMBottomNav />
    </div>
  );
};