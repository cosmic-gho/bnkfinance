"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  CreditCard,
  DollarSign,
  Home,
  LogOut,
  Menu,
  PieChart,
  Plus,
  Send,
  TrendingUp,
  TrendingDown,
  Moon,
  Globe,
  ArrowUpRight,
  ArrowDownLeft,
  FileText,
  Building,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { userService, accountService, transactionService, notificationService } from "@/lib/supabase-services";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, getCurrencySymbol } from "@/lib/utils";

interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  currency?: string;
}

interface Account {
  id: number;
  account_type: { id: number; name: string; description: string };
  account_number: string;
  balance: string;
  transaction_limit?: number;
  daily_limit?: number;
  created_at: string;
  is_active: boolean;
}

interface Transaction {
  id: number;
  account: number;
  transaction_type: "deposit" | "withdrawal" | "transfer" | "payment";
  amount: string;
  description: string;
  category: { id: number; name: string; description: string } | null;
  recipient_account: number | null;
  timestamp: string;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push("/login");
          return;
        }

        const [userData, accountsData, transactionsData, notificationsData] = await Promise.allSettled([
          userService.getCurrentUser(),
          accountService.getAccounts(),
          transactionService.getTransactions(),
          notificationService.getNotifications(),
        ]);

        if (userData.status === 'fulfilled' && userData.value) {
          setUser(userData.value);
        }

        if (accountsData.status === 'fulfilled' && accountsData.value) {
          setAccounts(accountsData.value);
        }

        if (transactionsData.status === 'fulfilled' && transactionsData.value) {
          setTransactions(transactionsData.value);
        }

        if (notificationsData.status === 'fulfilled' && notificationsData.value) {
          setNotifications(notificationsData.value);
        }
      } catch (err: any) {
        setError(`Failed to load data: ${err.message}`);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Calculate statistics from actual user data
  const totalBalance = accounts.length > 0 
    ? accounts.reduce((sum, acc) => sum + parseFloat(acc.balance || '0'), 0) 
    : 0;
  
  const monthlyDeposits = transactions
    .filter(tx => tx.transaction_type === 'deposit')
    .filter(tx => {
      const txDate = new Date(tx.timestamp);
      const now = new Date();
      return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, tx) => sum + parseFloat(tx.amount || '0'), 0);
  
  const monthlyExpenses = transactions
    .filter(tx => tx.transaction_type === 'withdrawal' || tx.transaction_type === 'payment')
    .filter(tx => {
      const txDate = new Date(tx.timestamp);
      const now = new Date();
      return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, tx) => sum + parseFloat(tx.amount || '0'), 0);

  const totalVolume = transactions.reduce((sum, tx) => sum + parseFloat(tx.amount || '0'), 0);

  // Get primary account (first active account or highest balance)
  const primaryAccount = accounts.length > 0 
    ? accounts.sort((a, b) => parseFloat(b.balance || '0') - parseFloat(a.balance || '0'))[0]
    : null;
  
  // Get account limit from primary account or use default
  const accountLimit = primaryAccount?.transaction_limit || 500000;
  
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 3);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Top Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Welcome back, {user ? `${user.first_name} ${user.last_name}` : "User"}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {notifications.filter(n => !n.is_read).length > 0 && (
                      <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.slice(0, 5).map((notification) => (
                      <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-3">
                        <p className="font-medium text-sm">{notification.title}</p>
                        <p className="text-xs text-muted-foreground">{notification.message}</p>
                      </DropdownMenuItem>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                  <span className="text-sm font-medium">
                    {user ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}` : "JD"}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium">{user ? `${user.first_name} ${user.last_name}` : "User"}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email || "user@example.com"}</p>
                </div>
              </div>
            </div>
          </div>
      </header>

      {/* Main Content Area */}
      <div className="space-y-6">
          {error && (
            <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md">
              {error}
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Account Limit</p>
                    <p className="text-xl font-bold">{formatCurrency(accountLimit, user?.currency || 'USD')}</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Monthly Deposits</p>
                    <p className="text-xl font-bold">{formatCurrency(monthlyDeposits, user?.currency || 'USD')}</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <TrendingDown className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Monthly Expenses</p>
                    <p className="text-xl font-bold">{formatCurrency(monthlyExpenses, user?.currency || 'USD')}</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Volume</p>
                    <p className="text-xl font-bold">{formatCurrency(totalVolume, user?.currency || 'USD')}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">All Time</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <PieChart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Primary Account Card */}
          {primaryAccount ? (
            <Card className="mb-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-blue-100 text-sm mb-1">{primaryAccount.account_type?.name || 'Account'} Account</p>
                    <p className="text-xl font-semibold">Primary Account</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className="bg-green-500/20 text-green-100 border-green-300/30">
                      {primaryAccount.is_active ? 'Account Active' : 'Inactive'}
                    </Badge>
                    <Badge className="bg-white/20 text-white border-white/30">Verified & Secured</Badge>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-blue-100 text-sm mb-2">
                    Account Holder: {user ? `${user.first_name} ${user.last_name}` : "User"}
                  </p>
                  <p className="text-4xl font-bold mb-2">
                    {formatCurrency(parseFloat(primaryAccount.balance || '0'), user?.currency || 'USD')}
                  </p>
                  <p className="text-blue-100 text-sm">Fiat Balance ({user?.currency || 'USD'})</p>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-blue-100 text-sm mb-1">Account Number</p>
                    <p className="font-mono text-lg">
                      ****** {primaryAccount.account_number ? primaryAccount.account_number.slice(-4) : '0000'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    className="flex-1 bg-white text-blue-600 hover:bg-blue-50"
                    onClick={() => router.push("/transfers")}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send Money
                  </Button>
                  <Button 
                    className="flex-1 bg-white/20 text-white hover:bg-white/30 border border-white/30"
                    onClick={() => router.push("/transfers")}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Money
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <CreditCard className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-xl font-semibold mb-2">No Accounts Yet</p>
                  <p className="text-blue-100 mb-4">Create your first account to get started</p>
                  <Button 
                    className="bg-white text-blue-600 hover:bg-blue-50"
                    onClick={() => router.push("/accounts")}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Accounts Grid */}
          {accounts.length > 1 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4">All Accounts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {accounts.map((account) => (
                  <Card key={account.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {account.account_type?.name || 'Account'}
                          </p>
                          <p className="text-2xl font-bold">
                            {formatCurrency(parseFloat(account.balance || '0'), user?.currency || 'USD')}
                          </p>
                        </div>
                        <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <p className="text-gray-500 dark:text-gray-400">
                          **** {account.account_number ? account.account_number.slice(-4) : '0000'}
                        </p>
                        <Badge variant={account.is_active ? "default" : "secondary"}>
                          {account.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions & Recent Transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center"
                      onClick={() => router.push("/transfers")}
                    >
                      <Send className="h-6 w-6 mb-2" />
                      Transfer
                    </Button>
                    <Button
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center"
                      onClick={() => router.push("/transfers")}
                    >
                      <FileText className="h-6 w-6 mb-2" />
                      Pay Bills
                    </Button>
                    <Button
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center"
                    >
                      <ArrowDownLeft className="h-6 w-6 mb-2" />
                      Request
                    </Button>
                    <Button
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center"
                    >
                      <Building className="h-6 w-6 mb-2" />
                      Bank Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Transactions</CardTitle>
                  {transactions.length > 0 && (
                    <Link href="/transaction-history" className="text-sm text-blue-600 hover:text-blue-700">
                      View All
                    </Link>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentTransactions.length > 0 ? (
                      recentTransactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                          <div className="flex items-center">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${
                              transaction.transaction_type === 'deposit' 
                                ? 'bg-green-100 dark:bg-green-900/30' 
                                : 'bg-red-100 dark:bg-red-900/30'
                            }`}>
                              {transaction.transaction_type === 'deposit' ? (
                                <ArrowDownLeft className="h-5 w-5 text-green-600 dark:text-green-400" />
                              ) : (
                                <ArrowUpRight className="h-5 w-5 text-red-600 dark:text-red-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">
                                {transaction.description || transaction.transaction_type.charAt(0).toUpperCase() + transaction.transaction_type.slice(1)}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(transaction.timestamp).toLocaleDateString('en-US', { 
                                  day: '2-digit', 
                                  month: 'short', 
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${
                              transaction.transaction_type === 'deposit' 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {transaction.transaction_type === 'deposit' ? '+' : '-'}{formatCurrency(parseFloat(transaction.amount || '0'), user?.currency || 'USD')}
                            </p>
                            {transaction.category && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {transaction.category.name}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No transactions yet</p>
                        <p className="text-sm mt-2">Your transaction history will appear here</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Account Statistics */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Account Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">TRANSACTION LIMIT</p>
                  <p className="text-2xl font-bold">{formatCurrency(accountLimit, user?.currency || 'USD')}</p>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">Daily limit available</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">PENDING TRANSACTIONS</p>
                  <p className="text-2xl font-bold">{formatCurrency(0, user?.currency || 'USD')}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">No pending transactions</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">TOTAL VOLUME</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalVolume, user?.currency || 'USD')}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">All-time transactions</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">Updated in real-time</p>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}
