import { MarketWatchPanel } from '@/components/Trading/MarketWatchPanel';

const MarketWatch = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="pt-16 pb-20 md:pb-4">
        <MarketWatchPanel />
      </main>
    </div>
  );
};

export default MarketWatch;