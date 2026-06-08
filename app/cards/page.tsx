"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cardRequestService, accountService } from "@/lib/supabase-services";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreditCard,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Wallet,
  Shield,
  Globe,
  Sliders,
  Zap,
} from "lucide-react";

interface Account {
  id: number;
  account_number: string;
  account_type: { name: string };
  balance: string;
}

interface CardRequest {
  id: number;
  account_id: number;
  card_type: "virtual" | "physical";
  card_tier: "standard" | "gold" | "platinum";
  card_number: string | null;
  expiry_month: string | null;
  expiry_year: string | null;
  cvv: string | null;
  card_holder_name: string | null;
  daily_limit: string;
  status: "pending" | "approved" | "rejected" | "cancelled" | "issued";
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
  account: {
    id: number;
    account_number: string;
    account_type: { name: string };
  };
}

export default function CardsPage() {
  const [cardRequests, setCardRequests] = useState<CardRequest[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [revealedCVV, setRevealedCVV] = useState<{ [key: number]: boolean }>({});
  const { toast } = useToast();
  const router = useRouter();

  const [formData, setFormData] = useState({
    account_id: "",
    card_type: "virtual" as "virtual" | "physical",
    card_tier: "standard" as "standard" | "gold" | "platinum",
    card_holder_name: "",
    daily_limit: "1000",
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      fetchData();
    };
    checkAuth();
  }, [router]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [requestsData, accountsData] = await Promise.all([
        cardRequestService.getMyCardRequests(),
        accountService.getAccounts(),
      ]);
      setCardRequests(requestsData as CardRequest[]);
      setAccounts(accountsData as Account[]);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.account_id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select an account",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await cardRequestService.createCardRequest({
        account_id: parseInt(formData.account_id),
        card_type: formData.card_type,
        card_tier: formData.card_tier,
        card_holder_name: formData.card_holder_name || undefined,
        daily_limit: parseFloat(formData.daily_limit),
      });

      toast({
        title: "Success",
        description: "Card request submitted successfully! Admin will review it.",
      });
      setIsDialogOpen(false);
      setFormData({
        account_id: "",
        card_type: "virtual",
        card_tier: "standard",
        card_holder_name: "",
        daily_limit: "1000",
      });
      fetchData();
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

  const handleCancel = async (requestId: number) => {
    if (!confirm("Are you sure you want to cancel this card request?")) {
      return;
    }

    try {
      await cardRequestService.cancelCardRequest(requestId);
      toast({
        title: "Success",
        description: "Card request cancelled",
      });
      fetchData();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "issued":
        return <Badge className="bg-green-500">Issued</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "cancelled":
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const activeCards = cardRequests.filter((r) => r.status === "issued");
  const pendingRequests = cardRequests.filter((r) => r.status === "pending");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <CreditCard className="h-6 w-6" />
              Virtual Cards
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Secure virtual cards for online payments and subscriptions.
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Apply for Card
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Apply for New Card</DialogTitle>
                <DialogDescription>
                  Fill in the details below to request a new card. Admin will review your request.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="account_id">Account *</Label>
                  <Select
                    value={formData.account_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, account_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.account_type.name} - {account.account_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="card_type">Card Type *</Label>
                  <Select
                    value={formData.card_type}
                    onValueChange={(value: "virtual" | "physical") =>
                      setFormData({ ...formData, card_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="virtual">Virtual Card</SelectItem>
                      <SelectItem value="physical">Physical Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="card_tier">Card Tier</Label>
                  <Select
                    value={formData.card_tier}
                    onValueChange={(value: "standard" | "gold" | "platinum") =>
                      setFormData({ ...formData, card_tier: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="gold">Gold</SelectItem>
                      <SelectItem value="platinum">Platinum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="card_holder_name">Card Holder Name</Label>
                  <Input
                    id="card_holder_name"
                    value={formData.card_holder_name}
                    onChange={(e) =>
                      setFormData({ ...formData, card_holder_name: e.target.value })
                    }
                    placeholder="Leave empty to use your profile name"
                  />
                </div>

                <div>
                  <Label htmlFor="daily_limit">Daily Limit (USD)</Label>
                  <Input
                    id="daily_limit"
                    type="number"
                    value={formData.daily_limit}
                    onChange={(e) =>
                      setFormData({ ...formData, daily_limit: e.target.value })
                    }
                    min="1"
                    step="0.01"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Request"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="space-y-6 px-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    ACTIVE CARDS
                  </p>
                  <p className="text-2xl font-bold">{activeCards.length}</p>
                </div>
                <CreditCard className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    PENDING APPLICATIONS
                  </p>
                  <p className="text-2xl font-bold">{pendingRequests.length}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    TOTAL BALANCE
                  </p>
                  <p className="text-2xl font-bold">$0.00</p>
                </div>
                <Wallet className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Banner */}
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Virtual Cards Made Easy</h3>
                <p className="text-blue-100 mb-4">
                  Create virtual cards for secure online payments, subscription
                  management, and more. Enhanced security and spending control.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    <span className="text-sm">Protected payments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    <span className="text-sm">Worldwide acceptance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sliders className="h-5 w-5" />
                    <span className="text-sm">Spending limits</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    <span className="text-sm">Quick issuance</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your Cards */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Your Cards</h2>
          </div>

          {cardRequests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CreditCard className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-semibold mb-2">No Card Requests Yet</p>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Apply for a virtual or physical card to get started.
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Apply for Card
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cardRequests.map((request) => {
                // Determine card gradient based on tier
                const getCardGradient = () => {
                  switch (request.card_tier) {
                    case "platinum":
                      return "from-gray-900 via-gray-800 to-black";
                    case "gold":
                      return "from-amber-600 via-yellow-500 to-amber-400";
                    default:
                      return "from-blue-600 via-blue-500 to-indigo-600";
                  }
                };

                // Get card brand logo (simulate based on first digit)
                const cardBrand = request.card_number?.startsWith("4") ? "VISA" : "VISA";

                return (
                  <div key={request.id} className="relative group">
                    {/* Status Badge - Top Right */}
                    <div className="absolute top-2 right-2 z-10">
                      {getStatusBadge(request.status)}
                    </div>

                    {/* Credit Card Design */}
                    <div
                      className={`relative h-[220px] rounded-2xl bg-gradient-to-br ${getCardGradient()} text-white shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl cursor-pointer overflow-hidden`}
                    >
                      {/* Shine Effect */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      {/* Hologram/Chip Area */}
                      <div className="absolute top-6 left-6 flex items-center gap-3">
                        {/* Chip */}
                        <div className="w-12 h-10 bg-gradient-to-br from-amber-400 via-amber-300 to-amber-500 rounded-md flex items-center justify-center shadow-lg">
                          <div className="w-8 h-6 bg-gradient-to-br from-amber-600 to-amber-700 rounded-sm">
                            <div className="grid grid-cols-3 gap-0.5 p-0.5">
                              {[...Array(9)].map((_, i) => (
                                <div
                                  key={i}
                                  className="h-0.5 bg-amber-800"
                                ></div>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        {/* Contactless Symbol (for issued cards) */}
                        {request.status === "issued" && (
                          <div className="flex items-center">
                            <svg
                              className="w-8 h-8 text-white/80"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Card Brand Logo - Top Right */}
                      <div className="absolute top-6 right-6">
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5">
                          <span className="text-xs font-bold tracking-wider">
                            {cardBrand}
                          </span>
                        </div>
                      </div>

                      {/* Card Tier Badge */}
                      <div className="absolute top-12 right-6">
                        <Badge
                          variant="outline"
                          className="capitalize bg-white/10 text-white border-white/30"
                        >
                          {request.card_tier}
                        </Badge>
                      </div>

                      {/* Card Number */}
                      {request.card_number && (
                        <div className="absolute top-24 left-6 right-6">
                          <p className="text-sm text-white/60 mb-1 tracking-wider">
                            CARD NUMBER
                          </p>
                          <p className="text-2xl font-mono font-semibold tracking-wider drop-shadow-lg">
                            {request.card_number}
                          </p>
                        </div>
                      )}

                      {/* Card Holder Name */}
                      {request.card_holder_name && (
                        <div className="absolute bottom-16 left-6">
                          <p className="text-xs text-white/60 mb-1 tracking-wider uppercase">
                            Card Holder
                          </p>
                          <p className="text-lg font-semibold tracking-wide uppercase">
                            {request.card_holder_name}
                          </p>
                        </div>
                      )}

                      {/* Expiry Date */}
                      {request.expiry_month && request.expiry_year && (
                        <div className="absolute bottom-16 right-6">
                          <p className="text-xs text-white/60 mb-1 tracking-wider">
                            VALID THRU
                          </p>
                          <p className="text-lg font-mono font-semibold tracking-wide">
                            {request.expiry_month}/{request.expiry_year.slice(-2)}
                          </p>
                        </div>
                      )}

                      {/* Card Type Indicator */}
                      <div className="absolute bottom-6 left-6">
                        <div className="flex items-center gap-2">
                          {request.card_type === "virtual" ? (
                            <div className="flex items-center gap-1 text-white/80 text-xs">
                              <Zap className="h-3 w-3" />
                              <span>VIRTUAL</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-white/80 text-xs">
                              <CreditCard className="h-3 w-3" />
                              <span>PHYSICAL</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Pattern Overlay */}
                      <div className="absolute bottom-0 right-0 w-32 h-32 opacity-10">
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                          <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="2" />
                          <circle cx="50" cy="50" r="30" fill="none" stroke="white" strokeWidth="1" />
                          <circle cx="50" cy="50" r="20" fill="none" stroke="white" strokeWidth="1" />
                        </svg>
                      </div>
                    </div>

                    {/* Card Details Below */}
                    <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Account
                          </span>
                          <span className="text-sm font-mono">
                            {request.account.account_number}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Daily Limit
                          </span>
                          <span className="text-sm font-semibold">
                            ${parseFloat(request.daily_limit).toFixed(2)}
                          </span>
                        </div>
                        {request.cvv && request.status === "issued" && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              CVV
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-mono">
                                {revealedCVV[request.id] ? request.cvv : "***"}
                              </span>
                              {!revealedCVV[request.id] && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-xs"
                                  onClick={() =>
                                    setRevealedCVV({ ...revealedCVV, [request.id]: true })
                                  }
                                >
                                  Show
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                        {request.admin_notes && (
                          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                              Admin Notes
                            </p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {request.admin_notes}
                            </p>
                          </div>
                        )}
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Requested: {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {request.status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-2"
                            onClick={() => handleCancel(request.id)}
                          >
                            Cancel Request
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

