"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/admin-utils";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Receipt,
  Bell,
  LogOut,
  Shield,
  Wallet,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push("/login");
          return;
        }

        const admin = await isAdmin();
        if (!admin) {
          router.push("/dashboard");
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error("Error checking admin status:", error);
        router.push("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    checkAdmin();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border p-4">
        <div className="flex items-center mb-8">
          <Shield className="h-6 w-6 text-emerald-600 mr-2" />
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>
        <nav className="space-y-2">
          <Link href="/admin">
            <Button variant="ghost" className="w-full justify-start">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/admin/users">
            <Button variant="ghost" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              Users
            </Button>
          </Link>
          <Link href="/admin/accounts">
            <Button variant="ghost" className="w-full justify-start">
              <CreditCard className="mr-2 h-4 w-4" />
              Accounts
            </Button>
          </Link>
          <Link href="/admin/transactions">
            <Button variant="ghost" className="w-full justify-start">
              <Receipt className="mr-2 h-4 w-4" />
              Transactions
            </Button>
          </Link>
          <Link href="/admin/notifications">
            <Button variant="ghost" className="w-full justify-start">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </Button>
          </Link>
          <Link href="/admin/crypto-wallets">
            <Button variant="ghost" className="w-full justify-start">
              <Wallet className="mr-2 h-4 w-4" />
              Crypto Wallets
            </Button>
          </Link>
          <Link href="/admin/deposit-requests">
            <Button variant="ghost" className="w-full justify-start">
              <Receipt className="mr-2 h-4 w-4" />
              Deposit Requests
            </Button>
          </Link>
          <Link href="/admin/cards">
            <Button variant="ghost" className="w-full justify-start">
              <CreditCard className="mr-2 h-4 w-4" />
              Card Requests
            </Button>
          </Link>
          <Link href="/admin/kyc">
            <Button variant="ghost" className="w-full justify-start">
              <Shield className="mr-2 h-4 w-4" />
              KYC Submissions
            </Button>
          </Link>
        </nav>
        <div className="mt-8 pt-8 border-t border-border">
          <Link href="/dashboard">
            <Button variant="ghost" className="w-full justify-start mb-2">
              Back to Dashboard
            </Button>
          </Link>
          <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>
      <main className="ml-64 p-8">{children}</main>
    </div>
  );
}


