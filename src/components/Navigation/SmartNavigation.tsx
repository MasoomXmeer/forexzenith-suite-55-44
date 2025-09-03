import { useAuth } from "@/contexts/AuthContext.minimal";
import { GuestHeader } from "./GuestHeader";
import { UserHeader } from "./UserHeader";
import { AdminHeader } from "./AdminHeader";
import { GuestBottomNav } from "./GuestBottomNav";
import { UserBottomNav } from "./UserBottomNav";
import { AdminBottomNav } from "./AdminBottomNav";

export const SmartNavigation = () => {
  const { user, isAdmin, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <>
        <div className="h-16 bg-background border-b animate-pulse" />
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t animate-pulse md:hidden" />
      </>
    );
  }

  // Not authenticated - show guest navigation
  if (!user) {
    return (
      <>
        <GuestHeader />
        <GuestBottomNav />
      </>
    );
  }

  // Admin user - show admin navigation
  if (isAdmin) {
    return (
      <>
        <AdminHeader />
        <AdminBottomNav />
      </>
    );
  }

  // Regular authenticated user - show user navigation
  return (
    <>
      <UserHeader />
      <UserBottomNav />
    </>
  );
};