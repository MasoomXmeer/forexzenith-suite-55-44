
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X, ChevronDown, Globe, User } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { platformConfig } from "@/config/platform";


export const MainHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const tradingLinks = [
    { title: "Forex", href: "/trading", description: "Trade major, minor & exotic currency pairs" },
    { title: "Indices", href: "/trading", description: "Trade global stock indices" },
    { title: "Commodities", href: "/trading", description: "Trade gold, oil, and other commodities" },
    { title: "Stocks", href: "/trading", description: "Trade shares of global companies" },
  ];

  const platformLinks = [
    { title: "Web Platform", href: "/trading", description: "Trade directly in your browser" },
    { title: "Mobile App", href: "/trading", description: "Trade on the go" },
    { title: "API", href: "/admin", description: "Automated trading solutions" },
  ];

  return (
    <header className="xm-nav sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <NavLink to="/" className="flex items-center space-x-3">
            <img 
              src="/logo.png" 
              alt={platformConfig.platform.name}
              className="h-10 w-auto"
              onError={(e) => {
                // Fallback to text logo if image fails
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
                <NavLink to="/affiliate" className="font-medium text-sm px-4 py-2 text-gray-700 hover:text-[#E31E24] transition-colors">
                  Partnership
                </NavLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Right Side - Language, Login, CTA */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <Button variant="ghost" size="sm" className="hidden md:flex text-gray-700 hover:text-[#E31E24]">
              <Globe className="h-4 w-4 mr-2" />
              English
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>

            {/* Login */}
            <NavLink to="/login">
              <Button variant="ghost" size="sm" className="hidden md:flex text-gray-700 hover:text-[#E31E24]">
                <User className="h-4 w-4 mr-2" />
                Login
              </Button>
            </NavLink>

            {/* Primary CTA */}
            <NavLink to="/signup">
              <XMButton size="sm" className="hidden md:flex">
                Start Trading
              </XMButton>
            </NavLink>

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
                to="/affiliate" 
                className="text-sm font-medium py-2 text-gray-700 hover:text-[#E31E24] transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Partnership
              </NavLink>
              <div className="pt-4 border-t border-gray-200 flex flex-col space-y-2">
                <NavLink to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full border-[#E31E24] text-[#E31E24] hover:bg-[#E31E24] hover:text-white">
                    Login
                  </Button>
                </NavLink>
                <NavLink to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                  <XMButton size="sm" className="w-full">
                    Start Trading
                  </XMButton>
                </NavLink>
              </div>
            </div>
          </div>
        )}
      </div>
      
    </header>
  );
};
