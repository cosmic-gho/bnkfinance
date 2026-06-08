"use client";

import { useEffect, useState } from "react";
import { adminTransactionService, adminAccountService } from "@/lib/admin-services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Check, X, AlertCircle, Calendar } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Transaction {
  id: number;
  transaction_type: string;
  amount: string;
  description: string;
  timestamp: string;
  status?: string;
  category: {
    id: number;
    name: string;
  } | null;
  account: {
    id: number;
    account_number: string;
    user: {
      id: string;
      username: string;
      first_name: string;
      last_name: string;
    };
  };
  recipient_account: {
    id: number;
    account_number: string;
    user: {
      id: string;
      username: string;
      first_name: string;
      last_name: string;
    };
  } | null;
}

interface Account {
  id: number;
  account_number: string;
  user?: {
    first_name: string;
    last_name: string;
  };
}

interface Category {
  id: number;
  name: string;
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);
  const [dateForm, setDateForm] = useState({ date: "", time: "" });
  const [createForm, setCreateForm] = useState({
    transaction_type: "deposit",
    account_id: "",
    recipient_account_id: "",
    amount: "",
    category_id: "",
    description: "",
    pin: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchTransactions();
    fetchAccounts();
    fetchCategories();
  }, [filterType]);

  const fetchAccounts = async () => {
    try {
      const data = await adminAccountService.getAllAccounts();
      setAccounts(data as Account[]);
    } catch (err: any) {
      console.error("Error fetching accounts:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await adminTransactionService.getTransactionCategories();
      setCategories(data as Category[]);
    } catch (err: any) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const filters: any = {};
      if (filterType !== "all") {
        filters.transaction_type = filterType;
      }
      if (filterStatus !== "all") {
        filters.status = filterStatus;
      }
      const data = await adminTransactionService.getAllTransactions(filters);
      setTransactions(data as Transaction[]);
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

  const handleReviewTransaction = (transaction: Transaction, action: "approve" | "reject") => {
    console.log('Review transaction clicked:', { transactionId: transaction.id, action, transaction });
    try {
      setSelectedTransaction(transaction);
      setReviewAction(action);
      setAdminNotes("");
      setIsReviewDialogOpen(true);
      console.log('Dialog should be open now');
    } catch (error) {
      console.error('Error opening review dialog:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to open review dialog",
      });
    }
  };

  const handleConfirmReview = async () => {
    if (!selectedTransaction || !reviewAction) {
      console.error('Missing selectedTransaction or reviewAction');
      return;
    }

    console.log('Confirming review:', { 
      transactionId: selectedTransaction.id, 
      action: reviewAction,
      hasNotes: !!adminNotes 
    });

    if (reviewAction === "reject" && !adminNotes.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Admin notes are required when rejecting a transaction",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Map reviewAction to the correct status value expected by the database
      const status = reviewAction === "approve" ? "approved" : "rejected";
      
      console.log('Calling updateTransactionStatus...');
      const result = await adminTransactionService.updateTransactionStatus(
        selectedTransaction.id,
        status,
        adminNotes || undefined
      );
      console.log('Transaction status updated:', result);

      toast({
        title: "Success",
        description: `Transaction ${reviewAction === "approve" ? "approved" : "rejected"} successfully`,
      });

      setIsReviewDialogOpen(false);
      setSelectedTransaction(null);
      setReviewAction(null);
      setAdminNotes("");
      fetchTransactions();
    } catch (err: any) {
      console.error('Error updating transaction status:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || 'Failed to update transaction status',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditDate = (transaction: Transaction) => {
    const date = new Date(transaction.timestamp);
    const dateStr = date.toISOString().split('T')[0];
    const timeStr = date.toTimeString().split(' ')[0].slice(0, 5); // HH:MM format
    
    setSelectedTransaction(transaction);
    setDateForm({ date: dateStr, time: timeStr });
    setIsDateDialogOpen(true);
  };

  const handleSaveDate = async () => {
    if (!selectedTransaction) return;

    try {
      const dateTime = `${dateForm.date}T${dateForm.time}:00`;
      const isoDate = new Date(dateTime).toISOString();
      
      await adminTransactionService.updateTransactionDate(selectedTransaction.id, isoDate);
      
      toast({
        title: "Success",
        description: "Transaction date updated successfully",
      });
      
      setIsDateDialogOpen(false);
      setSelectedTransaction(null);
      setDateForm({ date: "", time: "" });
      fetchTransactions();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || 'Failed to update transaction date',
      });
    }
  };

  const handleCreateTransaction = async () => {
    if (!createForm.account_id || !createForm.amount) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select an account and enter an amount",
      });
      return;
    }

    // Require recipient account for transfer and local_transfer (internal transfers)
    // Wire transfers are external, so recipient account is optional
    if ((createForm.transaction_type === "transfer" || 
         createForm.transaction_type === "local_transfer") && 
        !createForm.recipient_account_id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a recipient account for internal transfers",
      });
      return;
    }

    // Require PIN for local_transfer and wire_transfer
    if ((createForm.transaction_type === "local_transfer" || 
         createForm.transaction_type === "wire_transfer") && 
        (!createForm.pin || createForm.pin.length !== 4)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a 4-digit PIN for this transfer",
      });
      return;
    }

    if (parseFloat(createForm.amount) <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Amount must be greater than 0",
      });
      return;
    }

    try {
      setIsCreating(true);
      await adminTransactionService.createTransaction({
        account_id: parseInt(createForm.account_id),
        transaction_type: createForm.transaction_type as 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'local_transfer' | 'wire_transfer',
        amount: parseFloat(createForm.amount),
        description: createForm.description || undefined,
        category_id: createForm.category_id ? parseInt(createForm.category_id) : null,
        recipient_account_id:
          (createForm.transaction_type === "transfer" || 
           createForm.transaction_type === "local_transfer" || 
           createForm.transaction_type === "payment") && createForm.recipient_account_id
            ? parseInt(createForm.recipient_account_id)
            : null, // Wire transfers are external, so recipient_account_id is null
        pin: (createForm.transaction_type === "local_transfer" || createForm.transaction_type === "wire_transfer") 
          ? createForm.pin 
          : undefined,
      });
      toast({
        title: "Success",
        description: "Transaction created successfully",
      });
      setIsCreateDialogOpen(false);
      setCreateForm({
        transaction_type: "deposit",
        account_id: "",
        recipient_account_id: "",
        amount: "",
        category_id: "",
        description: "",
        pin: "",
      });
      fetchTransactions();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to create transaction",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case "deposit":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "withdrawal":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "transfer":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  if (isLoading) {
    return <div className="text-lg">Loading transactions...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Transaction Management</h1>
        <div className="flex gap-3">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="deposit">Deposits</SelectItem>
              <SelectItem value="withdrawal">Withdrawals</SelectItem>
              <SelectItem value="transfer">Transfers</SelectItem>
              <SelectItem value="local_transfer">Local Transfers</SelectItem>
              <SelectItem value="wire_transfer">Wire Transfers</SelectItem>
              <SelectItem value="payment">Payments</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Dialog 
            open={isCreateDialogOpen} 
            onOpenChange={(open) => {
              setIsCreateDialogOpen(open);
              if (open) {
                fetchAccounts();
                fetchCategories();
              }
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Transaction</DialogTitle>
                <DialogDescription>Create a transaction for any account</DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCreateTransaction();
                }}
                className="space-y-4"
              >
                <div>
                  <Label>Transaction Type</Label>
                  <Select
                    value={createForm.transaction_type}
                    onValueChange={(value) =>
                      setCreateForm({ ...createForm, transaction_type: value, recipient_account_id: "", pin: "" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deposit">Deposit</SelectItem>
                      <SelectItem value="withdrawal">Withdrawal</SelectItem>
                      <SelectItem value="transfer">Transfer (Legacy)</SelectItem>
                      <SelectItem value="local_transfer">Local Transfer (Requires PIN)</SelectItem>
                      <SelectItem value="wire_transfer">Wire Transfer (Requires PIN)</SelectItem>
                      <SelectItem value="payment">Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Account</Label>
                  <Select
                    value={createForm.account_id}
                    onValueChange={(value) =>
                      setCreateForm({ ...createForm, account_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.account_number}
                          {account.user && ` - ${account.user.first_name} ${account.user.last_name}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {(createForm.transaction_type === "transfer" || 
                  createForm.transaction_type === "local_transfer" || 
                  createForm.transaction_type === "payment") && (
                  <div>
                    <Label>Recipient Account {createForm.transaction_type === "payment" ? "(Optional)" : "(Required)"}</Label>
                    <Select
                      value={createForm.recipient_account_id}
                      onValueChange={(value) =>
                        setCreateForm({ ...createForm, recipient_account_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select recipient account" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts
                          .filter((acc) => acc.id.toString() !== createForm.account_id)
                          .map((account) => (
                            <SelectItem key={account.id} value={account.id.toString()}>
                              {account.account_number}
                              {account.user && ` - ${account.user.first_name} ${account.user.last_name}`}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {createForm.transaction_type === "wire_transfer" && (
                  <div>
                    <Label>Recipient Account (External - Optional)</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Wire transfers are to external banks. Recipient account is stored in the transaction description.
                    </p>
                  </div>
                )}

                {(createForm.transaction_type === "local_transfer" || 
                  createForm.transaction_type === "wire_transfer") && (
                  <div>
                    <Label>4-Digit PIN (Required)</Label>
                    <Input
                      type="password"
                      maxLength={4}
                      value={createForm.pin}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setCreateForm({ ...createForm, pin: value });
                      }}
                      placeholder="0000"
                      className="font-mono text-center text-2xl tracking-widest"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter the user's 4-digit transfer PIN
                    </p>
                  </div>
                )}

                <div>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={createForm.amount}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, amount: e.target.value })
                    }
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <Label>Category (Optional)</Label>
                  <Select
                    value={createForm.category_id || undefined}
                    onValueChange={(value) =>
                      setCreateForm({ ...createForm, category_id: value || "" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Description (Optional)</Label>
                  <Textarea
                    value={createForm.description}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, description: e.target.value })
                    }
                    placeholder="Transaction description"
                    rows={3}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    isCreating ||
                    !createForm.account_id ||
                    !createForm.amount ||
                    ((createForm.transaction_type === "transfer" || 
                      createForm.transaction_type === "local_transfer" || 
                      createForm.transaction_type === "wire_transfer") && 
                     !createForm.recipient_account_id) ||
                    ((createForm.transaction_type === "local_transfer" || 
                      createForm.transaction_type === "wire_transfer") && 
                     createForm.pin.length !== 4)
                  }
                >
                  {isCreating ? "Creating Transaction..." : "Create Transaction"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Transactions ({transactions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-mono">{transaction.id}</TableCell>
                  <TableCell>
                    <Badge className={getTransactionTypeColor(transaction.transaction_type)}>
                      {transaction.transaction_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">
                    ${parseFloat(transaction.amount).toFixed(2)}
                  </TableCell>
                  <TableCell>{transaction.description || "-"}</TableCell>
                  <TableCell>
                    {transaction.category ? (
                      <Badge variant="outline">{transaction.category.name}</Badge>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-mono">****{transaction.account.account_number.slice(-4)}</div>
                      <div className="text-muted-foreground">
                        {transaction.account.user.first_name} {transaction.account.user.last_name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {transaction.recipient_account ? (
                      <div className="text-sm">
                        <div className="font-mono">****{transaction.recipient_account.account_number.slice(-4)}</div>
                        <div className="text-muted-foreground">
                          {transaction.recipient_account.user.first_name} {transaction.recipient_account.user.last_name}
                        </div>
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {transaction.status ? (
                      transaction.status === 'pending' ? (
                        <Badge variant="secondary">Pending</Badge>
                      ) : transaction.status === 'approved' ? (
                        <Badge variant="default">Approved</Badge>
                      ) : transaction.status === 'rejected' ? (
                        <Badge variant="destructive">Rejected</Badge>
                      ) : (
                        <Badge variant="outline">{transaction.status}</Badge>
                      )
                    ) : (
                      <Badge variant="default">Approved</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {new Date(transaction.timestamp).toLocaleString()}
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleEditDate(transaction);
                        }}
                        title="Edit Date"
                        className="h-6 w-6 p-0"
                      >
                        <Calendar className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    {(!transaction.status || transaction.status === 'pending') ? (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Approve button clicked:', transaction.id);
                            handleReviewTransaction(transaction, "approve");
                          }}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Reject button clicked:', transaction.id);
                            handleReviewTransaction(transaction, "reject");
                          }}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {transaction.status === 'approved' ? 'Approved' : 
                         transaction.status === 'rejected' ? 'Rejected' : 
                         transaction.status}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === "approve" ? "Approve" : "Reject"} Transaction
            </DialogTitle>
            <DialogDescription>
              {reviewAction === "approve"
                ? "This will process the transaction and update account balances. Are you sure?"
                : "Please provide a reason for rejecting this transaction."}
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Transaction ID:</span> {selectedTransaction.id}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Type:</span> {selectedTransaction.transaction_type}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Amount:</span> $
                  {parseFloat(selectedTransaction.amount).toFixed(2)}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Account:</span> {selectedTransaction.account.account_number}
                </div>
                <div className="text-sm">
                  <span className="font-medium">User:</span> {selectedTransaction.account.user.first_name} {selectedTransaction.account.user.last_name}
                </div>
                {selectedTransaction.recipient_account && (
                  <div className="text-sm">
                    <span className="font-medium">Recipient:</span> {selectedTransaction.recipient_account.account_number}
                  </div>
                )}
              </div>

              {reviewAction === "reject" && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Admin notes are required when rejecting a transaction.
                  </AlertDescription>
                </Alert>
              )}

              <div>
                <Label htmlFor="admin_notes">
                  Admin Notes {reviewAction === "reject" ? "*" : "(Optional)"}
                </Label>
                <Textarea
                  id="admin_notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder={
                    reviewAction === "approve"
                      ? "Optional notes for the user..."
                      : "Reason for rejection (required)..."
                  }
                  rows={4}
                  required={reviewAction === "reject"}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsReviewDialogOpen(false);
                    setSelectedTransaction(null);
                    setReviewAction(null);
                    setAdminNotes("");
                  }}
                  className="flex-1"
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant={reviewAction === "approve" ? "default" : "destructive"}
                  onClick={handleConfirmReview}
                  className="flex-1"
                  disabled={isProcessing || (reviewAction === "reject" && !adminNotes.trim())}
                >
                  {isProcessing
                    ? "Processing..."
                    : reviewAction === "approve"
                    ? "Approve Transaction"
                    : "Reject Transaction"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDateDialogOpen} onOpenChange={setIsDateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Transaction Date</DialogTitle>
            <DialogDescription>
              Update the date and time for transaction #{selectedTransaction?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={dateForm.date}
                    onChange={(e) => setDateForm({ ...dateForm, date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={dateForm.time}
                    onChange={(e) => setDateForm({ ...dateForm, time: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Current date: {new Date(selectedTransaction.timestamp).toLocaleString()}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDateDialogOpen(false);
                    setSelectedTransaction(null);
                    setDateForm({ date: "", time: "" });
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveDate}
                  className="flex-1"
                  disabled={!dateForm.date || !dateForm.time}
                >
                  Update Date
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


