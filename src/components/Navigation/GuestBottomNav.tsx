import { NavLink, useLocation } from "react-router-dom";
import { Home, TrendingUp, User, Info, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const guestNavItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/", icon: TrendingUp, label: "Markets" },
  { path: "/", icon: Info, label: "About" },
  { path: "/support", icon: HelpCircle, label: "Support" },
  { path: "/login", icon: User, label: "Login" },
];

export const GuestBottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 md:hidden">
      <div className="flex items-center justify-around px-4 py-2">
        {guestNavItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path === "/" && location.pathname === "/");
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.path + item.label}
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