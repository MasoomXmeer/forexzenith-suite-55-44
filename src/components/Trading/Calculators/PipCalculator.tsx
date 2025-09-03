import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";
import { platformConfig } from "@/config/platform";
import { formatCurrency } from "@/utils/trading";

export const PipCalculator = () => {
  const [symbol, setSymbol] = useState("");
  const [lotSize, setLotSize] = useState("");
  const [pipValue, setPipValue] = useState<number | null>(null);

  const calculatePipValue = () => {
    if (!symbol || !lotSize) return;

    const pair = platformConfig.trading.supportedPairs.find(p => p.symbol === symbol);
    if (!pair) return;

    const lots = parseFloat(lotSize);
    if (isNaN(lots)) return;

    // Standard pip value calculation
    // For most forex pairs: pip value = (lot size * 0.0001) / exchange rate
    // Simplified for demo - in real implementation would need current exchange rate
    let basePipValue = 10; // Standard for 1 lot of EUR/USD

    // Adjust for different lot sizes
    const calculatedPipValue = basePipValue * lots;
    setPipValue(calculatedPipValue);
  };

  const reset = () => {
    setSymbol("");
    setLotSize("");
    setPipValue(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Pip Calculator
        </CardTitle>
        <CardDescription>
          Calculate the value of each pip for your position
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pip-symbol">Trading Pair</Label>
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
            <Label htmlFor="pip-lot-size">Lot Size</Label>
            <Input
              id="pip-lot-size"
              type="number"
              step="0.01"
              min="0.01"
              value={lotSize}
              onChange={(e) => setLotSize(e.target.value)}
              placeholder="e.g. 1.00"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={calculatePipValue} className="flex-1">
            Calculate Pip Value
          </Button>
          <Button variant="outline" onClick={reset}>
            Reset
          </Button>
        </div>

        {pipValue !== null && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Pip Value</div>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(pipValue)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                per pip movement
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};