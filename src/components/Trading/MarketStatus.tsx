import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { marketDataService } from '@/services/marketData/index';

export const MarketStatus = () => {
  const [status, setStatus] = useState<{
    connected: boolean;
    overall: boolean;
  }>({ connected: false, overall: false });
  
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const connected = await marketDataService.testConnection();
        setStatus({
          connected,
          overall: connected
        });
      } catch (error) {
        console.error('Failed to check market status:', error);
        setStatus({ connected: false, overall: false });
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const getStatusInfo = () => {
    if (status.connected) {
      return {
        icon: Wifi,
        text: 'Live Data',
        color: 'bg-green-500',
        textColor: 'text-white'
      };
    } else if (status.overall) {
      return {
        icon: AlertTriangle,
        text: 'Limited',
        color: 'bg-yellow-500',
        textColor: 'text-white'
      };
    } else {
      return {
        icon: WifiOff,
        text: 'Offline',
        color: 'bg-red-500',
        textColor: 'text-white'
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Badge className={`${statusInfo.color} ${statusInfo.textColor} flex items-center gap-1 text-xs`}>
      <statusInfo.icon className="h-3 w-3" />
      {statusInfo.text}
    </Badge>
  );
};