"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { imagekitService } from "@/lib/imagekit-service";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string; // Current image URL
  onChange: (url: string) => void;
  onError?: (error: string) => void;
  folder?: string;
  tags?: string[];
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  className?: string;
  disabled?: boolean;
  showPreview?: boolean;
  previewClassName?: string;
  label?: string;
  required?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  onError,
  folder = "uploads",
  tags = [],
  maxSize = 10 * 1024 * 1024, // 10MB default
  allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  className,
  disabled = false,
  showPreview = true,
  previewClassName,
  label,
  required = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = imagekitService.validateFile(file, { maxSize, allowedTypes });
    if (!validation.valid) {
      onError?.(validation.error || "Invalid file");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setUploading(true);
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const uploaded = await imagekitService.uploadFile(file, fileName, folder, tags);
      onChange(uploaded.url);
      setPreview(uploaded.url);
    } catch (error: any) {
      onError?.(error.message || "Failed to upload image");
      setPreview(null);
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    onChange("");
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="space-y-2">
        {showPreview && preview && (
          <div className={cn("relative inline-block", previewClassName)}>
            <img
              src={preview}
              alt="Preview"
              className="max-w-full h-auto rounded-md border"
            />
            {!disabled && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
        <div className="border-2 border-dashed rounded-lg p-6 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept={allowedTypes.join(",")}
            onChange={handleFileSelect}
            disabled={disabled || uploading}
            className="hidden"
            id={`image-upload-${Math.random()}`}
          />
          <label
            htmlFor={`image-upload-${Math.random()}`}
            className={cn(
              "cursor-pointer flex flex-col items-center gap-2",
              (disabled || uploading) && "opacity-50 cursor-not-allowed"
            )}
          >
            {uploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {preview ? "Change Image" : "Upload Image"}
                </span>
                <span className="text-xs text-muted-foreground">
                  Max size: {Math.round(maxSize / 1024 / 1024)}MB
                </span>
              </>
            )}
          </label>
        </div>
      </div>
    </div>
  );
}

