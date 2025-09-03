import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import { platformConfig } from "@/config/platform";
import { formatCurrency, calculateMargin } from "@/utils/trading";

export const MarginCalculator = () => {
  const [symbol, setSymbol] = useState("");
  const [lotSize, setLotSize] = useState("");
  const [leverage, setLeverage] = useState("");
  const [accountCurrency, setAccountCurrency] = useState("USD");
  const [results, setResults] = useState<{
    requiredMargin: number;
    freeMargin: number;
    marginLevel: number;
  } | null>(null);

  const calculateRequiredMargin = () => {
    if (!symbol || !lotSize || !leverage) return;

    const pair = platformConfig.trading.supportedPairs.find(p => p.symbol === symbol);
    if (!pair) return;

    const lots = parseFloat(lotSize);
    if (isNaN(lots)) return;

    // Simplified calculation - in real implementation would use current market price
    const contractSize = 100000; // Standard forex contract size
    const marketPrice = 1.0850; // Example price
    const positionValue = lots * contractSize * marketPrice;
    
    const requiredMargin = calculateMargin(positionValue, leverage);
    
    // Demo values for free margin and margin level
    const accountBalance = 10000; // Demo account balance
    const freeMargin = accountBalance - requiredMargin;
    const marginLevel = (accountBalance / requiredMargin) * 100;

    setResults({
      requiredMargin,
      freeMargin,
      marginLevel
    });
  };

  const reset = () => {
    setSymbol("");
    setLotSize("");
    setLeverage("");
    setResults(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Margin Calculator
        </CardTitle>
        <CardDescription>
          Calculate required margin for your position
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="margin-symbol">Trading Pair</Label>
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
            <Label htmlFor="margin-lot-size">Lot Size</Label>
            <Input
              id="margin-lot-size"
              type="number"
              step="0.01"
              min="0.01"
              value={lotSize}
              onChange={(e) => setLotSize(e.target.value)}
              placeholder="e.g. 1.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="margin-leverage">Leverage</Label>
            <Select value={leverage} onValueChange={setLeverage}>
              <SelectTrigger>
                <SelectValue placeholder="Select leverage" />
              </SelectTrigger>
              <SelectContent>
                {platformConfig.trading.leverageOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="margin-currency">Account Currency</Label>
            <Select value={accountCurrency} onValueChange={setAccountCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="JPY">JPY</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={calculateRequiredMargin} className="flex-1">
            Calculate Margin
          </Button>
          <Button variant="outline" onClick={reset}>
            Reset
          </Button>
        </div>

        {results && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted rounded-lg text-center">
              <div className="text-sm text-muted-foreground">Required Margin</div>
              <div className="text-xl font-bold text-primary">
                {formatCurrency(results.requiredMargin)}
              </div>
            </div>
            
            <div className="p-4 bg-muted rounded-lg text-center">
              <div className="text-sm text-muted-foreground">Free Margin</div>
              <div className="text-xl font-bold text-green-600">
                {formatCurrency(results.freeMargin)}
              </div>
            </div>
            
            <div className="p-4 bg-muted rounded-lg text-center">
              <div className="text-sm text-muted-foreground">Margin Level</div>
              <div className="text-xl font-bold text-blue-600">
                {results.marginLevel.toFixed(2)}%
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};