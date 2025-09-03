import { useState, useEffect } from "react";
import { Bell, Shield, Globe, Palette, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext.minimal";
import { toast } from "@/hooks/use-toast";

export default function Settings() {
  const { user, profile, signOut } = useAuth();
  const [orderVolumeInLots, setOrderVolumeInLots] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [theme, setTheme] = useState("system");
  const [language, setLanguage] = useState("en");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load user preferences from profile or localStorage
    const savedTheme = localStorage.getItem('theme') || 'system';
    const savedLanguage = localStorage.getItem('language') || 'en';
    setTheme(savedTheme);
    setLanguage(savedLanguage);
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Apply theme logic here
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System theme
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      if (systemTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    
    toast({
      title: "Theme Updated",
      description: `Theme changed to ${newTheme}`
    });
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    toast({
      title: "Language Updated", 
      description: `Language changed to ${newLanguage === 'en' ? 'English' : newLanguage}`
    });
  };

  const toggleNotifications = async (enabled: boolean) => {
    setNotifications(enabled);
    toast({
      title: enabled ? "Notifications Enabled" : "Notifications Disabled",
      description: `Push notifications have been ${enabled ? 'enabled' : 'disabled'}`
    });
  };

  const primaryAccount = profile ? {
    accountNumber: `XM${user?.id?.slice(0, 8)?.toUpperCase()}`,
    leverage: '1:500',
    accountType: profile.account_type
  } : null;

  return (
    <div className="min-h-screen bg-background pt-16 pb-20 md:pt-20 md:pb-8">
      <div className="container mx-auto p-4 space-y-6">
        
        {/* Profile Section */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {profile?.first_name || 'User'} {profile?.last_name || ''}
              </h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={profile?.kyc_status === 'verified' ? 'default' : 'secondary'}>
                  KYC: {profile?.kyc_status || 'pending'}
                </Badge>
                <Badge variant="outline">{profile?.account_type || 'standard'}</Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Account Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Account Settings</h3>
          
          {/* Trading Account Info */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Primary Trading Account</h4>
                <p className="text-sm text-muted-foreground">
                  ID: {primaryAccount?.accountNumber} • Leverage: {primaryAccount?.leverage}
                </p>
              </div>
              <Button variant="outline" size="sm">
                Manage
              </Button>
            </div>
          </Card>

          {/* Notifications */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-medium">Push Notifications</h4>
                  <p className="text-sm text-muted-foreground">Trading alerts and updates</p>
                </div>
              </div>
              <Switch 
                checked={notifications}
                onCheckedChange={toggleNotifications}
              />
            </div>
          </Card>

          {/* Two Factor Authentication */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                  <p className="text-sm text-muted-foreground">
                    Status: {twoFactorAuth ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                {twoFactorAuth ? 'Disable' : 'Enable'}
              </Button>
            </div>
          </Card>
        </div>

        {/* App Preferences */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">App Preferences</h3>
          
          {/* Theme Selection */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Palette className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-medium">Theme</h4>
                  <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
                </div>
              </div>
              <Select value={theme} onValueChange={handleThemeChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Language Selection */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-medium">Language</h4>
                  <p className="text-sm text-muted-foreground">App language preference</p>
                </div>
              </div>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Order Volume Toggle */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Order volume in lots</h4>
                <p className="text-sm text-muted-foreground">
                  When enabled, order volume is expressed in lots
                </p>
              </div>
              <Switch 
                checked={orderVolumeInLots}
                onCheckedChange={setOrderVolumeInLots}
              />
            </div>
          </Card>
        </div>

        {/* Account Actions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Account Actions</h3>
          
          <Card className="p-4">
            <Button 
              variant="destructive" 
              className="w-full" 
              onClick={handleLogout}
              disabled={isLoading}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {isLoading ? 'Signing out...' : 'Sign Out'}
            </Button>
          </Card>
        </div>

        {/* App Info */}
        <div className="text-center space-y-2 pt-4">
          <p className="text-sm text-muted-foreground">AonePrime Trading Suite v3.43.2</p>
          <Button variant="link" className="text-sm text-primary p-0">
            Send Feedback
          </Button>
        </div>
      </div>
    </div>
  );
}