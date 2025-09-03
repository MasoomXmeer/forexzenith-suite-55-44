import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Trading from "./pages/Trading";
import TradingTools from "./pages/TradingTools";
import CopyTrading from "./pages/CopyTrading";
import MultiAccount from "./pages/MultiAccount";
import Portfolio from "./pages/Portfolio";
import Profile from "./pages/Profile";
import Funding from "./pages/Funding";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";
import AccountHistory from "./pages/AccountHistory";
import AdminPanel from "./pages/AdminPanel";
import Affiliate from "./pages/Affiliate";
import Documents from "./pages/Documents";
import TradingHistory from "./pages/TradingHistory";
import TransactionHistory from "./pages/TransactionHistory";
import Support from "./pages/Support";
import MarketWatch from "./pages/MarketWatch";
import MT5Interface from "./components/MT5/MT5Interface";
import { AuthProvider, useAuth } from "./contexts/AuthContext.minimal";
import { RealTradingProvider } from "./contexts/RealTradingContext";
import { InstallPrompt } from "./components/PWA/InstallPrompt";
import { OfflineIndicator } from "./components/PWA/OfflineIndicator";
import { UpdatePrompt } from "./components/PWA/UpdatePrompt";
import { SmartNavigation } from "./components/Navigation/SmartNavigation";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const AppRoutes = () => {
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, isLoading } = useAuth();
    
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      );
    }
    
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    
    return <>{children}</>;
  };

  const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, isLoading } = useAuth();
    
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      );
    }
    
    if (user) {
      return <Navigate to="/dashboard" replace />;
    }
    
    return <>{children}</>;
  };

  return (
    <BrowserRouter>
      <SmartNavigation />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
        
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/trading" element={<ProtectedRoute><Trading /></ProtectedRoute>} />
        <Route path="/market-watch" element={<ProtectedRoute><MarketWatch /></ProtectedRoute>} />
        <Route path="/trading-tools" element={<ProtectedRoute><TradingTools /></ProtectedRoute>} />
        <Route path="/copy-trading" element={<ProtectedRoute><CopyTrading /></ProtectedRoute>} />
        <Route path="/multi-account" element={<ProtectedRoute><MultiAccount /></ProtectedRoute>} />
        <Route path="/mt5" element={<ProtectedRoute><MT5Interface /></ProtectedRoute>} />
        <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/funding" element={<ProtectedRoute><Funding /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/account-history" element={<ProtectedRoute><AccountHistory /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
        <Route path="/affiliate" element={<ProtectedRoute><Affiliate /></ProtectedRoute>} />
        <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
        <Route path="/trading-history" element={<ProtectedRoute><TradingHistory /></ProtectedRoute>} />
        <Route path="/transaction-history" element={<ProtectedRoute><TransactionHistory /></ProtectedRoute>} />
        <Route path="/support" element={<Support />} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <RealTradingProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <InstallPrompt />
          <OfflineIndicator />
          <UpdatePrompt />
          <AppRoutes />
        </TooltipProvider>
      </RealTradingProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;