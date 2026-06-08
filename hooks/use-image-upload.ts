import { useState } from "react";
import { imagekitService } from "@/lib/imagekit-service";

interface UseImageUploadOptions {
  folder?: string;
  tags?: string[];
  maxSize?: number;
  allowedTypes?: string[];
  onSuccess?: (url: string) => void;
  onError?: (error: string) => void;
}

export function useImageUpload(options: UseImageUploadOptions = {}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  const upload = async (file: File): Promise<string | null> => {
    setUploading(true);
    setError(null);

    try {
      // Validate file
      const validation = imagekitService.validateFile(file, {
        maxSize: options.maxSize,
        allowedTypes: options.allowedTypes,
      });

      if (!validation.valid) {
        const errorMsg = validation.error || "Invalid file";
        setError(errorMsg);
        options.onError?.(errorMsg);
        return null;
      }

      // Upload file
      const fileName = `${Date.now()}_${file.name}`;
      const uploaded = await imagekitService.uploadFile(
        file,
        fileName,
        options.folder,
        options.tags
      );

      setUrl(uploaded.url);
      options.onSuccess?.(uploaded.url);
      return uploaded.url;
    } catch (err: any) {
      const errorMsg = err.message || "Failed to upload image";
      setError(errorMsg);
      options.onError?.(errorMsg);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setUrl(null);
    setError(null);
    setUploading(false);
  };

  return {
    upload,
    uploading,
    error,
    url,
    reset,
  };
}

