import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X, ChevronDown, Bell, LogOut, User, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { XMButton } from "@/components/UI/XMButton";
import { 
  NavigationMenu, 
  NavigationMenuContent, 
  NavigationMenuItem, 
  NavigationMenuLink, 
  NavigationMenuList, 
  NavigationMenuTrigger 
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext.minimal";
import { platformConfig } from "@/config/platform";

export const UserHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  const tradingLinks = [
    { title: "Forex", href: "/trading", description: "Trade major, minor & exotic currency pairs" },
    { title: "Indices", href: "/trading", description: "Trade global stock indices" },
    { title: "Commodities", href: "/trading", description: "Trade gold, oil, and other commodities" },
    { title: "Stocks", href: "/trading", description: "Trade shares of global companies" },
  ];

  const platformLinks = [
    { title: "Web Platform", href: "/trading", description: "Trade directly in your browser" },
    { title: "MT5", href: "/mt5", description: "MetaTrader 5 platform" },
    { title: "Trading Tools", href: "/trading-tools", description: "Calculators and analysis tools" },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="xm-nav sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <NavLink to="/dashboard" className="flex items-center space-x-3">
            <img 
              src="/logo.png" 
              alt={platformConfig.platform.name}
              className="h-10 w-auto"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="w-10 h-10 bg-gradient-to-r from-[#E31E24] to-[#B71C1C] rounded-lg flex items-center justify-center hidden">
              <span className="text-white font-bold text-lg">AP</span>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-[#E31E24] to-[#B71C1C] bg-clip-text text-transparent">
              {platformConfig.platform.name}
            </span>
          </NavLink>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-gray-700 hover:text-[#E31E24] font-medium">
                  Trading
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {tradingLinks.map((link) => (
                      <li key={link.title}>
                        <NavigationMenuLink asChild>
                          <NavLink
                            to={link.href}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-50 hover:text-[#E31E24] focus:bg-gray-50 focus:text-[#E31E24]"
                          >
                            <div className="text-sm font-medium leading-none">{link.title}</div>
                            <p className="line-clamp-2 text-sm leading-snug text-gray-600">
                              {link.description}
                            </p>
                          </NavLink>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-gray-700 hover:text-[#E31E24] font-medium">
                  Platform
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4">
                    {platformLinks.map((link) => (
                      <li key={link.title}>
                        <NavigationMenuLink asChild>
                          <NavLink
                            to={link.href}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-50 hover:text-[#E31E24] focus:bg-gray-50 focus:text-[#E31E24]"
                          >
                            <div className="text-sm font-medium leading-none">{link.title}</div>
                            <p className="line-clamp-2 text-sm leading-snug text-gray-600">
                              {link.description}
                            </p>
                          </NavLink>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavLink to="/portfolio" className="font-medium text-sm px-4 py-2 text-gray-700 hover:text-[#E31E24] transition-colors">
                  Portfolio
                </NavLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavLink to="/copy-trading" className="font-medium text-sm px-4 py-2 text-gray-700 hover:text-[#E31E24] transition-colors">
                  Copy Trading
                </NavLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Right Side - Balance, Notifications, User Menu */}
          <div className="flex items-center space-x-4">
            {/* Balance Display */}
            <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-gray-50 rounded-lg">
              <Wallet className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">${profile?.balance?.toFixed(2) || '0.00'}</span>
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Bell className="h-4 w-4" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="hidden md:inline">{profile?.first_name || user?.email?.split('@')[0]}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <NavLink to="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <NavLink to="/funding">
                    <Wallet className="mr-2 h-4 w-4" />
                    Funding
                  </NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <NavLink to="/settings">
                    Settings
                  </NavLink>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200 bg-white">
            <div className="flex flex-col space-y-4">
              <NavLink 
                to="/trading" 
                className="text-sm font-medium py-2 text-gray-700 hover:text-[#E31E24] transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Trading
              </NavLink>
              <NavLink 
                to="/portfolio" 
                className="text-sm font-medium py-2 text-gray-700 hover:text-[#E31E24] transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Portfolio
              </NavLink>
              <NavLink 
                to="/copy-trading" 
                className="text-sm font-medium py-2 text-gray-700 hover:text-[#E31E24] transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Copy Trading
              </NavLink>
              <NavLink 
                to="/funding" 
                className="text-sm font-medium py-2 text-gray-700 hover:text-[#E31E24] transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Funding
              </NavLink>
              <div className="pt-4 border-t border-gray-200 flex flex-col space-y-2">
                <div className="px-3 py-2 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Balance</div>
                  <div className="font-medium">${profile?.balance?.toFixed(2) || '0.00'}</div>
                </div>
                <Button variant="outline" onClick={handleSignOut} className="w-full">
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};