import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertTriangle } from "lucide-react";
import { platformConfig } from "@/config/platform";
import { formatCurrency } from "@/utils/trading";

export const StopLossCalculator = () => {
  const [entryPrice, setEntryPrice] = useState("");
  const [positionType, setPositionType] = useState<"buy" | "sell">("buy");
  const [riskAmount, setRiskAmount] = useState("");
  const [lotSize, setLotSize] = useState("");
  const [symbol, setSymbol] = useState("");
  const [calculationMethod, setCalculationMethod] = useState<"amount" | "percentage" | "pips">("amount");
  const [riskPercentage, setRiskPercentage] = useState("");
  const [stopLossPips, setStopLossPips] = useState("");
  const [results, setResults] = useState<{
    stopLossPrice: number;
    maxLoss: number;
    riskRewardRatio: number;
    takeProfitSuggestion: number;
  } | null>(null);

  const calculateStopLoss = () => {
    const entry = parseFloat(entryPrice);
    const lots = parseFloat(lotSize);
    
    if (isNaN(entry) || isNaN(lots) || !symbol) return;

    const pair = platformConfig.trading.supportedPairs.find(p => p.symbol === symbol);
    if (!pair) return;

    let stopLossPrice = 0;
    let maxLoss = 0;

    const pipValue = 10; // Simplified pip value per lot

    if (calculationMethod === "amount") {
      const risk = parseFloat(riskAmount);
      if (isNaN(risk)) return;
      
      maxLoss = risk;
      const pipsToRisk = risk / (lots * pipValue);
      
      if (positionType === "buy") {
        stopLossPrice = entry - (pipsToRisk * 0.0001);
      } else {
        stopLossPrice = entry + (pipsToRisk * 0.0001);
      }
    } else if (calculationMethod === "percentage") {
      const percentage = parseFloat(riskPercentage);
      if (isNaN(percentage)) return;
      
      const priceChange = entry * (percentage / 100);
      
      if (positionType === "buy") {
        stopLossPrice = entry - priceChange;
      } else {
        stopLossPrice = entry + priceChange;
      }
      
      maxLoss = Math.abs(entry - stopLossPrice) * lots * 100000 / 10000; // Simplified
    } else if (calculationMethod === "pips") {
      const pips = parseFloat(stopLossPips);
      if (isNaN(pips)) return;
      
      const priceChange = pips * 0.0001;
      
      if (positionType === "buy") {
        stopLossPrice = entry - priceChange;
      } else {
        stopLossPrice = entry + priceChange;
      }
      
      maxLoss = pips * lots * pipValue;
    }

    // Calculate suggested take profit (2:1 risk-reward ratio)
    const stopLossDistance = Math.abs(entry - stopLossPrice);
    const takeProfitSuggestion = positionType === "buy" 
      ? entry + (stopLossDistance * 2)
      : entry - (stopLossDistance * 2);

    setResults({
      stopLossPrice,
      maxLoss,
      riskRewardRatio: 2, // Fixed 2:1 ratio
      takeProfitSuggestion
    });
  };

  const reset = () => {
    setEntryPrice("");
    setRiskAmount("");
    setLotSize("");
    setSymbol("");
    setRiskPercentage("");
    setStopLossPips("");
    setResults(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Stop Loss Calculator
        </CardTitle>
        <CardDescription>
          Calculate optimal stop loss levels for risk management
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sl-symbol">Trading Pair</Label>
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
            <Label htmlFor="sl-entry-price">Entry Price</Label>
            <Input
              id="sl-entry-price"
              type="number"
              step="0.00001"
              value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value)}
              placeholder="e.g. 1.08500"
            />
          </div>

          <div className="space-y-3">
            <Label>Position Type</Label>
            <RadioGroup value={positionType} onValueChange={(value: "buy" | "sell") => setPositionType(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="buy" id="sl-buy" />
                <Label htmlFor="sl-buy">Buy (Long)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sell" id="sl-sell" />
                <Label htmlFor="sl-sell">Sell (Short)</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sl-lot-size">Lot Size</Label>
            <Input
              id="sl-lot-size"
              type="number"
              step="0.01"
              min="0.01"
              value={lotSize}
              onChange={(e) => setLotSize(e.target.value)}
              placeholder="e.g. 1.00"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label>Calculation Method</Label>
          <RadioGroup value={calculationMethod} onValueChange={(value: "amount" | "percentage" | "pips") => setCalculationMethod(value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="amount" id="amount" />
              <Label htmlFor="amount">Risk Amount</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="percentage" id="percentage" />
              <Label htmlFor="percentage">Price Percentage</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pips" id="pips" />
              <Label htmlFor="pips">Pips Distance</Label>
            </div>
          </RadioGroup>
        </div>

        {calculationMethod === "amount" && (
          <div className="space-y-2">
            <Label htmlFor="risk-amount">Risk Amount (USD)</Label>
            <Input
              id="risk-amount"
              type="number"
              step="0.01"
              min="0"
              value={riskAmount}
              onChange={(e) => setRiskAmount(e.target.value)}
              placeholder="e.g. 100"
            />
          </div>
        )}

        {calculationMethod === "percentage" && (
          <div className="space-y-2">
            <Label htmlFor="risk-percentage">Price Change Percentage (%)</Label>
            <Input
              id="risk-percentage"
              type="number"
              step="0.1"
              min="0"
              value={riskPercentage}
              onChange={(e) => setRiskPercentage(e.target.value)}
              placeholder="e.g. 1.5"
            />
          </div>
        )}

        {calculationMethod === "pips" && (
          <div className="space-y-2">
            <Label htmlFor="stop-loss-pips">Stop Loss Distance (Pips)</Label>
            <Input
              id="stop-loss-pips"
              type="number"
              step="1"
              min="1"
              value={stopLossPips}
              onChange={(e) => setStopLossPips(e.target.value)}
              placeholder="e.g. 50"
            />
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={calculateStopLoss} className="flex-1">
            Calculate Stop Loss
          </Button>
          <Button variant="outline" onClick={reset}>
            Reset
          </Button>
        </div>

        {results && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-lg text-center">
              <div className="text-sm text-muted-foreground">Stop Loss Price</div>
              <div className="text-xl font-bold text-red-600">
                {results.stopLossPrice.toFixed(5)}
              </div>
            </div>
            
            <div className="p-4 bg-muted rounded-lg text-center">
              <div className="text-sm text-muted-foreground">Max Loss</div>
              <div className="text-xl font-bold text-red-600">
                {formatCurrency(results.maxLoss)}
              </div>
            </div>
            
            <div className="p-4 bg-muted rounded-lg text-center">
              <div className="text-sm text-muted-foreground">Take Profit Suggestion</div>
              <div className="text-xl font-bold text-green-600">
                {results.takeProfitSuggestion.toFixed(5)}
              </div>
              <div className="text-xs text-muted-foreground">2:1 Risk/Reward</div>
            </div>
            
            <div className="p-4 bg-muted rounded-lg text-center">
              <div className="text-sm text-muted-foreground">Risk/Reward Ratio</div>
              <div className="text-xl font-bold text-blue-600">
                1:{results.riskRewardRatio}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};