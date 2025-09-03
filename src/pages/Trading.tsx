import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { TradingTerminal } from "@/components/Trading/TradingTerminal";
import { MobileTradingInterface } from "@/components/Trading/MobileTradingInterface";

const Trading = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 pt-20 pb-24 md:pt-20 md:pb-8">
        {isMobile ? (
          <MobileTradingInterface />
        ) : (
          <TradingTerminal />
        )}
      </div>
    </div>
  );
};

export default Trading;