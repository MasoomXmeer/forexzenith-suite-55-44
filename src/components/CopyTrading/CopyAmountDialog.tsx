import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { AlertTriangle, Calculator, DollarSign } from 'lucide-react';
import { CopyTrader, useCopyTrading } from '@/hooks/useCopyTrading';

interface CopyAmountDialogProps {
  trader: CopyTrader;
  isOpen: boolean;
  onClose: () => void;
}

export const CopyAmountDialog: React.FC<CopyAmountDialogProps> = ({
  trader,
  isOpen,
  onClose
}) => {
  const { startCopyingTrader } = useCopyTrading();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [copySettings, setCopySettings] = useState({
    allocatedAmount: trader.minimum_investment,
    copyRatio: 100,
    maxRiskPercentage: 10,
    followStopLoss: true,
    followTakeProfit: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateSettings = () => {
    const newErrors: Record<string, string> = {};

    if (copySettings.allocatedAmount < trader.minimum_investment) {
      newErrors.allocatedAmount = `Minimum investment is $${trader.minimum_investment}`;
    }

    if (copySettings.allocatedAmount > trader.maximum_investment) {
      newErrors.allocatedAmount = `Maximum investment is $${trader.maximum_investment}`;
    }

    if (copySettings.copyRatio < 10 || copySettings.copyRatio > 200) {
      newErrors.copyRatio = 'Copy ratio must be between 10% and 200%';
    }

    if (copySettings.maxRiskPercentage < 1 || copySettings.maxRiskPercentage > 50) {
      newErrors.maxRiskPercentage = 'Risk percentage must be between 1% and 50%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStartCopying = async () => {
    if (!validateSettings()) return;

    setIsSubmitting(true);
    try {
      const success = await startCopyingTrader(
        trader.user_id,
        copySettings.allocatedAmount,
        copySettings.copyRatio,
        copySettings.maxRiskPercentage,
        copySettings.followStopLoss,
        copySettings.followTakeProfit
      );

      if (success) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const potentialMonthlyReturn = (copySettings.allocatedAmount * (trader.performance_return_1m / 100));
  const potentialProfitShare = potentialMonthlyReturn > 0 ? potentialMonthlyReturn * 0.1 : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Copy {trader.trader_name}
          </DialogTitle>
          <DialogDescription>
            Configure your copy trading settings and investment amount.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Trader Summary */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">1M Return</div>
                  <div className={`text-lg font-bold ${trader.performance_return_1m >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {trader.performance_return_1m >= 0 ? '+' : ''}{trader.performance_return_1m.toFixed(1)}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Win Rate</div>
                  <div className="text-lg font-bold">{trader.win_rate.toFixed(1)}%</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Followers</div>
                  <div className="text-lg font-bold">{trader.total_copiers}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Investment Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Investment Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              value={copySettings.allocatedAmount}
              onChange={(e) => setCopySettings(prev => ({ 
                ...prev, 
                allocatedAmount: Number(e.target.value) 
              }))}
              min={trader.minimum_investment}
              max={trader.maximum_investment}
              className={errors.allocatedAmount ? 'border-red-500' : ''}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Min: ${trader.minimum_investment}</span>
              <span>Max: ${trader.maximum_investment}</span>
            </div>
            {errors.allocatedAmount && (
              <p className="text-sm text-red-600">{errors.allocatedAmount}</p>
            )}
          </div>

          {/* Copy Ratio */}
          <div className="space-y-2">
            <Label>Copy Ratio: {copySettings.copyRatio}%</Label>
            <Slider
              value={[copySettings.copyRatio]}
              onValueChange={([value]) => setCopySettings(prev => ({ ...prev, copyRatio: value }))}
              max={200}
              min={10}
              step={10}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>10% (Minimal)</span>
              <span>100% (Match)</span>
              <span>200% (Double)</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Percentage of the trader's position size you want to copy
            </p>
            {errors.copyRatio && (
              <p className="text-sm text-red-600">{errors.copyRatio}</p>
            )}
          </div>

          {/* Risk Management */}
          <div className="space-y-2">
            <Label>Maximum Risk: {copySettings.maxRiskPercentage}%</Label>
            <Slider
              value={[copySettings.maxRiskPercentage]}
              onValueChange={([value]) => setCopySettings(prev => ({ ...prev, maxRiskPercentage: value }))}
              max={50}
              min={1}
              step={1}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              Maximum percentage of your portfolio at risk
            </p>
            {errors.maxRiskPercentage && (
              <p className="text-sm text-red-600">{errors.maxRiskPercentage}</p>
            )}
          </div>

          {/* Copy Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="stop-loss">Copy Stop Losses</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically copy the trader's stop loss orders
                </p>
              </div>
              <Switch
                id="stop-loss"
                checked={copySettings.followStopLoss}
                onCheckedChange={(checked) => setCopySettings(prev => ({ 
                  ...prev, 
                  followStopLoss: checked 
                }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="take-profit">Copy Take Profits</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically copy the trader's take profit orders
                </p>
              </div>
              <Switch
                id="take-profit"
                checked={copySettings.followTakeProfit}
                onCheckedChange={(checked) => setCopySettings(prev => ({ 
                  ...prev, 
                  followTakeProfit: checked 
                }))}
              />
            </div>
          </div>

          {/* Potential Returns Calculation */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Calculator className="h-5 w-5 text-blue-600 mt-1" />
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 mb-2">Potential Monthly Returns</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">Investment:</span>
                      <span className="font-semibold ml-2">${copySettings.allocatedAmount.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-blue-700">Potential Return:</span>
                      <span className={`font-semibold ml-2 ${potentialMonthlyReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {potentialMonthlyReturn >= 0 ? '+' : ''}${potentialMonthlyReturn.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700">Trader's Share (10%):</span>
                      <span className="font-semibold ml-2">-${potentialProfitShare.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-blue-700">Your Net Return:</span>
                      <span className={`font-semibold ml-2 ${(potentialMonthlyReturn - potentialProfitShare) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {(potentialMonthlyReturn - potentialProfitShare) >= 0 ? '+' : ''}${(potentialMonthlyReturn - potentialProfitShare).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Warning */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-yellow-900 mb-2">Risk Warning</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Copy trading involves significant financial risk</li>
                    <li>• Past performance does not guarantee future results</li>
                    <li>• The trader receives 10% of your profits (not losses)</li>
                    <li>• You can pause or stop copying at any time</li>
                    <li>• Monitor your positions regularly</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleStartCopying} 
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? 'Starting...' : `Start Copying ($${copySettings.allocatedAmount})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};