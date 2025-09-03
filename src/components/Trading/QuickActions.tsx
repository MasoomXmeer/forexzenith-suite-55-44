import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowUpCircle, ArrowDownCircle, BarChart3, Wallet } from "lucide-react";

export const QuickActions = () => {
  return (
    <Card className="p-4">
      <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="h-16 flex-col gap-2">
          <ArrowUpCircle className="h-6 w-6 text-success" />
          <span className="text-sm">Buy</span>
        </Button>
        <Button variant="outline" className="h-16 flex-col gap-2">
          <ArrowDownCircle className="h-6 w-6 text-danger" />
          <span className="text-sm">Sell</span>
        </Button>
        <Button variant="outline" className="h-16 flex-col gap-2">
          <BarChart3 className="h-6 w-6" />
          <span className="text-sm">Charts</span>
        </Button>
        <Button variant="outline" className="h-16 flex-col gap-2">
          <Wallet className="h-6 w-6" />
          <span className="text-sm">Wallet</span>
        </Button>
      </div>
    </Card>
  );
};