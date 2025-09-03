import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { AlertTriangle, Star, TrendingUp } from 'lucide-react';
import { useCopyTrading } from '@/hooks/useCopyTrading';

interface TraderApplicationDialogProps {
  trigger: React.ReactNode;
}

export const TraderApplicationDialog: React.FC<TraderApplicationDialogProps> = ({ trigger }) => {
  const { applyToBecomeCopyTrader } = useCopyTrading();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    trader_name: '',
    description: '',
    trading_strategy: '',
    risk_level: 5,
    minimum_investment: 100,
    maximum_investment: 10000
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.trader_name.trim()) {
      newErrors.trader_name = 'Trader name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.trading_strategy.trim()) {
      newErrors.trading_strategy = 'Trading strategy is required';
    }

    if (formData.minimum_investment < 50) {
      newErrors.minimum_investment = 'Minimum investment must be at least $50';
    }

    if (formData.maximum_investment <= formData.minimum_investment) {
      newErrors.maximum_investment = 'Maximum investment must be greater than minimum';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const success = await applyToBecomeCopyTrader(formData);
      if (success) {
        setIsOpen(false);
        setFormData({
          trader_name: '',
          description: '',
          trading_strategy: '',
          risk_level: 5,
          minimum_investment: 100,
          maximum_investment: 10000
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRiskLabel = (level: number) => {
    if (level <= 3) return 'Conservative';
    if (level <= 6) return 'Moderate';
    return 'Aggressive';
  };

  const getRiskColor = (level: number) => {
    if (level <= 3) return 'text-green-600';
    if (level <= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Apply to Become a Copy Trader
          </DialogTitle>
          <DialogDescription>
            Join our platform as a copy trader and earn 10% profit sharing from your followers' successful trades.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Benefits Card */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Copy Trader Benefits</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Earn 10% profit sharing from followers' successful trades</li>
                    <li>• Build your reputation and attract more followers</li>
                    <li>• Showcase your trading expertise to the community</li>
                    <li>• Access advanced analytics and performance tracking</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Application Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Trader Name */}
            <div className="space-y-2">
              <Label htmlFor="trader_name">Public Trader Name *</Label>
              <Input
                id="trader_name"
                value={formData.trader_name}
                onChange={(e) => setFormData(prev => ({ ...prev, trader_name: e.target.value }))}
                placeholder="Enter your trader display name"
                className={errors.trader_name ? 'border-red-500' : ''}
              />
              {errors.trader_name && (
                <p className="text-sm text-red-600">{errors.trader_name}</p>
              )}
            </div>

            {/* Trading Strategy */}
            <div className="space-y-2">
              <Label htmlFor="trading_strategy">Trading Strategy *</Label>
              <Select 
                value={formData.trading_strategy} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, trading_strategy: value }))}
              >
                <SelectTrigger className={errors.trading_strategy ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select your main strategy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scalping">Scalping</SelectItem>
                  <SelectItem value="day_trading">Day Trading</SelectItem>
                  <SelectItem value="swing_trading">Swing Trading</SelectItem>
                  <SelectItem value="position_trading">Position Trading</SelectItem>
                  <SelectItem value="algorithmic">Algorithmic Trading</SelectItem>
                  <SelectItem value="news_trading">News Trading</SelectItem>
                  <SelectItem value="technical_analysis">Technical Analysis</SelectItem>
                  <SelectItem value="fundamental_analysis">Fundamental Analysis</SelectItem>
                </SelectContent>
              </Select>
              {errors.trading_strategy && (
                <p className="text-sm text-red-600">{errors.trading_strategy}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Trading Profile Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your trading experience, approach, and what makes you unique..."
              rows={4}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Risk Level */}
          <div className="space-y-2">
            <Label>Risk Level: {formData.risk_level}/10 ({getRiskLabel(formData.risk_level)})</Label>
            <Slider
              value={[formData.risk_level]}
              onValueChange={([value]) => setFormData(prev => ({ ...prev, risk_level: value }))}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Conservative</span>
              <span>Moderate</span>
              <span>Aggressive</span>
            </div>
            <p className={`text-sm font-medium ${getRiskColor(formData.risk_level)}`}>
              {getRiskLabel(formData.risk_level)} Risk Profile
            </p>
          </div>

          {/* Investment Limits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minimum_investment">Minimum Investment ($)</Label>
              <Input
                id="minimum_investment"
                type="number"
                value={formData.minimum_investment}
                onChange={(e) => setFormData(prev => ({ ...prev, minimum_investment: Number(e.target.value) }))}
                min={50}
                max={1000}
                className={errors.minimum_investment ? 'border-red-500' : ''}
              />
              {errors.minimum_investment && (
                <p className="text-sm text-red-600">{errors.minimum_investment}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maximum_investment">Maximum Investment ($)</Label>
              <Input
                id="maximum_investment"
                type="number"
                value={formData.maximum_investment}
                onChange={(e) => setFormData(prev => ({ ...prev, maximum_investment: Number(e.target.value) }))}
                min={100}
                max={100000}
                className={errors.maximum_investment ? 'border-red-500' : ''}
              />
              {errors.maximum_investment && (
                <p className="text-sm text-red-600">{errors.maximum_investment}</p>
              )}
            </div>
          </div>

          {/* Terms and Conditions */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-yellow-900 mb-2">Important Terms</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• You earn 10% of profits made by your followers</li>
                    <li>• Your trading performance will be publicly displayed</li>
                    <li>• Applications are reviewed within 48 hours</li>
                    <li>• You must maintain consistent trading activity</li>
                    <li>• Platform reserves the right to suspend traders for violations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};