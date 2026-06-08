"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { kycService } from "@/lib/supabase-services";
import { imagekitService } from "@/lib/imagekit-service";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Shield,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  User,
  FileText,
  MapPin,
  Phone,
  Mail,
  CreditCard,
} from "lucide-react";

interface KYCSubmission {
  id: number;
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
  approved_at: string | null;
}

export default function KYCPage() {
  const [kycSubmission, setKYCSubmission] = useState<KYCSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const frontFileInputRef = useRef<HTMLInputElement>(null);
  const backFileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    ssn: "",
    id_card_front_url: "",
    id_card_back_url: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    zip_code: "",
    country: "United States",
    phone_number: "",
    email: "",
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      // Get user email
      if (session.user.email) {
        setFormData((prev) => ({ ...prev, email: session.user.email || "" }));
      }

      fetchKYCSubmission();
    };
    checkAuth();
  }, [router]);

  const fetchKYCSubmission = async () => {
    try {
      setIsLoading(true);
      const submission = await kycService.getMyKYCSubmission();
      if (submission) {
        setKYCSubmission(submission as KYCSubmission);
        setFormData({
          ssn: submission.ssn || "",
          id_card_front_url: submission.id_card_front_url || "",
          id_card_back_url: submission.id_card_back_url || "",
          address_line1: submission.address_line1 || "",
          address_line2: submission.address_line2 || "",
          city: submission.city || "",
          state: submission.state || "",
          zip_code: submission.zip_code || "",
          country: submission.country || "United States",
          phone_number: submission.phone_number || "",
          email: submission.email || "",
        });
      }
    } catch (err: any) {
      console.error("Error fetching KYC submission:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (
    file: File,
    type: "front" | "back"
  ): Promise<string> => {
    const folder = "kyc/id-cards";
    const fileName = `${Date.now()}_${file.name}`;

    try {
      const uploaded = await imagekitService.uploadFile(file, fileName, folder, [
        "kyc",
        type,
      ]);
      return uploaded.url;
    } catch (error: any) {
      throw new Error(`Failed to upload ${type} of ID card: ${error.message}`);
    }
  };

  const handleFrontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please upload an image file",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "File size must be less than 5MB",
      });
      return;
    }

    setUploadingFront(true);
    try {
      const url = await handleFileUpload(file, "front");
      setFormData((prev) => ({ ...prev, id_card_front_url: url }));
      toast({
        title: "Success",
        description: "Front of ID card uploaded successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setUploadingFront(false);
    }
  };

  const handleBackUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please upload an image file",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "File size must be less than 5MB",
      });
      return;
    }

    setUploadingBack(true);
    try {
      const url = await handleFileUpload(file, "back");
      setFormData((prev) => ({ ...prev, id_card_back_url: url }));
      toast({
        title: "Success",
        description: "Back of ID card uploaded successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setUploadingBack(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.id_card_front_url || !formData.id_card_back_url) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please upload both front and back of your ID card",
      });
      return;
    }

    if (!formData.address_line1 || !formData.city || !formData.state || !formData.zip_code) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required address fields",
      });
      return;
    }

    if (!formData.phone_number || !formData.email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide your phone number and email",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (kycSubmission && kycSubmission.status === "pending") {
        // Update existing submission
        await kycService.updateKYCSubmission(kycSubmission.id, formData);
        toast({
          title: "Success",
          description: "KYC submission updated successfully",
        });
      } else {
        // Create new submission
        await kycService.createKYCSubmission(formData);
        toast({
          title: "Success",
          description:
            "KYC submission created successfully. Admin will review your submission.",
        });
      }
      fetchKYCSubmission();
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const canEdit = !kycSubmission || kycSubmission.status === "pending" || kycSubmission.status === "rejected";

  return (
    <div className="w-full">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6" />
              KYC Verification
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Complete your Know Your Customer verification to access all features.
            </p>
          </div>
          {kycSubmission && getStatusBadge(kycSubmission.status)}
        </div>
      </header>

      <div className="space-y-6 px-6">
        {kycSubmission?.status === "approved" && (
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <p className="text-green-800 dark:text-green-200">
                  Your KYC verification has been approved on{" "}
                  {kycSubmission.approved_at &&
                    new Date(kycSubmission.approved_at).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {kycSubmission?.status === "rejected" && (
          <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  <p className="text-red-800 dark:text-red-200 font-semibold">
                    Your KYC verification was rejected
                  </p>
                </div>
                {kycSubmission.rejection_reason && (
                  <p className="text-red-700 dark:text-red-300">
                    <strong>Reason:</strong> {kycSubmission.rejection_reason}
                  </p>
                )}
                {kycSubmission.admin_notes && (
                  <p className="text-red-700 dark:text-red-300">
                    <strong>Admin Notes:</strong> {kycSubmission.admin_notes}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SSN */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Social Security Number 
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="ssn">SSN</Label>
                <Input
                  id="ssn"
                  type="text"
                  placeholder="XXX-XX-XXXX"
                  value={formData.ssn}
                  onChange={(e) =>
                    setFormData({ ...formData, ssn: e.target.value })
                  }
                  disabled={!canEdit}
                  maxLength={11}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Format: XXX-XX-XXXX (Optional)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* ID Card Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                ID Card Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="id_card_front">Front of ID Card *</Label>
                <div className="mt-2">
                  {formData.id_card_front_url ? (
                    <div className="space-y-2">
                      <img
                        src={formData.id_card_front_url}
                        alt="ID Card Front"
                        className="max-w-full h-48 object-contain border rounded-md"
                      />
                      {canEdit && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setFormData({ ...formData, id_card_front_url: "" })
                          }
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <input
                        ref={frontFileInputRef}
                        id="id_card_front"
                        type="file"
                        accept="image/*"
                        onChange={handleFrontUpload}
                        disabled={!canEdit || uploadingFront}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        disabled={!canEdit || uploadingFront}
                        onClick={() => frontFileInputRef.current?.click()}
                      >
                        {uploadingFront ? "Uploading..." : "Upload Front"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="id_card_back">Back of ID Card *</Label>
                <div className="mt-2">
                  {formData.id_card_back_url ? (
                    <div className="space-y-2">
                      <img
                        src={formData.id_card_back_url}
                        alt="ID Card Back"
                        className="max-w-full h-48 object-contain border rounded-md"
                      />
                      {canEdit && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setFormData({ ...formData, id_card_back_url: "" })
                          }
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <input
                        ref={backFileInputRef}
                        id="id_card_back"
                        type="file"
                        accept="image/*"
                        onChange={handleBackUpload}
                        disabled={!canEdit || uploadingBack}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        disabled={!canEdit || uploadingBack}
                        onClick={() => backFileInputRef.current?.click()}
                      >
                        {uploadingBack ? "Uploading..." : "Upload Back"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address_line1">Address Line 1 *</Label>
                <Input
                  id="address_line1"
                  value={formData.address_line1}
                  onChange={(e) =>
                    setFormData({ ...formData, address_line1: e.target.value })
                  }
                  disabled={!canEdit}
                  required
                />
              </div>
              <div>
                <Label htmlFor="address_line2">Address Line 2</Label>
                <Input
                  id="address_line2"
                  value={formData.address_line2}
                  onChange={(e) =>
                    setFormData({ ...formData, address_line2: e.target.value })
                  }
                  disabled={!canEdit}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    disabled={!canEdit}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    disabled={!canEdit}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="zip_code">Zip Code *</Label>
                  <Input
                    id="zip_code"
                    value={formData.zip_code}
                    onChange={(e) =>
                      setFormData({ ...formData, zip_code: e.target.value })
                    }
                    disabled={!canEdit}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    disabled={!canEdit}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="phone_number">Phone Number *</Label>
                <Input
                  id="phone_number"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone_number}
                  onChange={(e) =>
                    setFormData({ ...formData, phone_number: e.target.value })
                  }
                  disabled={!canEdit}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  disabled={true}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Email must match your account email
                </p>
              </div>
            </CardContent>
          </Card>

          {canEdit && (
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting} size="lg">
                {isSubmitting
                  ? "Submitting..."
                  : kycSubmission
                  ? "Update Submission"
                  : "Submit KYC"}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

