"use client";

import { useEffect, useState } from "react";
import { adminCardRequestService } from "@/lib/admin-services";
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
import { Check, X, Eye, AlertCircle, CreditCard } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CardRequest {
  id: number;
  user_id: string;
  account_id: number;
  card_type: string;
  card_tier: string;
  card_number: string | null;
  expiry_month: string | null;
  expiry_year: string | null;
  cvv: string | null;
  card_holder_name: string | null;
  daily_limit: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  issued_at: string | null;
  account: {
    id: number;
    account_number: string;
    account_type: { name: string };
    balance?: string;
  };
  user: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
  } | null;
}

export default function AdminCardsPage() {
  const [requests, setRequests] = useState<CardRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCardType, setFilterCardType] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<CardRequest | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewDetailsDialog, setViewDetailsDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, [filterStatus, filterCardType]);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const filters: any = {};
      if (filterStatus !== "all") {
        filters.status = filterStatus;
      }
      if (filterCardType !== "all") {
        filters.card_type = filterCardType;
      }
      const data = await adminCardRequestService.getAllCardRequests(filters);
      setRequests(data as CardRequest[]);
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

  const handleReview = (request: CardRequest, action: "approve" | "reject") => {
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
        await adminCardRequestService.approveCardRequest(
          selectedRequest.id,
          adminNotes || undefined
        );
        toast({
          title: "Success",
          description: "Card request approved and issued to user.",
        });
      } else {
        await adminCardRequestService.rejectCardRequest(
          selectedRequest.id,
          adminNotes
        );
        toast({
          title: "Success",
          description: "Card request rejected.",
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

  const viewDetails = (request: CardRequest) => {
    setSelectedRequest(request);
    setViewDetailsDialog(true);
  };

  if (isLoading) {
    return <div className="text-lg">Loading card requests...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CreditCard className="h-8 w-8" />
          Card Requests
        </h1>
        <div className="flex gap-2">
          <Select value={filterCardType} onValueChange={setFilterCardType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by card type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Card Types</SelectItem>
              <SelectItem value="virtual">Virtual Cards</SelectItem>
              <SelectItem value="physical">Physical Cards</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="issued">Issued</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Card Requests ({requests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No card requests found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Card Type</TableHead>
                  <TableHead>Card Tier</TableHead>
                  <TableHead>Card Number</TableHead>
                  <TableHead>Card Holder</TableHead>
                  <TableHead>Daily Limit</TableHead>
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
                          <div className="text-muted-foreground">
                            {request.user.username}
                          </div>
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
                      <Badge variant="outline" className="capitalize">
                        {request.card_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {request.card_tier}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {request.card_number ? (
                        <code className="text-xs font-mono">
                          {request.card_number}
                        </code>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {request.card_holder_name || "-"}
                    </TableCell>
                    <TableCell className="font-semibold">
                      ${parseFloat(request.daily_limit || "0").toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {request.status === "pending" ? (
                        <Badge variant="secondary">Pending</Badge>
                      ) : request.status === "issued" ? (
                        <Badge className="bg-green-500">Issued</Badge>
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
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewDetails(request)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {request.status === "pending" && (
                          <>
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
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === "approve" ? "Approve" : "Reject"} Card Request
            </DialogTitle>
            <DialogDescription>
              {reviewAction === "approve"
                ? "This will issue the card to the user. The dummy CC number has been automatically generated. Are you sure?"
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
                  <span className="font-medium">Card Type:</span>{" "}
                  <span className="capitalize">{selectedRequest.card_type}</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Card Tier:</span>{" "}
                  <span className="capitalize">{selectedRequest.card_tier}</span>
                </div>
                {selectedRequest.card_number && (
                  <div className="text-sm">
                    <span className="font-medium">Card Number:</span>
                    <code className="block text-xs font-mono mt-1">
                      {selectedRequest.card_number}
                    </code>
                  </div>
                )}
                {selectedRequest.expiry_month && selectedRequest.expiry_year && (
                  <div className="text-sm">
                    <span className="font-medium">Expiry:</span>{" "}
                    {selectedRequest.expiry_month}/{selectedRequest.expiry_year}
                  </div>
                )}
                {selectedRequest.cvv && (
                  <div className="text-sm">
                    <span className="font-medium">CVV:</span> {selectedRequest.cvv}
                  </div>
                )}
                <div className="text-sm">
                  <span className="font-medium">Daily Limit:</span> $
                  {parseFloat(selectedRequest.daily_limit || "0").toFixed(2)}
                </div>
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
                    ? "Approve & Issue Card"
                    : "Reject Request"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={viewDetailsDialog} onOpenChange={setViewDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Card Request Details</DialogTitle>
            <DialogDescription>
              Complete details of the card request
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Request ID</Label>
                  <p className="font-mono text-sm">{selectedRequest.id}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <div>
                    {selectedRequest.status === "pending" ? (
                      <Badge variant="secondary">Pending</Badge>
                    ) : selectedRequest.status === "issued" ? (
                      <Badge className="bg-green-500">Issued</Badge>
                    ) : selectedRequest.status === "rejected" ? (
                      <Badge variant="destructive">Rejected</Badge>
                    ) : (
                      <Badge variant="outline">Cancelled</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">User</Label>
                  <p className="text-sm">
                    {selectedRequest.user
                      ? `${selectedRequest.user.first_name} ${selectedRequest.user.last_name}`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Account</Label>
                  <p className="font-mono text-sm">
                    {selectedRequest.account.account_number}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Card Type</Label>
                  <p className="text-sm capitalize">{selectedRequest.card_type}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Card Tier</Label>
                  <p className="text-sm capitalize">{selectedRequest.card_tier}</p>
                </div>
                {selectedRequest.card_number && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Card Number</Label>
                    <p className="font-mono text-sm">{selectedRequest.card_number}</p>
                  </div>
                )}
                {selectedRequest.expiry_month && selectedRequest.expiry_year && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Expiry Date</Label>
                    <p className="text-sm">
                      {selectedRequest.expiry_month}/{selectedRequest.expiry_year}
                    </p>
                  </div>
                )}
                {selectedRequest.cvv && (
                  <div>
                    <Label className="text-xs text-muted-foreground">CVV</Label>
                    <p className="font-mono text-sm">{selectedRequest.cvv}</p>
                  </div>
                )}
                <div>
                  <Label className="text-xs text-muted-foreground">Card Holder</Label>
                  <p className="text-sm">
                    {selectedRequest.card_holder_name || "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Daily Limit</Label>
                  <p className="text-sm font-semibold">
                    ${parseFloat(selectedRequest.daily_limit || "0").toFixed(2)}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Created At</Label>
                  <p className="text-sm">
                    {new Date(selectedRequest.created_at).toLocaleString()}
                  </p>
                </div>
                {selectedRequest.reviewed_at && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Reviewed At</Label>
                    <p className="text-sm">
                      {new Date(selectedRequest.reviewed_at).toLocaleString()}
                    </p>
                  </div>
                )}
                {selectedRequest.issued_at && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Issued At</Label>
                    <p className="text-sm">
                      {new Date(selectedRequest.issued_at).toLocaleString()}
                    </p>
                  </div>
                )}
                {selectedRequest.admin_notes && (
                  <div className="col-span-2">
                    <Label className="text-xs text-muted-foreground">Admin Notes</Label>
                    <p className="text-sm">{selectedRequest.admin_notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

