import { useState } from "react";
import { ArrowLeft, ArrowUpDown, ChevronLeft, ChevronRight, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MobileHeader } from "@/components/Layout/MobileHeader";

const paymentMethods = [
  {
    id: "crypto",
    name: "Cryptocurrencies",
    icon: "₿",
    color: "bg-blue-600",
    available: true
  },
  {
    id: "binance",
    name: "Binance Pay",
    icon: "🔶",
    color: "bg-yellow-500",
    available: true
  },
  {
    id: "neteller",
    name: "Neteller",
    icon: "N",
    color: "bg-green-600",
    available: true
  },
  {
    id: "skrill",
    name: "Skrill",
    icon: "S",
    color: "bg-purple-600",
    available: true
  },
  {
    id: "bank",
    name: "Online Bank Transfer",
    icon: "🏦",
    color: "bg-blue-500",
    available: true
  },
  {
    id: "jeton",
    name: "Jeton",
    icon: "J",
    color: "bg-gray-600",
    available: false
  },
  {
    id: "astropay",
    name: "AstroPay",
    icon: "A",
    color: "bg-orange-500",
    available: false
  }
];

import { XMBottomNav } from "@/components/Layout/XMBottomNav";

export default function Funding() {
  const [activeTab, setActiveTab] = useState<"deposits" | "withdrawals" | "internal">("deposits");
  const [currentMethodIndex, setCurrentMethodIndex] = useState(0);

  const nextMethod = () => {
    setCurrentMethodIndex((prev) => (prev + 1) % paymentMethods.length);
  };

  const prevMethod = () => {
    setCurrentMethodIndex((prev) => (prev - 1 + paymentMethods.length) % paymentMethods.length);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <MobileHeader title="" />
      
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3 mb-4">
          <ArrowUpDown className="h-6 w-6 text-foreground" />
          <h1 className="text-2xl font-bold text-foreground">Funding</h1>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-1">
          <Button
            variant={activeTab === "deposits" ? "default" : "ghost"}
            className={`flex-1 rounded-lg ${activeTab === "deposits" 
              ? "bg-primary text-primary-foreground" 
              : "bg-transparent border border-border text-muted-foreground"
            }`}
            onClick={() => setActiveTab("deposits")}
          >
            Deposits
          </Button>
          <Button
            variant={activeTab === "withdrawals" ? "default" : "ghost"}
            className={`flex-1 rounded-lg ${activeTab === "withdrawals" 
              ? "bg-primary text-primary-foreground" 
              : "bg-transparent text-muted-foreground"
            }`}
            onClick={() => setActiveTab("withdrawals")}
          >
            Withdrawals
          </Button>
          <Button
            variant={activeTab === "internal" ? "default" : "ghost"}
            className={`flex-1 rounded-lg ${activeTab === "internal" 
              ? "bg-primary text-primary-foreground" 
              : "bg-transparent text-muted-foreground"
            }`}
            onClick={() => setActiveTab("internal")}
          >
            Internal Transfer
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {activeTab === "deposits" && (
          <>
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Deposit Methods</h2>
              
              {/* Carousel for Payment Methods */}
              <div className="relative">
                <Card className="bg-card border-border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-full bg-muted"
                      onClick={prevMethod}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    
                    <div className="flex flex-col items-center">
                      <div className={`w-16 h-16 rounded-full ${paymentMethods[currentMethodIndex].color} flex items-center justify-center text-white text-2xl font-bold mb-2`}>
                        {paymentMethods[currentMethodIndex].icon}
                      </div>
                      <h3 className="text-lg font-medium text-foreground">
                        {paymentMethods[currentMethodIndex].name}
                      </h3>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-full bg-muted"
                      onClick={nextMethod}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                </Card>
              </div>

              {/* Payment Method Cards */}
              <div className="space-y-3 mt-6">
                {paymentMethods.map((method) => (
                  <Card 
                    key={method.id}
                    className={`p-4 border-border ${method.available ? 'bg-card' : 'bg-muted/30'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg ${method.color} flex items-center justify-center text-white font-bold`}>
                          {method.icon}
                        </div>
                        <div>
                          <h3 className={`font-medium ${method.available ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {method.name}
                          </h3>
                          {!method.available && (
                            <p className="text-sm text-muted-foreground">
                              A deposit is required before you can use this method to withdraw your funds.
                            </p>
                          )}
                        </div>
                      </div>
                      {method.available && (
                        <Button variant="ghost" size="icon">
                          <HelpCircle className="h-5 w-5 text-primary" />
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === "withdrawals" && (
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Withdrawal Methods</h2>
            
            {/* Note */}
            <Card className="p-4 mb-6 bg-blue-600/10 border-blue-600/20">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm">ℹ</span>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-2">Please note the following:</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• We strongly suggest that you submit withdrawal requests after closing your positions.</li>
                    <li>• Please note that XM does accept withdrawal requests for trading accounts with open positions; however, to ensure withdrawal processing, accounts should maintain a safe level of margin.</li>
                    <li>• A request which would cause the margin level to fall below 400% will not be rejected.</li>
                    <li>• Please note that any withdrawal of funds from your trading account will result in the reduction of your trading bonus amount (if applicable).</li>
                  </ul>
                </div>
              </div>
            </Card>

            <div className="space-y-3">
              {paymentMethods.slice(0, 4).map((method) => (
                <Card key={method.id} className="p-4 border-border bg-card">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg ${method.color} flex items-center justify-center text-white font-bold`}>
                      {method.icon}
                    </div>
                    <h3 className="font-medium text-foreground">{method.name}</h3>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <XMBottomNav />
    </div>
  );
}