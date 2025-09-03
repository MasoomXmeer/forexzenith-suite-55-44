import { useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePWA } from "@/hooks/usePWA";

export const InstallPrompt = () => {
  const [isVisible, setIsVisible] = useState(true);
  const { isInstallable, installApp } = usePWA();

  if (!isInstallable || !isVisible) {
    return null;
  }

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 border border-primary/20 bg-background/95 backdrop-blur-sm animate-slide-in-bottom">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Download className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-foreground">
                Install Aone Prime FX
              </h3>
              <p className="text-xs text-muted-foreground">
                Get the native app experience
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
              onClick={handleInstall}
              className="h-8 px-3"
            >
              Install
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};