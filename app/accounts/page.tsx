"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  CreditCard,
  DollarSign,
  Plus,
  Send,
} from "lucide-react";
import { accountService, transactionService } from "@/lib/supabase-services";
import { supabase } from "@/lib/supabase";

interface Account {
  id: number;
  account_type: { id: number; name: string; description: string };
  account_number: string;
  balance: string;
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

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
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

        const [accountsData, transactionsData] = await Promise.allSettled([
          accountService.getAccounts(),
          transactionService.getTransactions(),
        ]);

        if (accountsData.status === 'fulfilled' && accountsData.value) {
          setAccounts(accountsData.value);
        }

        if (transactionsData.status === 'fulfilled' && transactionsData.value) {
          setTransactions(transactionsData.value);
        }
      } catch (err: any) {
        setError(`Failed to load data: ${err.message}`);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [router]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Account Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => (
          <Card key={account.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {account.account_type.name}
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${account.balance}</div>
              <p className="text-xs text-muted-foreground">
                **** {account.account_number.slice(-4)}
              </p>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  Transfer
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        <Card className="border-dashed hover:border-primary transition-colors">
          <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px]">
            <Button variant="ghost" className="h-16 w-16 rounded-full mb-2">
              <Plus className="h-8 w-8" />
            </Button>
            <p className="text-sm font-medium">Add New Account</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.slice(0, 5).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    {transaction.transaction_type === "deposit" ? (
                      <ArrowUpRight className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <CreditCard className="h-5 w-5 text-emerald-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {transaction.transaction_type === "deposit" ? "+" : "-"}${transaction.amount}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {transaction.category?.name || "Uncategorized"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}