import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Shield } from "lucide-react";
import { platformConfig } from "@/config/platform";
import { formatCurrency } from "@/utils/trading";

export const PositionSizeCalculator = () => {
  const [accountBalance, setAccountBalance] = useState("");
  const [riskPercentage, setRiskPercentage] = useState([2]);
  const [entryPrice, setEntryPrice] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [symbol, setSymbol] = useState("");
  const [results, setResults] = useState<{
    maxRiskAmount: number;
    positionSize: number;
    lotSize: number;
    pipValue: number;
  } | null>(null);

  const calculatePositionSize = () => {
    const balance = parseFloat(accountBalance);
    const entry = parseFloat(entryPrice);
    const stop = parseFloat(stopLoss);
    
    if (isNaN(balance) || isNaN(entry) || isNaN(stop) || !symbol) return;

    const pair = platformConfig.trading.supportedPairs.find(p => p.symbol === symbol);
    if (!pair) return;

    const maxRiskAmount = balance * (riskPercentage[0] / 100);
    const stopLossDistance = Math.abs(entry - stop);
    
    // Simplified calculation - in real implementation would consider pip value
    const pipValuePerLot = 10; // Standard pip value for major pairs
    const stopLossInPips = stopLossDistance * 10000; // Convert to pips
    
    const lotSize = maxRiskAmount / (stopLossInPips * pipValuePerLot);
    const positionSize = lotSize * 100000; // Standard contract size

    setResults({
      maxRiskAmount,
      positionSize,
      lotSize,
      pipValue: pipValuePerLot
    });
  };

  const reset = () => {
    setAccountBalance("");
    setRiskPercentage([2]);
    setEntryPrice("");
    setStopLoss("");
    setSymbol("");
    setResults(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Position Size Calculator
        </CardTitle>
        <CardDescription>
          Calculate optimal position size based on your risk tolerance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="account-balance">Account Balance</Label>
            <Input
              id="account-balance"
              type="number"
              step="0.01"
              min="0"
              value={accountBalance}
              onChange={(e) => setAccountBalance(e.target.value)}
              placeholder="e.g. 10000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position-symbol">Trading Pair</Label>
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
            <Label htmlFor="entry-price">Entry Price</Label>
            <Input
              id="entry-price"
              type="number"
              step="0.00001"
              value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value)}
              placeholder="e.g. 1.08500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stop-loss">Stop Loss Price</Label>
            <Input
              id="stop-loss"
              type="number"
              step="0.00001"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              placeholder="e.g. 1.08000"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label>Risk Percentage: {riskPercentage[0]}%</Label>
          <Slider
            value={riskPercentage}
            onValueChange={setRiskPercentage}
            max={10}
            min={0.5}
            step={0.5}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>0.5%</span>
            <span>Conservative (1-2%)</span>
            <span>Aggressive (5-10%)</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={calculatePositionSize} className="flex-1">
            Calculate Position Size
          </Button>
          <Button variant="outline" onClick={reset}>
            Reset
          </Button>
        </div>

        {results && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-lg text-center">
              <div className="text-sm text-muted-foreground">Max Risk Amount</div>
              <div className="text-xl font-bold text-red-600">
                {formatCurrency(results.maxRiskAmount)}
              </div>
            </div>
            
            <div className="p-4 bg-muted rounded-lg text-center">
              <div className="text-sm text-muted-foreground">Recommended Lot Size</div>
              <div className="text-xl font-bold text-primary">
                {results.lotSize.toFixed(2)} lots
              </div>
            </div>
            
            <div className="p-4 bg-muted rounded-lg text-center">
              <div className="text-sm text-muted-foreground">Position Size</div>
              <div className="text-xl font-bold text-blue-600">
                {formatCurrency(results.positionSize)}
              </div>
            </div>
            
            <div className="p-4 bg-muted rounded-lg text-center">
              <div className="text-sm text-muted-foreground">Pip Value</div>
              <div className="text-xl font-bold text-green-600">
                {formatCurrency(results.pipValue)}
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground mt-4 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
          <strong>Risk Warning:</strong> Never risk more than you can afford to lose. 
          Professional traders typically risk 1-2% of their account per trade.
        </div>
      </CardContent>
    </Card>
  );
};