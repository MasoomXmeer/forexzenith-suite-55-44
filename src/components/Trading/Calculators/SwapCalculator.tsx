import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Clock } from "lucide-react";
import { platformConfig } from "@/config/platform";
import { formatCurrency } from "@/utils/trading";

export const SwapCalculator = () => {
  const [symbol, setSymbol] = useState("");
  const [lotSize, setLotSize] = useState("");
  const [position, setPosition] = useState<"buy" | "sell">("buy");
  const [days, setDays] = useState("1");
  const [swapResult, setSwapResult] = useState<{
    dailySwap: number;
    totalSwap: number;
    swapType: "credit" | "debit";
  } | null>(null);

  const calculateSwap = () => {
    if (!symbol || !lotSize) return;

    const pair = platformConfig.trading.supportedPairs.find(p => p.symbol === symbol);
    if (!pair) return;

    const lots = parseFloat(lotSize);
    const numDays = parseInt(days);
    if (isNaN(lots) || isNaN(numDays)) return;

    // Simplified swap calculation - in real implementation would use actual swap rates
    // Swap rates vary by broker and are typically in points per lot
    const baseSwapLong = -2.5; // Points for long position
    const baseSwapShort = 0.8; // Points for short position
    
    const swapRate = position === "buy" ? baseSwapLong : baseSwapShort;
    const dailySwap = (swapRate * lots);
    const totalSwap = dailySwap * numDays;
    
    setSwapResult({
      dailySwap,
      totalSwap,
      swapType: totalSwap >= 0 ? "credit" : "debit"
    });
  };

  const reset = () => {
    setSymbol("");
    setLotSize("");
    setPosition("buy");
    setDays("1");
    setSwapResult(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Swap Calculator
        </CardTitle>
        <CardDescription>
          Calculate overnight swap fees for your position
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="swap-symbol">Trading Pair</Label>
            <Select value={symbol} onValueChange={setSymbol}>
              <SelectTrigger>
                <SelectValue placeholder="Select a pair" />
              </SelectTrigger>
              <SelectContent>
                {platformConfig.trading.supportedPairs.map((pair) => (
                  <SelectItem key={pair.symbol} value={pair.symbol}>
                    {pair.symbol} - {pair.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="swap-lot-size">Lot Size</Label>
            <Input
              id="swap-lot-size"
              type="number"
              step="0.01"
              min="0.01"
              value={lotSize}
              onChange={(e) => setLotSize(e.target.value)}
              placeholder="e.g. 1.00"
            />
          </div>

          <div className="space-y-3">
            <Label>Position Type</Label>
            <RadioGroup value={position} onValueChange={(value: "buy" | "sell") => setPosition(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="buy" id="buy" />
                <Label htmlFor="buy">Buy (Long)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sell" id="sell" />
                <Label htmlFor="sell">Sell (Short)</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="swap-days">Number of Days</Label>
            <Input
              id="swap-days"
              type="number"
              min="1"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              placeholder="1"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={calculateSwap} className="flex-1">
            Calculate Swap
          </Button>
          <Button variant="outline" onClick={reset}>
            Reset
          </Button>
        </div>

        {swapResult && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-lg text-center">
              <div className="text-sm text-muted-foreground">Daily Swap</div>
              <div className={`text-xl font-bold ${
                swapResult.swapType === "credit" ? "text-green-600" : "text-red-600"
              }`}>
                {swapResult.swapType === "credit" ? "+" : ""}{formatCurrency(Math.abs(swapResult.dailySwap))}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {swapResult.swapType === "credit" ? "Credit" : "Debit"}
              </div>
            </div>
            
            <div className="p-4 bg-muted rounded-lg text-center">
              <div className="text-sm text-muted-foreground">Total Swap ({days} days)</div>
              <div className={`text-xl font-bold ${
                swapResult.swapType === "credit" ? "text-green-600" : "text-red-600"
              }`}>
                {swapResult.swapType === "credit" ? "+" : ""}{formatCurrency(Math.abs(swapResult.totalSwap))}
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <strong>Note:</strong> Swap rates shown are for demonstration purposes. 
          Actual swap rates vary by broker and market conditions. Wednesday rollover 
          typically charges triple swap.
        </div>
      </CardContent>
    </Card>
  );
};