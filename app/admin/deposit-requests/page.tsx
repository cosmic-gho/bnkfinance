"use client";

import { useEffect, useState } from "react";
import { adminDepositRequestService } from "@/lib/admin-services";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, Eye, AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DepositRequest {
  id: number;
  user_id: string;
  account_id: number;
  crypto_wallet_id: number;
  amount: string;
  crypto_symbol: string;
  transaction_hash: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  account: {
    id: number;
    account_number: string;
    account_type: { name: string };
    balance?: string;
  };
  crypto_wallet: {
    id: number;
    name: string;
    symbol: string;
    logo_url: string | null;
  };
  user: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
  } | null;
}

export default function AdminDepositRequestsPage() {
  const [requests, setRequests] = useState<DepositRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<DepositRequest | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, [filterStatus]);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const filters: any = {};
      if (filterStatus !== "all") {
        filters.status = filterStatus;
      }
      const data = await adminDepositRequestService.getAllDepositRequests(filters);
      setRequests(data as DepositRequest[]);
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

  const handleReview = (request: DepositRequest, action: "approve" | "reject") => {
    setSelectedRequest(request);
    setReviewAction(action);
    setAdminNotes("");
    setIsReviewDialogOpen(true);
  };

  const handleConfirmReview = async () => {
    if (!selectedRequest || !reviewAction) return;

    if (reviewAction === "reject" && !adminNotes.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Admin notes are required when rejecting a request",
      });
      return;
    }

    setIsProcessing(true);
    try {
      if (reviewAction === "approve") {
        await adminDepositRequestService.approveDepositRequest(
          selectedRequest.id,
          adminNotes || undefined
        );
        toast({
          title: "Success",
          description: "Deposit request approved. User balance has been topped up.",
        });
      } else {
        await adminDepositRequestService.rejectDepositRequest(
          selectedRequest.id,
          adminNotes
        );
        toast({
          title: "Success",
          description: "Deposit request rejected.",
        });
      }

      setIsReviewDialogOpen(false);
      setSelectedRequest(null);
      setReviewAction(null);
      setAdminNotes("");
      fetchRequests();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <div className="text-lg">Loading deposit requests...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Deposit Requests</h1>
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Deposit Requests ({requests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No deposit requests found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Crypto</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Transaction Hash</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-mono">{request.id}</TableCell>
                    <TableCell>
                      {request.user ? (
                        <div className="text-sm">
                          <div className="font-medium">
                            {request.user.first_name} {request.user.last_name}
                          </div>
                          <div className="text-muted-foreground">{request.user.username}</div>
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-mono">{request.account.account_number}</div>
                        <div className="text-muted-foreground text-xs">
                          {request.account.account_type.name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {request.crypto_wallet.logo_url && (
                          <img
                            src={request.crypto_wallet.logo_url}
                            alt={request.crypto_wallet.name}
                            className="h-6 w-6 rounded-full"
                          />
                        )}
                        <div>
                          <div className="font-medium text-sm">{request.crypto_wallet.name}</div>
                          <Badge variant="outline" className="text-xs">
                            {request.crypto_symbol}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      ${parseFloat(request.amount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {request.transaction_hash ? (
                        <code className="text-xs font-mono max-w-[150px] truncate block">
                          {request.transaction_hash}
                        </code>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {request.status === "pending" ? (
                        <Badge variant="secondary">Pending</Badge>
                      ) : request.status === "approved" ? (
                        <Badge variant="default">Approved</Badge>
                      ) : request.status === "rejected" ? (
                        <Badge variant="destructive">Rejected</Badge>
                      ) : (
                        <Badge variant="outline">Cancelled</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(request.created_at).toLocaleDateString()}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(request.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {request.status === "pending" ? (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReview(request, "approve")}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReview(request, "reject")}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground">
                          {request.reviewed_at
                            ? `Reviewed ${new Date(request.reviewed_at).toLocaleDateString()}`
                            : "-"}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === "approve" ? "Approve" : "Reject"} Deposit Request
            </DialogTitle>
            <DialogDescription>
              {reviewAction === "approve"
                ? "This will top up the user's account balance. Are you sure?"
                : "Please provide a reason for rejecting this request."}
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="text-sm">
                  <span className="font-medium">User:</span>{" "}
                  {selectedRequest.user
                    ? `${selectedRequest.user.first_name} ${selectedRequest.user.last_name}`
                    : "N/A"}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Account:</span>{" "}
                  {selectedRequest.account.account_number}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Crypto:</span> {selectedRequest.crypto_wallet.name}{" "}
                  ({selectedRequest.crypto_symbol})
                </div>
                <div className="text-sm">
                  <span className="font-medium">Amount:</span> $
                  {parseFloat(selectedRequest.amount).toFixed(2)}
                </div>
                {selectedRequest.transaction_hash && (
                  <div className="text-sm">
                    <span className="font-medium">Transaction Hash:</span>
                    <code className="block text-xs font-mono mt-1 break-all">
                      {selectedRequest.transaction_hash}
                    </code>
                  </div>
                )}
              </div>

              {reviewAction === "reject" && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Admin notes are required when rejecting a request.
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
                    setSelectedRequest(null);
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
                    ? "Approve & Top Up"
                    : "Reject Request"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

