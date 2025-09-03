import { useState } from "react";
import { RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePWA } from "@/hooks/usePWA";

export const UpdatePrompt = () => {
  const [isVisible, setIsVisible] = useState(true);
  const { swUpdate, reloadApp } = usePWA();

  if (!swUpdate || !isVisible) {
    return null;
  }

  const handleUpdate = () => {
    reloadApp();
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 border border-blue-500/20 bg-background/95 backdrop-blur-sm animate-slide-in-bottom">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <RefreshCw className="h-5 w-5 text-blue-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-foreground">
                Update Available
              </h3>
              <p className="text-xs text-muted-foreground">
                A new version is ready to install
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleDismiss}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              onClick={handleUpdate}
              className="h-8 px-3"
            >
              Update
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};