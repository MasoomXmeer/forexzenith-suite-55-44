import { WifiOff, Wifi } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { usePWA } from "@/hooks/usePWA";

export const OfflineIndicator = () => {
  const { isOffline } = usePWA();

  if (!isOffline) {
    return null;
  }

  return (
    <Card className="fixed top-4 left-4 right-4 z-50 border border-orange-500/20 bg-orange-500/10 backdrop-blur-sm animate-fade-in">
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <WifiOff className="h-5 w-5 text-orange-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-orange-500">
              You're offline
            </p>
            <p className="text-xs text-orange-500/80">
              Some features may be limited. Data will sync when connection is restored.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};