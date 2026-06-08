"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { transactionService } from "@/lib/supabase-services";
import { supabase } from "@/lib/supabase";

interface Transaction {
  id: number;
  account: number;
  transaction_type: "withdrawal" | "deposit" | "transfer" | "payment";
  amount: string;
  description: string;
  category: { id: number; name: string; description: string } | null;
  recipient_account: number | null;
  timestamp: string;
}

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState<"all" | "withdrawal" | "deposit">("all");
  const router = useRouter();
  const { toast } = useToast();

  const transactionsPerPage = 10;

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push("/login");
          return;
        }

        const filters: any = {};
        if (filterType !== "all") {
          filters.transaction_type = filterType;
        }

        const fetchedTransactions = await transactionService.getTransactions(filters);
        setAllTransactions(fetchedTransactions);
      } catch (err: any) {
        setError(err.message);
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [filterType, router, toast]);

  useEffect(() => {
    // Client-side pagination
    const startIndex = (page - 1) * transactionsPerPage;
    const endIndex = startIndex + transactionsPerPage;
    const paginatedTransactions = allTransactions.slice(startIndex, endIndex);
    setTransactions(paginatedTransactions);
  }, [page, allTransactions]);

  const totalPages = Math.ceil(allTransactions.length / transactionsPerPage);

  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <div className="min-h-screen bg-green-50 p-4 md:p-6">
      <Card className="max-w-4xl mx-auto border-green-500 shadow-green-200">
        <CardHeader className="bg-green-100">
          <CardTitle className="text-green-800">Transaction History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md">
              {error}
            </div>
          )}
          <div className="flex justify-end">
            <Select
              value={filterType}
              onValueChange={(value: "all" | "withdrawal" | "deposit") => {
                setFilterType(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[180px] border-green-500 focus:ring-green-500">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="withdrawal">Withdrawals</SelectItem>
                <SelectItem value="deposit">Deposits</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {isLoading ? (
            <p className="text-green-600">Loading transactions...</p>
          ) : transactions.length === 0 ? (
            <p className="text-green-600">No transactions found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-green-100">
                  <TableHead className="text-green-800">ID</TableHead>
                  <TableHead className="text-green-800">Type</TableHead>
                  <TableHead className="text-green-800">Amount</TableHead>
                  <TableHead className="text-green-800">Category</TableHead>
                  <TableHead className="text-green-800">Date</TableHead>
                  <TableHead className="text-green-800">Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell>{txn.id}</TableCell>
                    <TableCell className="capitalize">{txn.transaction_type}</TableCell>
                    <TableCell className={txn.transaction_type === 'deposit' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                      {txn.transaction_type === 'deposit' ? '+' : '-'}${parseFloat(txn.amount || '0').toFixed(2)}
                    </TableCell>
                    <TableCell>{txn.category?.name || "N/A"}</TableCell>
                    <TableCell>{new Date(txn.timestamp).toLocaleDateString()}</TableCell>
                    <TableCell>{txn.description || "N/A"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            onClick={handlePreviousPage}
            disabled={page === 1 || isLoading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Previous
          </Button>
          <span className="text-green-700">Page {page} of {totalPages}</span>
          <Button
            onClick={handleNextPage}
            disabled={page === totalPages || isLoading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Next
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}