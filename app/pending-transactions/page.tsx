"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { accountService, userService } from "@/lib/supabase-services";
import { supabase } from "@/lib/supabase";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Lock, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PendingTransaction {
  id: number;
  transaction_type: string;
  amount: string;
  description: string;
  timestamp: string;
  status?: string | null;
  verification_step?: number;
  account: {
    id: number;
    account_number: string;
  };
  recipient_account: {
    id: number;
    account_number: string;
  } | null;
  category: {
    id: number;
    name: string;
  } | null;
}

export default function PendingTransactionsPage() {
  const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<PendingTransaction | null>(null);
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const [pin, setPin] = useState<string>("");
  const [pin2, setPin2] = useState<string>("");
  const [pinStep, setPinStep] = useState<1 | 2>(1);
  const [isCompleting, setIsCompleting] = useState(false);
  const [user, setUser] = useState<{ has_pin_2?: boolean } | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const init = async () => {
      try {
        const userData = await userService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch user", error);
      }
      fetchPendingTransactions();
    };
    init();
    
    // Refresh every 5 seconds to check for status updates
    const interval = setInterval(() => {
      fetchPendingTransactions();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchPendingTransactions = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const transactions = await accountService.getPendingTransactions();
      setPendingTransactions(transactions as PendingTransaction[]);
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

  const handleCompleteTransaction = async (transaction: PendingTransaction) => {
    // Don't allow completing already approved/rejected transactions
    if (transaction.status && transaction.status !== 'pending') {
      toast({
        variant: "destructive",
        title: "Error",
        description: `This transaction has already been ${transaction.status}`,
      });
      return;
    }

    // Special case: Step 1 verified but no PIN 2 required
    if (transaction.verification_step === 1 && !user?.has_pin_2) {
       if (!window.confirm("Transaction verified. Complete now?")) return;
       
       try {
           setIsCompleting(true); // Reuse isCompleting state? It's for dialog. 
           // We can just use a toast loading
           toast({ title: "Processing", description: "Finalizing transaction..." });
           
           await accountService.completePendingWireTransfer(transaction.id, "SKIP");
           
           toast({
             title: "Success",
             description: "Transaction completed successfully",
           });
           fetchPendingTransactions();
       } catch (err: any) {
           toast({
             variant: "destructive",
             title: "Error",
             description: err.message,
           });
       } finally {
           setIsCompleting(false);
       }
       return;
    }

    setSelectedTransaction(transaction);
    setPin("");
    setPin2("");
    
    // If step 1 is done, move to step 2 directly
    if (transaction.verification_step === 1) {
       setPinStep(2);
    } else {
       setPinStep(1);
    }
    setIsPinDialogOpen(true);
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTransaction) return;

    // Case 1: Transaction is already at Step 1 (PIN 1 verified)
    if (selectedTransaction.verification_step === 1) {
       if (pin2.length !== 4 || !/^\d{4}$/.test(pin2)) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Second PIN must be exactly 4 digits",
          });
          return;
       }
       
       setIsCompleting(true);
       setError(null);
       
       try {
           // Pass pin2 as the first argument because backend expects it there when step=1
           await accountService.completePendingWireTransfer(selectedTransaction.id, pin2);
           
           toast({
             title: "Success",
             description: "Transaction completed successfully",
           });

           setIsPinDialogOpen(false);
            setPin("");
            setPin2("");
            setPinStep(1);
            setSelectedTransaction(null);
            fetchPendingTransactions();
        } catch (err: any) {
           setError(err.message);
           toast({
             variant: "destructive",
             title: "Error",
             description: err.message,
           });
       } finally {
           setIsCompleting(false);
       }
       return;
    }

    // Case 2: Transaction is at Step 0 (Start from beginning)
    if (pinStep === 1) {
      if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "PIN must be exactly 4 digits",
        });
        return;
      }

      // If user has PIN 2, move to next step
      if (user?.has_pin_2) {
        setPinStep(2);
        return;
      }
    } else {
      if (pin2.length !== 4 || !/^\d{4}$/.test(pin2)) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Second PIN must be exactly 4 digits",
        });
        return;
      }
    }

    setIsCompleting(true);
    setError(null);

    try {
      await accountService.completePendingWireTransfer(selectedTransaction.id, pin, pin2);

      router.push("/transfer-success");
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    } finally {
      setIsCompleting(false);
    }
  };

  if (isLoading) {
    return <div className="text-lg">Loading pending transactions...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <CardTitle>Pending Transactions</CardTitle>
          </div>
          <CardDescription>
            Complete your pending wire transfers by entering your PIN
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {pendingTransactions.filter(t => !t.status || t.status === 'pending').length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No pending transactions</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>From Account</TableHead>
                  <TableHead>To Account</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingTransactions.filter(t => !t.status || t.status === 'pending').map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <Badge variant="outline">{transaction.transaction_type}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      ${parseFloat(transaction.amount).toFixed(2)}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {transaction.account.account_number}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {transaction.recipient_account?.account_number || 
                       (transaction.transaction_type === 'wire_transfer' ? 'External' : "-")}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {transaction.description || "-"}
                    </TableCell>
                    <TableCell>
                      {new Date(transaction.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {!transaction.status || transaction.status === 'pending' ? (
                        <Badge variant="secondary">Pending</Badge>
                      ) : transaction.status === 'approved' ? (
                        <Badge variant="default">Approved</Badge>
                      ) : transaction.status === 'rejected' ? (
                        <Badge variant="destructive">Rejected</Badge>
                      ) : (
                        <Badge variant="outline">{transaction.status}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {!transaction.status || transaction.status === 'pending' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCompleteTransaction(transaction)}
                        >
                          <Lock className="h-4 w-4 mr-2" />
                          Continue
                        </Button>
                      ) : transaction.status === 'approved' ? (
                        <span className="text-sm text-muted-foreground">Completed</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Cancelled</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isPinDialogOpen} onOpenChange={setIsPinDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pinStep === 1 ? "Continue Transaction" : "Enter Second PIN"}
            </DialogTitle>
            <DialogDescription>
              {pinStep === 1 
                ? "Enter your 4-digit PIN to approve and complete this transfer."
                : "Please enter your second security PIN to finalize the transfer."}
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Transaction Details:</p>
                <p className="text-sm">Amount: <span className="font-semibold">${parseFloat(selectedTransaction.amount).toFixed(2)}</span></p>
                <p className="text-sm">From: <span className="font-mono">{selectedTransaction.account.account_number}</span></p>
                {selectedTransaction.recipient_account && (
                  <p className="text-sm">To: <span className="font-mono">{selectedTransaction.recipient_account.account_number}</span></p>
                )}
              </div>
              <form onSubmit={handlePinSubmit} className="space-y-4">
                {pinStep === 1 ? (
                  <div>
                    <Label htmlFor="pin">4-Digit PIN</Label>
                    <Input
                      id="pin"
                      type="password"
                      maxLength={4}
                      value={pin}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setPin(value);
                      }}
                      placeholder="0000"
                      required
                      className="font-mono text-center text-2xl tracking-widest"
                      autoFocus
                    />
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="pin2">Second 4-Digit PIN</Label>
                    <Input
                      id="pin2"
                      type="password"
                      maxLength={4}
                      value={pin2}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setPin2(value);
                      }}
                      placeholder="0000"
                      required
                      className="font-mono text-center text-2xl tracking-widest"
                      autoFocus
                    />
                  </div>
                )}
                
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsPinDialogOpen(false);
                      setPin("");
                      setPin2("");
                      setPinStep(1);
                      setSelectedTransaction(null);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isCompleting || (pinStep === 1 ? pin.length !== 4 : pin2.length !== 4)}
                    className="flex-1"
                  >
                    {isCompleting 
                      ? "Processing..." 
                      : (pinStep === 1 && user?.has_pin_2 ? "Next" : "Complete Transfer")}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

