"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Moon, Sun, Bell } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface NavigationProps {
  children: React.ReactNode;
}

export function Navigation({ children }: NavigationProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isAuthPage = pathname === "/login" || pathname === "/signup";
  // Marketing/landing pages that use their own navigation
  const marketingPages = ["/", "/about", "/services", "/contact", "/chart", "/alerts", "/send-money", "/grants"];
  const isMarketingPage = pathname && marketingPages.includes(pathname);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    router.push("/login");
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/accounts", label: "Accounts" },
    { href: "/transfers", label: "Transfers" },
    { href: "/notifications", label: "Notifications" },
    { href: "/profile", label: "Profile" },
    { href: "/profile", label: "Settings" },
  ];

  if (!isMounted) {
    return null;
  }

  // Skip Navigation component for marketing pages - they use their own navbar
  if (isMarketingPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <span className="hidden font-bold sm:inline-block">
                BNK Finance Bank
              </span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link
                href="/dashboard"
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  pathname === "/dashboard"
                    ? "text-foreground"
                    : "text-foreground/60"
                )}
              >
                Dashboard
              </Link>
              <Link
                href="/accounts"
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  pathname === "/accounts"
                    ? "text-foreground"
                    : "text-foreground/60"
                )}
              >
                Accounts
              </Link>
              <Link
                href="/transactions"
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  pathname === "/transactions"
                    ? "text-foreground"
                    : "text-foreground/60"
                )}
              >
                Transactions
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <Button variant="outline" asChild>
                <Link href="/login">Login</Link>
              </Button>
            </div>
            <nav className="flex items-center">
              <ThemeToggle />
            </nav>
          </div>
        </div>
      </header>
      <main className="container py-6">{children}</main>
    </div>
  );
} 