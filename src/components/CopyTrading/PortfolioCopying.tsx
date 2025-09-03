import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { AlertTriangle, Settings, TrendingUp, TrendingDown, Pause, Play, StopCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CopyPosition {
  id: string;
  traderId: string;
  traderName: string;
  traderAvatar: string;
  allocatedAmount: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
  isActive: boolean;
  copyRatio: number;
  maxRisk: number;
  followStopLoss: boolean;
  followTakeProfit: boolean;
  startDate: string;
  totalTrades: number;
  winningSterak: number;
}

const mockCopyPositions: CopyPosition[] = [
  {
    id: '1',
    traderId: '1',
    traderName: 'Alex Thompson',
    traderAvatar: '/avatars/alex.jpg',
    allocatedAmount: 5000,
    currentValue: 5625,
    pnl: 625,
    pnlPercent: 12.5,
    isActive: true,
    copyRatio: 100,
    maxRisk: 10,
    followStopLoss: true,
    followTakeProfit: true,
    startDate: '2024-10-01',
    totalTrades: 24,
    winningSterak: 7,
  },
  {
    id: '2',
    traderId: '3',
    traderName: 'Mike Rodriguez',
    traderAvatar: '/avatars/mike.jpg',
    allocatedAmount: 3000,
    currentValue: 3210,
    pnl: 210,
    pnlPercent: 7.0,
    isActive: false,
    copyRatio: 80,
    maxRisk: 15,
    followStopLoss: true,
    followTakeProfit: false,
    startDate: '2024-11-15',
    totalTrades: 12,
    winningSterak: 3,
  },
  {
    id: '3',
    traderId: '2',
    traderName: 'Sarah Chen',
    traderAvatar: '/avatars/sarah.jpg',
    allocatedAmount: 2500,
    currentValue: 2375,
    pnl: -125,
    pnlPercent: -5.0,
    isActive: true,
    copyRatio: 120,
    maxRisk: 8,
    followStopLoss: true,
    followTakeProfit: true,
    startDate: '2024-12-01',
    totalTrades: 8,
    winningSterak: 2,
  },
];

export const PortfolioCopying: React.FC = () => {
  const [copyPositions, setCopyPositions] = useState<CopyPosition[]>(mockCopyPositions);
  const [selectedPosition, setSelectedPosition] = useState<CopyPosition | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const handlePauseResume = (positionId: string) => {
    setCopyPositions(prev => prev.map(position => 
      position.id === positionId 
        ? { ...position, isActive: !position.isActive }
        : position
    ));
    
    const position = copyPositions.find(p => p.id === positionId);
    toast({
      title: position?.isActive ? "Copy Paused" : "Copy Resumed",
      description: `Copy trading ${position?.isActive ? 'paused' : 'resumed'} for ${position?.traderName}`,
    });
  };

  const handleStopCopy = (positionId: string) => {
    setCopyPositions(prev => prev.filter(position => position.id !== positionId));
    
    const position = copyPositions.find(p => p.id === positionId);
    toast({
      title: "Copy Stopped",
      description: `Stopped copying ${position?.traderName}`,
      variant: "destructive",
    });
  };

  const totalAllocated = copyPositions.reduce((sum, pos) => sum + pos.allocatedAmount, 0);
  const totalValue = copyPositions.reduce((sum, pos) => sum + pos.currentValue, 0);
  const totalPnL = copyPositions.reduce((sum, pos) => sum + pos.pnl, 0);
  const totalPnLPercent = totalAllocated > 0 ? (totalPnL / totalAllocated) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Allocated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAllocated.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across {copyPositions.length} traders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Live portfolio value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalPnL >= 0 ? '+' : ''}${totalPnL.toLocaleString()}
            </div>
            <p className={`text-xs ${totalPnLPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalPnLPercent >= 0 ? '+' : ''}{totalPnLPercent.toFixed(2)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Copies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{copyPositions.filter(p => p.isActive).length}</div>
            <p className="text-xs text-muted-foreground">of {copyPositions.length} total</p>
          </CardContent>
        </Card>
      </div>

      {/* Copy Positions */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">My Copy Positions</h3>
          <Button variant="outline" size="sm">
            Add New Copy
          </Button>
        </div>

        {copyPositions.map((position) => (
          <Card key={position.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Trader Info */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={position.traderAvatar} alt={position.traderName} />
                    <AvatarFallback>{position.traderName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{position.traderName}</h4>
                      <Badge variant={position.isActive ? "default" : "secondary"}>
                        {position.isActive ? "Active" : "Paused"}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Started {new Date(position.startDate).toLocaleDateString()} • {position.totalTrades} trades
                    </div>
                  </div>
                </div>

                {/* Performance Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Allocated</div>
                    <div className="text-sm font-bold">${position.allocatedAmount.toLocaleString()}</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Current Value</div>
                    <div className="text-sm font-bold">${position.currentValue.toLocaleString()}</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">P&L</div>
                    <div className={`text-sm font-bold ${position.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {position.pnl >= 0 ? '+' : ''}${position.pnl.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Return</div>
                    <div className={`text-sm font-bold ${position.pnlPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent.toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSelectedPosition(position)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePauseResume(position.id)}
                  >
                    {position.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleStopCopy(position.id)}
                  >
                    <StopCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Copy Settings Dialog */}
      {selectedPosition && (
        <Dialog open={!!selectedPosition} onOpenChange={() => setSelectedPosition(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Copy Settings</DialogTitle>
              <DialogDescription>
                Adjust copy trading settings for {selectedPosition.traderName}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Allocated Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  defaultValue={selectedPosition.allocatedAmount}
                  placeholder="Enter amount"
                />
              </div>

              <div className="space-y-2">
                <Label>Copy Ratio: {selectedPosition.copyRatio}%</Label>
                <Slider
                  value={[selectedPosition.copyRatio]}
                  max={200}
                  min={10}
                  step={10}
                  className="w-full"
                />
                <div className="text-xs text-muted-foreground">
                  Percentage of trader's position size to copy
                </div>
              </div>

              <div className="space-y-2">
                <Label>Maximum Risk: {selectedPosition.maxRisk}%</Label>
                <Slider
                  value={[selectedPosition.maxRisk]}
                  max={50}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="text-xs text-muted-foreground">
                  Maximum portfolio percentage at risk
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="stop-loss">Copy Stop Losses</Label>
                  <Switch
                    id="stop-loss"
                    checked={selectedPosition.followStopLoss}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="take-profit">Copy Take Profits</Label>
                  <Switch
                    id="take-profit"
                    checked={selectedPosition.followTakeProfit}
                  />
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium text-yellow-800">Risk Warning</div>
                    <div className="text-yellow-700">
                      Copy trading involves significant risk. Past performance does not guarantee future results.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedPosition(null)}>
                Cancel
              </Button>
              <Button onClick={() => {
                toast({
                  title: "Settings Updated",
                  description: "Copy trading settings have been updated successfully.",
                });
                setSelectedPosition(null);
              }}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};