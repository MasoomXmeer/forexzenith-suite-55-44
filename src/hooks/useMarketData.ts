
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { marketDataService, MarketPrice } from '@/services/marketData/index';

export const useMarketPrice = (symbol: string) => {
  return useQuery({
    queryKey: ['marketPrice', symbol],
    queryFn: () => marketDataService.getMarketPrice(symbol),
    refetchInterval: 1000, // 1 second refresh interval
    staleTime: 0, // Always fresh data - no stale tolerance
    gcTime: 1000, // Keep cache for 1 second only
    networkMode: 'always', // Always fetch regardless of network state
  });
};

export const useMultipleMarketPrices = (symbols: string[]) => {
  return useQuery({
    queryKey: ['marketPrices', symbols],
    queryFn: () => marketDataService.getMultipleMarketPrices(symbols),
    refetchInterval: 1000, // 1 second refresh interval
    staleTime: 0, // Always fresh
    gcTime: 1000,
    networkMode: 'always',
  });
};

export const useRealTimeMarketData = (symbols: string[]) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!symbols.length) return;

    const unsubscribe = marketDataService.subscribeToRealTimeUpdates(
      symbols,
      (updatedPrice: MarketPrice) => {
        // Immediate cache update with no debouncing
        queryClient.setQueryData(['marketPrice', updatedPrice.symbol], updatedPrice);
        
        // Update multiple prices cache immediately
        queryClient.setQueryData(['marketPrices', symbols], (oldData: MarketPrice[] | undefined) => {
          if (!oldData) return [updatedPrice];
          
          const newData = [...oldData];
          const index = newData.findIndex(p => p.symbol === updatedPrice.symbol);
          
          if (index >= 0) {
            newData[index] = updatedPrice;
          } else {
            newData.push(updatedPrice);
          }
          
          return newData;
        });
      }
    );

    return unsubscribe;
  }, [symbols, queryClient]);

  return useMultipleMarketPrices(symbols);
};
