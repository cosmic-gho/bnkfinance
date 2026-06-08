"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  CreditCard,
  Home,
  LogOut,
  Menu,
  Send,
  TrendingUp,
  Globe,
  Plus,
  Building,
  User,
  FileText,
  X,
  Lock,
  Clock,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { userService, notificationService } from "@/lib/supabase-services";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export function UserSidebar() {
  const [user, setUser] = useState<User | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await userService.getCurrentUser();
        if (userData) {
          setUser({
            id: userData.id,
            username: userData.username,
            email: userData.email,
            first_name: userData.first_name,
            last_name: userData.last_name,
          });
        } else {
          // User profile doesn't exist, try to get basic info from auth
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            setUser({
              id: user.id,
              username: user.email?.split('@')[0] || 'User',
              email: user.email || '',
              first_name: user.user_metadata?.first_name || '',
              last_name: user.user_metadata?.last_name || '',
            });
          }
        }

        try {
          const notifications = await notificationService.getNotifications();
          const unread = notifications.filter((n) => !n.is_read).length;
          setUnreadCount(unread);
        } catch (notifError) {
          // Notifications might fail if profile doesn't exist, that's okay
          console.warn("Could not fetch notifications:", notifError);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        // Try to get basic info from auth as fallback
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            setUser({
              id: user.id,
              username: user.email?.split('@')[0] || 'User',
              email: user.email || '',
              first_name: user.user_metadata?.first_name || '',
              last_name: user.user_metadata?.last_name || '',
            });
          }
        } catch (authError) {
          console.error("Error getting auth user:", authError);
        }
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/transaction-history", label: "Transactions", icon: TrendingUp },
    { href: "/accounts", label: "Accounts", icon: CreditCard },
    { href: "/cards", label: "Cards", icon: CreditCard },
    { href: "/kyc", label: "KYC Verification", icon: Lock },
    { href: "/deposit", label: "Deposit", icon: Wallet },
    { href: "/transfers", label: "Transfers", icon: Send },
    { href: "/wire-transfer", label: "Wire Transfer", icon: Lock },
    { href: "/pending-transactions", label: "Pending", icon: Clock },
    { href: "/notifications", label: "Notifications", icon: Bell, badge: unreadCount },
    { href: "/profile", label: "Profile", icon: User },
  ];

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={cn("flex flex-col h-full", mobile ? "w-full" : "")}>
      <div className="p-6">
        <div className="flex items-center mb-8">
          <div className="h-10 w-10 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold text-xl mr-3">
            F
          </div>
          <div>
            <h1 className="text-xl font-bold">FinanceHub</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Banking & Investment</p>
          </div>
        </div>

        <nav className="space-y-6">
          <div>
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              MAIN
            </h3>
            <div className="space-y-1">
              {navItems.slice(0, 3).map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => mobile && setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors",
                      isActive
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.label}
                    {item.badge && item.badge > 0 && (
                      <Badge variant="destructive" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              SERVICES
            </h3>
            <div className="space-y-1">
              {navItems.slice(3).map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => mobile && setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors",
                      isActive
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.label}
                    {item.badge && item.badge > 0 && (
                      <Badge variant="destructive" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-300 mr-3">
              <span className="text-sm font-medium">
                {user ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}` : "JD"}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium">
                {user ? `${user.first_name} ${user.last_name}` : "User"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.email || "user@example.com"}
              </p>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <SidebarContent mobile />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

