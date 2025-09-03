import { Home, BarChart3, ArrowUpDown, TrendingUp, MoreHorizontal } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const XMBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      icon: Home,
      label: "Home",
      path: "/dashboard",
      isActive: location.pathname === "/dashboard" || location.pathname === "/"
    },
    {
      icon: BarChart3,
      label: "Quotes",
      path: "/market-watch",
      isActive: location.pathname === "/market-watch" || location.pathname === "/trading-tools"
    },
    {
      icon: ArrowUpDown,
      label: "Deposit",
      path: "/funding",
      isActive: location.pathname === "/funding"
    },
    {
      icon: TrendingUp,
      label: "Trade",
      path: "/portfolio",
      isActive: location.pathname === "/portfolio" || location.pathname === "/multi-account"
    },
    {
      icon: MoreHorizontal,
      label: "Orders",
      path: "/settings",
      isActive: location.pathname === "/settings" || location.pathname === "/profile" || location.pathname === "/support" || location.pathname === "/affiliate"
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 md:hidden safe-area-bottom">
      <div className="flex items-center justify-around px-1 py-2">
        {navItems.map((item) => (
          <Button
            key={item.path}
            variant="ghost"
            size="sm"
            className={cn(
              "flex flex-col items-center gap-1 h-auto py-2 px-3 min-w-0 flex-1 transition-colors rounded-none",
              item.isActive 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => navigate(item.path)}
          >
            <item.icon className="h-6 w-6 shrink-0" />
            <span className="text-xs font-medium leading-none">{item.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};