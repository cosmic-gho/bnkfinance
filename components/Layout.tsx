"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  CreditCard,
  DollarSign,
  HelpCircle,
  Home,
  LogOut,
  Menu,
  PieChart,
  Search,
  Send,
  Settings,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  notifications: Notification[];
}

export default function Layout({ children, user, notifications }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Toggle menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <SheetHeader className="p-4 border-b border-border">
              <SheetTitle className="flex items-center">
                <div className="h-8 w-8 rounded-md bg-emerald-500 flex items-center justify-center text-white mr-2">
                  <DollarSign className="h-5 w-5" />
                </div>
                <span>BNK Finance Bank</span>
              </SheetTitle>
            </SheetHeader>
            <div className="py-4">
              <nav className="space-y-1 px-2">
                <Link
                  href="/dashboard"
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Home className="mr-3 h-5 w-5" />
                  Dashboard
                </Link>
                <Link
                  href="/accounts"
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <CreditCard className="mr-3 h-5 w-5" />
                  Accounts
                </Link>
                <Link
                  href="/transfers"
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Send className="mr-3 h-5 w-5" />
                  Transfers
                </Link>
                <Link
                  href="/analytics"
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <PieChart className="mr-3 h-5 w-5" />
                  Analytics
                </Link>
              </nav>
              <div className="mt-8 px-2">
                <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Settings</h3>
                <div className="mt-1 space-y-1">
                  <Link
                    href="/profile"
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="mr-3 h-5 w-5" />
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Settings className="mr-3 h-5 w-5" />
                    Settings
                  </Link>
                  <Link
                    href="/help"
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <HelpCircle className="mr-3 h-5 w-5" />
                    Help Center
                  </Link>
                </div>
              </div>
              <div className="mt-auto pt-4 pb-2 px-2 border-t border-border">
                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted w-full"
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Logout
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <h1 className="text-xl font-semibold">BNK Finance Bank</h1>
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-9 w-9" aria-label="User menu">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href="/profile" className="flex w-full">
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/settings" className="flex w-full">
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <button onClick={handleLogout} className="flex w-full">
                  Logout
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden md:flex flex-col w-64 h-screen bg-card border-r border-border p-4">
          <div className="flex items-center mb-8">
            <div className="h-8 w-8 rounded-md bg-emerald-500 flex items-center justify-center text-white mr-2">
              <DollarSign className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold">BNK Finance Bank</h1>
          </div>
          <nav className="flex-1">
            <div className="space-y-1">
              <Link
                href="/dashboard"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
              >
                <Home className="mr-3 h-5 w-5" />
                Dashboard
              </Link>
              <Link
                href="/accounts"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted"
              >
                <CreditCard className="mr-3 h-5 w-5" />
                Accounts
              </Link>
              <Link
                href="/transfers"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted"
              >
                <Send className="mr-3 h-5 w-5" />
                Transfers
              </Link>
              <Link
                href="/analytics"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted"
              >
                <PieChart className="mr-3 h-5 w-5" />
                Analytics
              </Link>
            </div>
            <div className="mt-8">
              <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Settings</h3>
              <div className="mt-1 space-y-1">
                <Link
                  href="/profile"
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted"
                >
                  <User className="mr-3 h-5 w-5" />
                  Profile
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted"
                >
                  <Settings className="mr-3 h-5 w-5" />
                  Settings
                </Link>
                <Link
                  href="/help"
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted"
                >
                  <HelpCircle className="mr-3 h-5 w-5" />
                  Help Center
                </Link>
              </div>
            </div>
          </nav>
          <div className="mt-auto pt-4 border-t border-border">
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted w-full"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
            <div className="flex items-center justify-between mt-4 px-3">
              <span className="text-sm text-muted-foreground">Dark mode</span>
              <ThemeToggle />
            </div>
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="hidden md:flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Dashboard</h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <label htmlFor="search" className="sr-only">
                  Search
                </label>
                <input
                  id="search"
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-background"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full relative" aria-label="Notifications">
                    <Bell className="h-5 w-5" />
                    {notifications.filter((n) => !n.is_read).length > 0 && (
                      <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.slice(0, 5).map((notification) => (
                        <div key={notification.id} className="p-3 hover:bg-muted rounded-md">
                          <div className="flex items-start">
                            <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 mr-3">
                              <DollarSign className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{notification.title}</p>
                              <p className="text-xs text-muted-foreground">{notification.message}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(notification.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-center text-muted-foreground">No notifications</div>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <div className="p-2 text-center">
                    <Link href="/notifications" className="text-xs text-emerald-600 hover:text-emerald-700">
                      View all notifications
                    </Link>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-300 mr-2">
                  <span className="font-medium">
                    {user ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}` : "JD"}
                  </span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="p-0 h-auto font-medium">
                      {user ? `${user.first_name} ${user.last_name}` : "Guest"}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="ml-1 h-4 w-4"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Link href="/profile" className="flex w-full">
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/settings" className="flex w-full">
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <button onClick={handleLogout} className="flex w-full">
                        Logout
                      </button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
          {children}
        </main>
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border flex justify-around p-3">
        <Link href="/dashboard" className="flex flex-col items-center text-emerald-600 dark:text-emerald-400">
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link href="/accounts" className="flex flex-col items-center text-muted-foreground">
          <CreditCard className="h-6 w-6" />
          <span className="text-xs mt-1">Accounts</span>
        </Link>
        <Link href="/transfers" className="flex flex-col items-center text-muted-foreground">
          <Send className="h-6 w-6" />
          <span className="text-xs mt-1">Transfer</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center text-muted-foreground">
          <User className="h-6 w-6" />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </nav>
    </div>
  );
}