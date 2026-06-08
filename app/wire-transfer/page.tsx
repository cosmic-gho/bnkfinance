"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { accountService, categoryService, userService } from "@/lib/supabase-services";
import { supabase } from "@/lib/supabase";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Lock } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

export default function WireTransferPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sourceAccountId, setSourceAccountId] = useState<string>("");
  const [recipientAccountNumber, setRecipientAccountNumber] = useState<string>("");
  const [bankName, setBankName] = useState<string>("");
  const [bankAddress, setBankAddress] = useState<string>("");
  const [sortCode, setSortCode] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [pin, setPin] = useState<string>("");
  const [pin2, setPin2] = useState<string>("");
  const [pinStep, setPinStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const [isWarningDialogOpen, setIsWarningDialogOpen] = useState(false);
  const [pendingTransactionId, setPendingTransactionId] = useState<number | null>(null);
  const [user, setUser] = useState<{ can_transfer?: boolean; has_pin_2?: boolean } | null>(null);
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
        
        // Set user data - if null, we'll check in the backend
        setUser(userData);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if transfer is disabled for this user
    if (user && user.can_transfer === false) {
      setIsWarningDialogOpen(true);
      return;
    }
    
    if (!sourceAccountId || !recipientAccountNumber || !bankName || !bankAddress || !sortCode || !amount) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields",
      });
      return;
    }

    const amountNum = parseFloat(amount);
    if (amountNum <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Amount must be greater than 0",
      });
      return;
    }

    // Show PIN dialog to start Stage 1
    setIsPinDialogOpen(true);
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (pinStep === 1) {
      if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "PIN must be exactly 4 digits",
        });
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Create pending transaction with PIN (Stage 1)
        const transactionId = await accountService.createPendingWireTransfer(
          parseInt(sourceAccountId),
          recipientAccountNumber,
          parseFloat(amount),
          description || 'Wire Transfer',
          categoryId ? parseInt(categoryId) : undefined,
          {
            bank_name: bankName,
            bank_address: bankAddress,
            sort_code: sortCode,
          },
          pin
        );

        setPendingTransactionId(transactionId);

        // If user has PIN 2, move to next step immediately
        if (user?.has_pin_2) {
          setPinStep(2);
          setPin(""); // Clear PIN 1
          toast({
            title: "Stage 1 Verified",
            description: "Please enter your second PIN to complete the transfer.",
          });
          setIsLoading(false);
          return;
        }

        // If no PIN 2 required, finalize immediately
        await accountService.completePendingWireTransfer(transactionId, "SKIP");

        toast({
          title: "Success",
          description: "Wire transfer completed successfully",
        });

        // Reset form and redirect
        setSourceAccountId("");
        setRecipientAccountNumber("");
        setBankName("");
        setBankAddress("");
        setSortCode("");
        setAmount("");
        setDescription("");
        setCategoryId("");
        setPin("");
        setPin2("");
        setPinStep(1);
        setPendingTransactionId(null);
        setIsPinDialogOpen(false);
        
      } catch (err: any) {
        setError(err.message);
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message,
        });
        setIsLoading(false);
      }
    } else {
      // Step 2
      if (pin2.length !== 4 || !/^\d{4}$/.test(pin2)) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Second PIN must be exactly 4 digits",
        });
        return;
      }

      if (!pendingTransactionId) {
        setError("Transaction ID missing");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Finalize with PIN 2
        await accountService.completePendingWireTransfer(pendingTransactionId, pin2);

        toast({
          title: "Success",
          description: "Wire transfer completed successfully",
        });

        // Reset form and redirect
        setSourceAccountId("");
        setRecipientAccountNumber("");
        setBankName("");
        setBankAddress("");
        setSortCode("");
        setAmount("");
        setDescription("");
        setCategoryId("");
        setPin("");
        setPin2("");
        setPinStep(1);
        setPendingTransactionId(null);
        setIsPinDialogOpen(false);
        
        router.push("/dashboard");
      } catch (err: any) {
        setError(err.message);
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message,
        });
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            <CardTitle>Wire Transfer</CardTitle>
          </div>
          <CardDescription>
            Transfer funds to any account. You'll be asked to enter your PIN after submitting the form.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="source_account">From Account</Label>
              <Select 
                value={sourceAccountId} 
                onValueChange={setSourceAccountId}
                required
              >
                <SelectTrigger id="source_account">
                  <SelectValue placeholder="Select your account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.account_type.name} - {account.account_number} (${parseFloat(account.balance).toFixed(2)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="recipient_account">Recipient Account Number</Label>
              <Input
                id="recipient_account"
                value={recipientAccountNumber}
                onChange={(e) => setRecipientAccountNumber(e.target.value.toUpperCase())}
                placeholder="Enter recipient account number"
                required
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter the full account number of the recipient
              </p>
            </div>

            <div>
              <Label htmlFor="bank_name">Bank Name</Label>
              <Input
                id="bank_name"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Enter bank name"
                required
              />
            </div>

            <div>
              <Label htmlFor="bank_address">Bank Address</Label>
              <Textarea
                id="bank_address"
                value={bankAddress}
                onChange={(e) => setBankAddress(e.target.value)}
                placeholder="Enter bank address (street, city, country)"
                required
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="sort_code">Sort Code</Label>
              <Input
                id="sort_code"
                value={sortCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setSortCode(value);
                }}
                placeholder="000000"
                required
                className="font-mono"
                maxLength={6}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter 6-digit sort code
              </p>
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
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Transfer description"
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

            <Button 
              type="submit" 
              disabled={
                isLoading || 
                !sourceAccountId || 
                !recipientAccountNumber || 
                !bankName || 
                !bankAddress || 
                !sortCode || 
                !amount
              } 
              className="w-full"
            >
              {isLoading ? "Creating Transaction..." : "Create Wire Transfer"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Dialog open={isPinDialogOpen} onOpenChange={(open) => {
        setIsPinDialogOpen(open);
        if (!open) {
          // If closed during process, reset but warn if transaction was created
          setPin("");
          setPin2("");
          setPinStep(1);
          if (pendingTransactionId) {
             toast({
                title: "Transaction Pending",
                description: "Transaction was created but not finalized. You can complete it in Pending Transactions.",
             });
          }
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pinStep === 1 ? "Enter PIN to Complete Transfer" : "Enter Second PIN"}
            </DialogTitle>
            <DialogDescription>
              {pinStep === 1 
                ? "Enter your 4-digit PIN to approve and complete the wire transfer." 
                : "Please enter your second security PIN to finalize the transfer."}
            </DialogDescription>
          </DialogHeader>
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
                <p className="text-xs text-muted-foreground mt-1">
                  Enter your 4-digit transfer PIN
                </p>
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
                <p className="text-xs text-muted-foreground mt-1">
                  Enter your second security PIN
                </p>
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
                  if (pendingTransactionId) {
                    toast({
                        title: "Transaction Pending",
                        description: "Transaction was created but not finalized. You can complete it in Pending Transactions.",
                    });
                  }
                }}
                className="flex-1"
              >
                Complete Later
              </Button>
              <Button
                type="submit"
                disabled={isLoading || (pinStep === 1 ? pin.length !== 4 : pin2.length !== 4)}
                className="flex-1"
              >
                {isLoading 
                  ? "Processing..." 
                  : (pinStep === 1 && user?.has_pin_2 ? "Next" : "Complete Transfer")}
              </Button>
            </div>
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
                You are unable to make wire transfers at this time. Please contact the bank via live chat to resolve this issue.
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

