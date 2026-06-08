"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { cryptoWalletService, accountService, depositRequestService } from "@/lib/supabase-services";
import { supabase } from "@/lib/supabase";
import { Copy, Check, Wallet, AlertCircle, Send } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface CryptoWallet {
  id: number;
  name: string;
  symbol: string;
  wallet_address: string;
  logo_url: string | null;
  network: string | null;
  display_order: number;
}

interface Account {
  id: number;
  account_type: { name: string };
  account_number: string;
  balance: string;
}

export default function DepositPage() {
  const [wallets, setWallets] = useState<CryptoWallet[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [selectedWalletId, setSelectedWalletId] = useState<number | null>(null);
  const [submitForm, setSubmitForm] = useState({
    account_id: "",
    crypto_wallet_id: "",
    amount: "",
    transaction_hash: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      // Fetch wallets and accounts separately to handle errors better
      let walletsData: any[] = [];
      let accountsData: any[] = [];

      try {
        walletsData = await cryptoWalletService.getActiveCryptoWallets();
        setWallets(walletsData as CryptoWallet[]);
      } catch (walletErr: any) {
        console.error("Error fetching wallets:", walletErr);
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to load crypto wallets: ${walletErr.message}`,
        });
      }

      try {
        accountsData = await accountService.getAccounts();
        console.log("Raw accounts data:", accountsData);
        
        // Map accounts properly - handle both string and number balance
        const mappedAccounts = (accountsData || []).map((acc: any) => ({
          id: acc.id,
          account_type: acc.account_type || { name: "Account" },
          account_number: acc.account_number,
          balance: typeof acc.balance === 'string' ? acc.balance : (acc.balance || 0).toString(),
        }));
        
        setAccounts(mappedAccounts);
        
        // Debug: log if accounts are empty
        if (mappedAccounts.length === 0) {
          console.warn("No accounts found for user");
        } else {
          console.log("Accounts loaded:", mappedAccounts.length, mappedAccounts);
        }
      } catch (accountErr: any) {
        console.error("Error fetching accounts:", accountErr);
        setAccounts([]);
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to load accounts: ${accountErr.message}`,
        });
      }
    } catch (err: any) {
      console.error("Error fetching wallets/accounts:", err);
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

  const handleCopyAddress = async (address: string, walletId: number) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedId(walletId);
      toast({
        title: "Copied!",
        description: "Wallet address copied to clipboard",
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy address",
      });
    }
  };

  const handleOpenSubmitDialog = (walletId: number) => {
    setSelectedWalletId(walletId);
    const wallet = wallets.find(w => w.id === walletId);
    setSubmitForm({
      account_id: "",
      crypto_wallet_id: walletId.toString(),
      amount: "",
      transaction_hash: "",
    });
    setIsSubmitDialogOpen(true);
  };

  const handleSubmitDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitForm.account_id || !submitForm.crypto_wallet_id || !submitForm.amount) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields",
      });
      return;
    }

    const amountNum = parseFloat(submitForm.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid amount",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedWallet = wallets.find(w => w.id === parseInt(submitForm.crypto_wallet_id));
      await depositRequestService.createDepositRequest({
        account_id: parseInt(submitForm.account_id),
        crypto_wallet_id: parseInt(submitForm.crypto_wallet_id),
        amount: amountNum,
        crypto_symbol: selectedWallet?.symbol || "",
        transaction_hash: submitForm.transaction_hash || undefined,
      });

      toast({
        title: "Success",
        description: "Deposit request submitted successfully. It will be reviewed by admin.",
      });

      setIsSubmitDialogOpen(false);
      setSubmitForm({
        account_id: "",
        crypto_wallet_id: "",
        amount: "",
        transaction_hash: "",
      });
      setSelectedWalletId(null);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-lg">Loading deposit options...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            <CardTitle>Deposit Funds</CardTitle>
          </div>
          <CardDescription>
            Copy the crypto wallet address below and send your funds. Your account will be credited once the transaction is confirmed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {wallets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No deposit options available at the moment.</p>
              <p className="text-sm mt-2">Please check back later or contact support.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {wallets.map((wallet) => (
                <Card key={wallet.id} className="relative">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {wallet.logo_url ? (
                          <img
                            src={wallet.logo_url}
                            alt={wallet.name}
                            className="h-12 w-12 rounded-full object-cover"
                            onError={(e) => {
                              // Fallback if image fails to load
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                            {wallet.symbol.slice(0, 2)}
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-lg">{wallet.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{wallet.symbol}</Badge>
                            {wallet.network && (
                              <Badge variant="secondary" className="text-xs">
                                {wallet.network}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-1 block">
                          Wallet Address
                        </label>
                        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                          <code className="flex-1 text-xs font-mono break-all">
                            {wallet.wallet_address}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyAddress(wallet.wallet_address, wallet.id)}
                            className="shrink-0"
                          >
                            {copiedId === wallet.id ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          Make sure you're sending <strong>{wallet.symbol}</strong> to this address.
                          {wallet.network && ` Network: ${wallet.network}`}
                        </AlertDescription>
                      </Alert>

                      <Button
                        variant="outline"
                        className="w-full mt-3"
                        onClick={() => handleOpenSubmitDialog(wallet.id)}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        I've Sent the Funds
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Important Instructions:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Only send the exact cryptocurrency type shown (e.g., BTC to Bitcoin address)</li>
              <li>Double-check the wallet address before sending</li>
              <li>After sending, click "I've Sent the Funds" to submit your deposit request</li>
              <li>Your deposit will be reviewed and approved by admin</li>
              <li>Transactions may take a few minutes to confirm</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Deposit Request</DialogTitle>
            <DialogDescription>
              Fill in the details of your crypto deposit. Admin will review and approve it.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitDeposit} className="space-y-4">
            <div>
              <Label htmlFor="account">Select Account *</Label>
              <Select
                value={submitForm.account_id}
                onValueChange={(value) =>
                  setSubmitForm({ ...submitForm, account_id: value })
                }
                required
              >
                <SelectTrigger id="account">
                  <SelectValue placeholder="Select account to credit" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.length === 0 ? (
                    <SelectItem value="no-accounts" disabled>
                      No accounts available
                    </SelectItem>
                  ) : (
                    accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id.toString()}>
                        {account.account_type?.name || "Account"} - {account.account_number} (${parseFloat(account.balance || "0").toFixed(2)})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {accounts.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  You don't have any active accounts. Please create an account first.
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="crypto">Cryptocurrency</Label>
              <Input
                id="crypto"
                value={wallets.find(w => w.id === selectedWalletId)?.name || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {wallets.find(w => w.id === selectedWalletId)?.symbol} - {wallets.find(w => w.id === selectedWalletId)?.network || "N/A"}
              </p>
            </div>

            <div>
              <Label htmlFor="amount">Amount (USD) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={submitForm.amount}
                onChange={(e) =>
                  setSubmitForm({ ...submitForm, amount: e.target.value })
                }
                placeholder="0.00"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter the USD equivalent of the crypto you sent
              </p>
            </div>

            <div>
              <Label htmlFor="transaction_hash">Transaction Hash (Optional)</Label>
              <Input
                id="transaction_hash"
                value={submitForm.transaction_hash}
                onChange={(e) =>
                  setSubmitForm({ ...submitForm, transaction_hash: e.target.value })
                }
                placeholder="Enter blockchain transaction hash if available"
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground mt-1">
                This helps verify your transaction faster
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSubmitDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

