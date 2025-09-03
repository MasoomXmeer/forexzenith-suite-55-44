import { NavLink, useLocation } from "react-router-dom";
import { Home, TrendingUp, User, PieChart, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const adminNavItems = [
  { path: "/dashboard", icon: Home, label: "Home" },
  { path: "/admin", icon: Shield, label: "Admin" },
  { path: "/trading", icon: TrendingUp, label: "Trade" },
  { path: "/portfolio", icon: PieChart, label: "Portfolio" },
  { path: "/profile", icon: User, label: "Profile" },
];

export const AdminBottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 md:hidden">
      <div className="flex items-center justify-around px-4 py-2">
        {adminNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors relative",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
              {item.path === "/admin" && (
                <div className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></div>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};