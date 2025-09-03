import { NavLink, useLocation } from "react-router-dom";
import { Home, TrendingUp, User, PieChart, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

// For now, we'll show regular user navigation
// Later this can be controlled by user role from Supabase
const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/trading", icon: TrendingUp, label: "Trade" },
  { path: "/portfolio", icon: PieChart, label: "Portfolio" },
  { path: "/affiliate", icon: Share2, label: "Affiliate" },
  { path: "/profile", icon: User, label: "Profile" },
];

export const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 md:hidden">
      <div className="flex items-center justify-around px-4 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};