import { MobileHeader } from "@/components/Layout/MobileHeader";
import { XMBottomNav } from "@/components/Layout/XMBottomNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AccountSwitcher from "@/components/Account/AccountSwitcher";
import ConsolidatedReporting from "@/components/Account/ConsolidatedReporting";
import { 
  CreditCard, 
  BarChart3, 
  Settings,
  Users
} from "lucide-react";

const MultiAccount = () => {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 safe-area-bottom">
      <MobileHeader title="Multi-Account Management" />
      
      <div className="p-3 md:p-6 max-w-7xl mx-auto">
        <Tabs defaultValue="accounts" className="space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-12 md:h-10">
            <TabsTrigger value="accounts" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
              <CreditCard className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden xs:inline">Accounts</span>
            </TabsTrigger>
            <TabsTrigger value="reporting" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
              <BarChart3 className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden xs:inline">Reports</span>
            </TabsTrigger>
            <TabsTrigger value="management" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
              <Settings className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden xs:inline">Management</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="accounts" className="space-y-4 md:space-y-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-2">Trading Accounts</h2>
              <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">
                Manage and switch between your trading accounts
              </p>
              <AccountSwitcher />
            </div>
          </TabsContent>

          <TabsContent value="reporting" className="space-y-4 md:space-y-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-2">Consolidated Reporting</h2>
              <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">
                View combined performance across all your accounts
              </p>
              <ConsolidatedReporting />
            </div>
          </TabsContent>

          <TabsContent value="management" className="space-y-4 md:space-y-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-2">Account Management</h2>
              <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">
                Configure account settings and preferences
              </p>
              {/* Account management features */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold">Account Preferences</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Set default settings for new accounts
                    </p>
                    <div className="text-center py-6 text-muted-foreground text-sm">
                      Feature in development
                    </div>
                  </div>
                  
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-secondary/10 rounded-lg">
                        <Settings className="h-5 w-5 text-secondary" />
                      </div>
                      <h3 className="font-semibold">Risk Management</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Configure risk limits across accounts
                    </p>
                    <div className="text-center py-6 text-muted-foreground text-sm">
                      Feature in development
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <XMBottomNav />
    </div>
  );
};

export default MultiAccount;