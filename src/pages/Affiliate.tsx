import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Share2, 
  Copy, 
  Users, 
  DollarSign, 
  TrendingUp,
  Gift
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext.minimal";
import { toast } from "@/hooks/use-toast";

const Affiliate = () => {
  const { user, profile } = useAuth();
  const [referralCode, setReferralCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [affiliateStats, setAffiliateStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    totalEarnings: 0,
    thisMonthEarnings: 0,
    pendingPayouts: 0
  });
  const [recentReferrals, setRecentReferrals] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && profile) {
      initializeAffiliate();
      fetchAffiliateData();
    }
  }, [user, profile]);

  const initializeAffiliate = async () => {
    if (!user || !profile) return;

    try {
      // Generate referral code if user doesn't have one
      if (!profile.referral_code) {
        const code = `XM-${user.id.slice(0, 8).toUpperCase()}`;
        
        const { error } = await supabase
          .from('profiles')
          .update({ 
            referral_code: code,
            is_affiliate: true 
          })
          .eq('id', user.id);

        if (error) throw error;
        setReferralCode(code);
      } else {
        setReferralCode(profile.referral_code);
      }
    } catch (error: any) {
      console.error('Error initializing affiliate:', error);
    }
  };

  const fetchAffiliateData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Fetch referrals
      const { data: referrals, error: referralsError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, created_at, balance')
        .eq('referred_by', user.id);

      if (referralsError) throw referralsError;

      // Fetch commissions
      const { data: commissionsData, error: commissionsError } = await supabase
        .from('affiliate_commissions')
        .select('*')
        .eq('affiliate_id', user.id);

      if (commissionsError) throw commissionsError;

      // Fetch payouts
      const { data: payoutsData, error: payoutsError } = await supabase
        .from('affiliate_payouts')
        .select('*')
        .eq('affiliate_id', user.id);

      if (payoutsError) throw payoutsError;

      // Calculate stats
      const totalEarnings = commissionsData?.reduce((sum, comm) => sum + comm.amount, 0) || 0;
      const thisMonth = new Date();
      const firstDayOfMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
      
      const thisMonthEarnings = commissionsData?.filter(comm => 
        new Date(comm.created_at) >= firstDayOfMonth
      ).reduce((sum, comm) => sum + comm.amount, 0) || 0;

      const activeReferrals = referrals?.filter(ref => ref.balance > 0).length || 0;
      const pendingPayouts = payoutsData?.filter(payout => payout.status === 'pending')
        .reduce((sum, payout) => sum + payout.amount, 0) || 0;

      setAffiliateStats({
        totalReferrals: referrals?.length || 0,
        activeReferrals,
        totalEarnings,
        thisMonthEarnings,
        pendingPayouts
      });

      // Format recent referrals
      const formattedReferrals = referrals?.slice(0, 5).map(ref => ({
        id: ref.id,
        name: `${ref.first_name || 'User'} ${ref.last_name || ''}`.trim(),
        date: new Date(ref.created_at).toLocaleDateString(),
        status: ref.balance > 0 ? 'active' : 'pending',
        earnings: commissionsData?.filter(comm => comm.referred_user_id === ref.id)
          .reduce((sum, comm) => sum + comm.amount, 0).toFixed(2) || '0.00'
      })) || [];

      setRecentReferrals(formattedReferrals);
      setCommissions(commissionsData || []);
      setPayouts(payoutsData || []);

    } catch (error: any) {
      console.error('Error fetching affiliate data:', error);
      toast({
        title: "Error",
        description: "Failed to load affiliate data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyReferralCode = () => {
    const referralLink = `${window.location.origin}/signup?ref=${referralCode}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard"
    });
  };

  const requestPayout = async (amount: string) => {
    if (!user || !amount) return;

    try {
      const payoutAmount = parseFloat(amount);
      
      if (payoutAmount < 100) {
        toast({
          title: "Minimum Payout",
          description: "Minimum payout amount is $100",
          variant: "destructive"
        });
        return;
      }

      if (payoutAmount > affiliateStats.totalEarnings) {
        toast({
          title: "Insufficient Balance",
          description: "Payout amount exceeds available balance",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('affiliate_payouts')
        .insert([{
          affiliate_id: user.id,
          amount: payoutAmount,
          status: 'pending'
        }]);

      if (error) throw error;

      toast({
        title: "Payout Requested",
        description: `Payout request for $${payoutAmount} submitted successfully`
      });

      fetchAffiliateData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-16 pb-20 md:pt-20 md:pb-8">
        <div className="container mx-auto p-4 text-center">Loading affiliate data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16 pb-20 md:pt-20 md:pb-8">
      
      <div className="container mx-auto p-4 space-y-6">
        {/* Referral Code */}
        <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary rounded-full mx-auto flex items-center justify-center">
              <Share2 className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">Your Referral Code</h2>
              <div className="bg-background rounded-lg p-3 border border-border">
                <p className="font-mono text-lg font-semibold text-foreground">{referralCode}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={copyReferralCode} className="flex-1">
                <Copy className="h-4 w-4 mr-2" />
                {copied ? "Copied!" : "Copy Link"}
              </Button>
              <Button variant="outline" className="flex-1">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{affiliateStats.totalReferrals}</p>
                <p className="text-sm text-muted-foreground">Total Referrals</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{affiliateStats.activeReferrals}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">${affiliateStats.totalEarnings.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-danger/10 rounded-lg">
                <Gift className="h-5 w-5 text-danger" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">${affiliateStats.thisMonthEarnings.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">This Month</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Commission Structure */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Commission Structure</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Per Referred User (Active)</span>
              <Badge variant="default">$50</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Revenue Share</span>
              <Badge variant="default">10%</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Minimum Payout</span>
              <Badge variant="default">$100</Badge>
            </div>
          </div>
        </Card>

        {/* Recent Referrals */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Referrals</h3>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          <div className="space-y-3">
            {recentReferrals.map((referral) => (
              <div key={referral.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="text-sm">
                      {referral.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{referral.name}</p>
                    <p className="text-xs text-muted-foreground">{referral.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={referral.status === "active" ? "default" : "secondary"} className="mb-1">
                    {referral.status}
                  </Badge>
                  <p className="text-sm font-semibold">${referral.earnings}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Payout Request */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Request Payout</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Available Balance:</span>
              <span className="text-lg font-bold text-foreground">${affiliateStats.totalEarnings.toFixed(2)}</span>
            </div>
            <Input 
              placeholder="Enter amount to withdraw" 
              type="number" 
              min="100"
              id="payoutAmount"
            />
            <Button 
              className="w-full"
              onClick={() => {
                const input = document.getElementById('payoutAmount') as HTMLInputElement;
                if (input?.value) {
                  requestPayout(input.value);
                  input.value = '';
                }
              }}
            >
              Request Payout
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Affiliate;