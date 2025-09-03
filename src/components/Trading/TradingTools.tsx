import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Shield, TrendingUp, BarChart3, Activity } from "lucide-react";
import { PipCalculator } from "./Calculators/PipCalculator";
import { MarginCalculator } from "./Calculators/MarginCalculator";
import { SwapCalculator } from "./Calculators/SwapCalculator";
import { PositionSizeCalculator } from "./RiskManagement/PositionSizeCalculator";
import { StopLossCalculator } from "./RiskManagement/StopLossCalculator";
import { MarketDataPanel } from "./MarketDataPanel";

export const TradingTools = () => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Advanced Trading Tools</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Professional trading calculators and risk management tools to optimize your trading performance
        </p>
      </div>

      <Tabs defaultValue="market-data" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="market-data" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Market Data
          </TabsTrigger>
          <TabsTrigger value="calculators" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Trading Calculators
          </TabsTrigger>
          <TabsTrigger value="risk" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Risk Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="market-data" className="space-y-6">
          <MarketDataPanel />
        </TabsContent>

        <TabsContent value="calculators" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <PipCalculator />
            <MarginCalculator />
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-1 gap-6">
            <SwapCalculator />
          </div>
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-1 gap-6">
            <PositionSizeCalculator />
            <StopLossCalculator />
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Tips Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-500" />
              Pip Calculator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Calculate the monetary value of each pip movement for accurate position sizing and profit/loss calculations.
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Margin Calculator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Determine the required margin for your trades and ensure you have sufficient account balance.
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-500" />
              Risk Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Calculate optimal position sizes and stop loss levels to protect your capital and maximize returns.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};