"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { accountService, categoryService, userService } from "@/lib/supabase-services";
import { supabase } from "@/lib/supabase";
import { AlertTriangle } from "lucide-react";

interface Account {
  id: number;
  account_type: { name: string };
  account_number: string;
  balance: string;
}

interface Category {
  id: number;
  name: string;
}


export default function Transactions() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sourceAccountId, setSourceAccountId] = useState<string>("");
  const [recipientAccountId, setRecipientAccountId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [withdrawalMethod, setWithdrawalMethod] = useState<string>("");
  const [cashappHandle, setCashappHandle] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [routingNumber, setRoutingNumber] = useState<string>("");
  const [iban, setIban] = useState<string>("");
  const [sortCode, setSortCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otpCode, setOtpCode] = useState<string>("");
  const [otpStage, setOtpStage] = useState<number>(1);
  const [transactionId, setTransactionId] = useState<number | null>(null);
  const [withdrawalStatus, setWithdrawalStatus] = useState<string>("");
  const [isWarningDialogOpen, setIsWarningDialogOpen] = useState(false);
  const [user, setUser] = useState<{ can_transfer?: boolean } | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push("/login");
          return;
        }

        const [accountsData, categoriesData, userData] = await Promise.all([
          accountService.getAccounts(),
          categoryService.getCategories(),
          userService.getCurrentUser(),
        ]);
        
        if (userData) {
          setUser(userData);
        }

        setAccounts(accountsData.map(acc => ({
          id: acc.id,
          account_type: acc.account_type,
          account_number: acc.account_number,
          balance: acc.balance,
        })));
        setCategories(categoriesData);
      } catch (err: any) {
        setError("Failed to load data");
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message,
        });
      }
    };

    fetchData();
  }, [router, toast]);

  const handleSubmit = async (e: React.FormEvent, action: 'deposit' | 'withdraw' | 'transfer') => {
    e.preventDefault();
    
    // Check if transfer is disabled for this user
    if (action === 'transfer' && user?.can_transfer === false) {
      setIsWarningDialogOpen(true);
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      if (!sourceAccountId || !amount || (action === 'transfer' && !recipientAccountId)) {
        throw new Error("Please fill in all required fields");
      }

      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error("Amount must be a positive number");
      }

      if (action === 'transfer' && sourceAccountId === recipientAccountId) {
        throw new Error("Source and recipient accounts must be different");
      }

      if (action === 'withdraw') {
        if (!withdrawalMethod) {
          throw new Error("Please select a withdrawal method");
        }
        if (withdrawalMethod === 'cashapp' && !cashappHandle) {
          throw new Error("Cash App handle is required");
        }
        if (withdrawalMethod === 'local' && (!accountNumber || !routingNumber)) {
          throw new Error("Account number and routing number are required");
        }
        if (withdrawalMethod === 'international' && (!iban || !sortCode)) {
          throw new Error("IBAN and sort code are required");
        }
      }

      const accountIdNum = parseInt(sourceAccountId);
      const categoryIdNum = categoryId ? parseInt(categoryId) : undefined;

      let data;
      if (action === 'deposit') {
        data = await accountService.deposit(accountIdNum, amountNum, description || 'Deposit', categoryIdNum);
      } else if (action === 'withdraw') {
        const bankDetails = {
          method: withdrawalMethod,
          cashapp_handle: withdrawalMethod === 'cashapp' ? cashappHandle : null,
          account_number: withdrawalMethod === 'local' ? accountNumber : null,
          routing_number: withdrawalMethod === 'local' ? routingNumber : null,
          iban: withdrawalMethod === 'international' ? iban : null,
          sort_code: withdrawalMethod === 'international' ? sortCode : null,
        };
        data = await accountService.withdraw(accountIdNum, amountNum, description || 'Withdrawal', categoryIdNum, bankDetails);
      } else if (action === 'transfer') {
        data = await accountService.transfer(accountIdNum, parseInt(recipientAccountId), amountNum, description || 'Transfer', categoryIdNum);
      } else {
        throw new Error('Invalid action');
      }

      if (action === 'withdraw' && data.transaction_id) {
        setTransactionId(data.transaction_id);
        setWithdrawalStatus(data.status || 'pending');
        setOtpStage(1);
        setOtpDialogOpen(true);
      } else {
        toast({
          title: "Success",
          description: `${action.charAt(0).toUpperCase() + action.slice(1)} completed successfully`,
        });

        setAmount("");
        setDescription("");
        setCategoryId("");
        setSourceAccountId("");
        setRecipientAccountId("");
        router.push("/dashboard");
      }
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

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !transactionId) {
        throw new Error("Session expired. Please try again.");
      }

      // Note: OTP verification would need to be implemented via Supabase Edge Functions
      // or a separate verification service. For now, we'll simulate success.
      // In production, you would call a Supabase Edge Function here.
      
      // Simulate OTP verification - replace with actual Supabase Edge Function call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setOtpDialogOpen(false);
      toast({
        title: "OTP Verification Complete",
        description: "Your withdrawal is being processed.",
      });
      setAmount("");
      setDescription("");
      setCategoryId("");
      setSourceAccountId("");
      setRecipientAccountId("");
      setWithdrawalMethod("");
      setCashappHandle("");
      setAccountNumber("");
      setRoutingNumber("");
      setIban("");
      setSortCode("");
      setTransactionId(null);
      router.push("/dashboard");
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

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Account Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md">
              {error}
            </div>
          )}
          <Tabs defaultValue="transfer">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="transfer">Transfer</TabsTrigger>
              <TabsTrigger value="deposit">Deposit</TabsTrigger>
              <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
            </TabsList>
            <TabsContent value="transfer">
              <form onSubmit={(e) => handleSubmit(e, 'transfer')} className="space-y-4">
                <div>
                  <Label htmlFor="source_account">Source Account</Label>
                  <Select value={sourceAccountId} onValueChange={setSourceAccountId} required>
                    <SelectTrigger id="source_account">
                      <SelectValue placeholder="Select source account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.account_type.name} - ****{account.account_number.slice(-4)} ($
                          {parseFloat(account.balance).toFixed(2)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="recipient_account">Recipient Account</Label>
                  <Select value={recipientAccountId} onValueChange={setRecipientAccountId} required>
                    <SelectTrigger id="recipient_account">
                      <SelectValue placeholder="Select recipient account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts
                        .filter((account) => account.id.toString() !== sourceAccountId)
                        .map((account) => (
                          <SelectItem key={account.id} value={account.id.toString()}>
                            {account.account_type.name} - ****{account.account_number.slice(-4)} ($
                            {parseFloat(account.balance).toFixed(2)})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter description"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category (Optional)</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
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
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Transferring..." : "Transfer"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="deposit">
              <form onSubmit={(e) => handleSubmit(e, 'deposit')} className="space-y-4">
                <div>
                  <Label htmlFor="source_account">Account</Label>
                  <Select value={sourceAccountId} onValueChange={setSourceAccountId} required>
                    <SelectTrigger id="source_account">
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.account_type.name} - ****{account.account_number.slice(-4)} ($
                          {parseFloat(account.balance).toFixed(2)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter description"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category (Optional)</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
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
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Depositing..." : "Deposit"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="withdraw">
              <form onSubmit={(e) => handleSubmit(e, 'withdraw')} className="space-y-4">
                <div>
                  <Label htmlFor="source_account">Account</Label>
                  <Select value={sourceAccountId} onValueChange={setSourceAccountId} required>
                    <SelectTrigger id="source_account">
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.account_type.name} - ****{account.account_number.slice(-4)} ($
                          {parseFloat(account.balance).toFixed(2)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="withdrawal_method">Withdrawal Method</Label>
                  <Select value={withdrawalMethod} onValueChange={setWithdrawalMethod} required>
                    <SelectTrigger id="withdrawal_method">
                      <SelectValue placeholder="Select withdrawal method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cashapp">Cash App</SelectItem>
                      <SelectItem value="local">Local Bank</SelectItem>
                      <SelectItem value="international">International Bank</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {withdrawalMethod === 'cashapp' && (
                  <div>
                    <Label htmlFor="cashapp_handle">Cash App Handle</Label>
                    <Input
                      id="cashapp_handle"
                      value={cashappHandle}
                      onChange={(e) => setCashappHandle(e.target.value)}
                      placeholder="Enter Cash App handle (e.g., $username)"
                      required
                    />
                  </div>
                )}
                {withdrawalMethod === 'local' && (
                  <>
                    <div>
                      <Label htmlFor="account_number">Account Number</Label>
                      <Input
                        id="account_number"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="Enter account number"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="routing_number">Routing Number</Label>
                      <Input
                        id="routing_number"
                        value={routingNumber}
                        onChange={(e) => setRoutingNumber(e.target.value)}
                        placeholder="Enter routing number"
                        required
                      />
                    </div>
                  </>
                )}
                {withdrawalMethod === 'international' && (
                  <>
                    <div>
                      <Label htmlFor="iban">IBAN</Label>
                      <Input
                        id="iban"
                        value={iban}
                        onChange={(e) => setIban(e.target.value)}
                        placeholder="Enter IBAN"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="sort_code">Sort Code</Label>
                      <Input
                        id="sort_code"
                        value={sortCode}
                        onChange={(e) => setSortCode(e.target.value)}
                        placeholder="Enter sort code"
                        required
                      />
                    </div>
                  </>
                )}
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter description"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category (Optional)</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
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
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Withdrawing..." : "Withdraw"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={otpDialogOpen} onOpenChange={setOtpDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify OTP - Stage {otpStage}</DialogTitle>
            <DialogDescription>
              Please enter the OTP sent to your email for stage {otpStage} of your withdrawal.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div>
              <Label htmlFor="otp_code">OTP Code</Label>
              <Input
                id="otp_code"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="Enter 6-digit OTP"
                required
              />
            </div>
            {error && (
              <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md">
                {error}
              </div>
            )}
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Verifying..." : "Verify OTP"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isWarningDialogOpen} onOpenChange={setIsWarningDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Transfer Disabled
            </DialogTitle>
            <DialogDescription>
              Your transfer functionality has been disabled by the bank.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-800 dark:text-red-200">
                You are unable to make transfers at this time. Please contact the bank via live chat to resolve this issue.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="default"
                onClick={() => {
                  setIsWarningDialogOpen(false);
                  router.push("/dashboard");
                }}
                className="flex-1"
              >
                Go to Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsWarningDialogOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}