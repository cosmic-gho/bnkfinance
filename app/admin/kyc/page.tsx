"use client";

import { useEffect, useState } from "react";
import { adminKYCService } from "@/lib/admin-kyc-services";
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
import { Check, X, Eye, AlertCircle, Shield, Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";

interface KYCSubmission {
  id: number;
  user_id: string;
  ssn: string | null;
  id_card_front_url: string | null;
  id_card_back_url: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  phone_number: string;
  email: string;
  status: string;
  admin_notes: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  approved_at: string | null;
  user: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
}

export default function AdminKYCPage() {
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedSubmission, setSelectedSubmission] = useState<KYCSubmission | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | "review" | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubmissions();
  }, [filterStatus]);

  const fetchSubmissions = async () => {
    try {
      setIsLoading(true);
      const filters: any = {};
      if (filterStatus !== "all") {
        filters.status = filterStatus;
      }
      const data = await adminKYCService.getAllKYCSubmissions(filters);
      setSubmissions(data as KYCSubmission[]);
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

  const handleReview = (submission: KYCSubmission, action: "approve" | "reject" | "review") => {
    setSelectedSubmission(submission);
    setReviewAction(action);
    setAdminNotes("");
    setRejectionReason("");
    setIsReviewDialogOpen(true);
  };

  const handleViewDetails = (submission: KYCSubmission) => {
    setSelectedSubmission(submission);
    setIsDetailsDialogOpen(true);
  };

  const handleConfirmReview = async () => {
    if (!selectedSubmission || !reviewAction) return;

    if (reviewAction === "reject" && !rejectionReason.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Rejection reason is required",
      });
      return;
    }

    setIsProcessing(true);
    try {
      if (reviewAction === "approve") {
        await adminKYCService.approveKYCSubmission(
          selectedSubmission.id,
          adminNotes || undefined
        );
        toast({
          title: "Success",
          description: "KYC submission approved",
        });
      } else if (reviewAction === "reject") {
        await adminKYCService.rejectKYCSubmission(
          selectedSubmission.id,
          rejectionReason,
          adminNotes || undefined
        );
        toast({
          title: "Success",
          description: "KYC submission rejected",
        });
      } else if (reviewAction === "review") {
        await adminKYCService.markUnderReview(selectedSubmission.id);
        toast({
          title: "Success",
          description: "KYC submission marked as under review",
        });
      }

      setIsReviewDialogOpen(false);
      setSelectedSubmission(null);
      setReviewAction(null);
      setAdminNotes("");
      setRejectionReason("");
      fetchSubmissions();
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "under_review":
        return <Badge className="bg-yellow-500">Under Review</Badge>;
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return <div className="text-lg">Loading KYC submissions...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8" />
          KYC Submissions
        </h1>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All KYC Submissions ({submissions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No KYC submissions found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-mono">{submission.id}</TableCell>
                    <TableCell>
                      {submission.user ? (
                        <div className="text-sm">
                          <div className="font-medium">
                            {submission.user.first_name} {submission.user.last_name}
                          </div>
                          <div className="text-muted-foreground">
                            @{submission.user.username}
                          </div>
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{submission.email}</TableCell>
                    <TableCell>{submission.phone_number}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{submission.address_line1}</div>
                        <div className="text-muted-foreground text-xs">
                          {submission.city}, {submission.state} {submission.zip_code}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(submission.status)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(submission.created_at).toLocaleDateString()}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(submission.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(submission)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {submission.status === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReview(submission, "review")}
                            >
                              <Clock className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReview(submission, "approve")}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReview(submission, "reject")}
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
              {reviewAction === "approve"
                ? "Approve"
                : reviewAction === "reject"
                ? "Reject"
                : "Mark Under Review"}{" "}
              KYC Submission
            </DialogTitle>
            <DialogDescription>
              {reviewAction === "approve"
                ? "This will approve the KYC submission. Are you sure?"
                : reviewAction === "reject"
                ? "Please provide a reason for rejecting this KYC submission."
                : "This will mark the submission as under review."}
            </DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="text-sm">
                  <span className="font-medium">User:</span>{" "}
                  {selectedSubmission.user
                    ? `${selectedSubmission.user.first_name} ${selectedSubmission.user.last_name}`
                    : "N/A"}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Email:</span> {selectedSubmission.email}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Phone:</span> {selectedSubmission.phone_number}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Address:</span> {selectedSubmission.address_line1}, {selectedSubmission.city}, {selectedSubmission.state}
                </div>
              </div>

              {reviewAction === "reject" && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Rejection reason is required when rejecting a KYC submission.
                  </AlertDescription>
                </Alert>
              )}

              {reviewAction === "reject" && (
                <div>
                  <Label htmlFor="rejection_reason">Rejection Reason *</Label>
                  <Textarea
                    id="rejection_reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Reason for rejection (required)..."
                    rows={3}
                    required
                  />
                </div>
              )}

              <div>
                <Label htmlFor="admin_notes">
                  Admin Notes {reviewAction === "reject" ? "" : "(Optional)"}
                </Label>
                <Textarea
                  id="admin_notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Optional notes..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsReviewDialogOpen(false);
                    setSelectedSubmission(null);
                    setReviewAction(null);
                    setAdminNotes("");
                    setRejectionReason("");
                  }}
                  className="flex-1"
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant={reviewAction === "approve" ? "default" : reviewAction === "reject" ? "destructive" : "default"}
                  onClick={handleConfirmReview}
                  className="flex-1"
                  disabled={isProcessing || (reviewAction === "reject" && !rejectionReason.trim())}
                >
                  {isProcessing
                    ? "Processing..."
                    : reviewAction === "approve"
                    ? "Approve"
                    : reviewAction === "reject"
                    ? "Reject"
                    : "Mark Under Review"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>KYC Submission Details</DialogTitle>
            <DialogDescription>Complete details of the KYC submission</DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-6">
              {/* User Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">User</Label>
                  <p className="text-sm font-medium">
                    {selectedSubmission.user
                      ? `${selectedSubmission.user.first_name} ${selectedSubmission.user.last_name}`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Username</Label>
                  <p className="text-sm">{selectedSubmission.user?.username || "-"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="text-sm">{selectedSubmission.email}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Phone Number</Label>
                  <p className="text-sm">{selectedSubmission.phone_number}</p>
                </div>
                {selectedSubmission.ssn && (
                  <div>
                    <Label className="text-xs text-muted-foreground">SSN</Label>
                    <p className="text-sm font-mono">{selectedSubmission.ssn}</p>
                  </div>
                )}
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <div>{getStatusBadge(selectedSubmission.status)}</div>
                </div>
              </div>

              {/* Address */}
              <div>
                <Label className="text-xs text-muted-foreground">Address</Label>
                <div className="text-sm mt-1">
                  <p>{selectedSubmission.address_line1}</p>
                  {selectedSubmission.address_line2 && (
                    <p>{selectedSubmission.address_line2}</p>
                  )}
                  <p>
                    {selectedSubmission.city}, {selectedSubmission.state}{" "}
                    {selectedSubmission.zip_code}
                  </p>
                  <p>{selectedSubmission.country}</p>
                </div>
              </div>

              {/* ID Card Images */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    ID Card Front
                  </Label>
                  {selectedSubmission.id_card_front_url ? (
                    <img
                      src={selectedSubmission.id_card_front_url}
                      alt="ID Card Front"
                      className="w-full border rounded-md max-h-64 object-contain"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">Not provided</p>
                  )}
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    ID Card Back
                  </Label>
                  {selectedSubmission.id_card_back_url ? (
                    <img
                      src={selectedSubmission.id_card_back_url}
                      alt="ID Card Back"
                      className="w-full border rounded-md max-h-64 object-contain"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">Not provided</p>
                  )}
                </div>
              </div>

              {/* Admin Notes */}
              {selectedSubmission.admin_notes && (
                <div>
                  <Label className="text-xs text-muted-foreground">Admin Notes</Label>
                  <p className="text-sm mt-1">{selectedSubmission.admin_notes}</p>
                </div>
              )}

              {/* Rejection Reason */}
              {selectedSubmission.rejection_reason && (
                <div>
                  <Label className="text-xs text-muted-foreground">Rejection Reason</Label>
                  <p className="text-sm mt-1 text-red-600 dark:text-red-400">
                    {selectedSubmission.rejection_reason}
                  </p>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-xs text-muted-foreground">Created At</Label>
                  <p>{new Date(selectedSubmission.created_at).toLocaleString()}</p>
                </div>
                {selectedSubmission.reviewed_at && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Reviewed At</Label>
                    <p>{new Date(selectedSubmission.reviewed_at).toLocaleString()}</p>
                  </div>
                )}
                {selectedSubmission.approved_at && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Approved At</Label>
                    <p>{new Date(selectedSubmission.approved_at).toLocaleString()}</p>
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

