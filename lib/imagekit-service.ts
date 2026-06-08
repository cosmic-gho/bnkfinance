// ImageKit.io service for file uploads
// Documentation: https://docs.imagekit.io/api-reference/upload-file-api

interface ImageKitUploadResponse {
  fileId: string;
  name: string;
  size: number;
  filePath: string;
  url: string;
  thumbnailUrl: string;
  fileType: string;
  height?: number;
  width?: number;
}

interface ImageKitConfig {
  publicKey: string;
  urlEndpoint: string;
  authenticationEndpoint?: string;
}

class ImageKitService {
  private publicKey: string;
  private urlEndpoint: string;
  private authenticationEndpoint: string;

  constructor() {
    this.publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || '';
    this.urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || '';
    this.authenticationEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_AUTH_ENDPOINT || '/api/imagekit-auth';

    if (!this.publicKey || !this.urlEndpoint) {
      console.warn('ImageKit credentials not configured. File uploads will not work.');
    }
  }

  /**
   * Get authentication parameters for ImageKit client-side upload
   */
  async getAuthenticationParams(): Promise<{
    token: string;
    expire: number;
    signature: string;
  }> {
    try {
      const response = await fetch(this.authenticationEndpoint);
      if (!response.ok) {
        throw new Error('Failed to get authentication parameters');
      }
      return await response.json();
    } catch (error) {
      console.error('Error getting ImageKit auth params:', error);
      throw error;
    }
  }

  /**
   * Upload file directly from browser using ImageKit JavaScript SDK
   * This should be called from the client side
   */
  async uploadFile(
    file: File,
    fileName?: string,
    folder?: string,
    tags?: string[]
  ): Promise<ImageKitUploadResponse> {
    if (!this.publicKey || !this.urlEndpoint) {
      throw new Error('ImageKit is not configured. Please set NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY and NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT');
    }

    // Get authentication parameters
    const authParams = await this.getAuthenticationParams();

    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', fileName || file.name);
    formData.append('publicKey', this.publicKey);
    formData.append('signature', authParams.signature);
    formData.append('expire', authParams.expire.toString());
    formData.append('token', authParams.token);

    if (folder) {
      formData.append('folder', folder);
    }

    if (tags && tags.length > 0) {
      formData.append('tags', tags.join(','));
    }

    // Upload to ImageKit
    const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload file');
    }

    return await response.json();
  }

  /**
   * Delete file from ImageKit
   */
  async deleteFile(fileId: string): Promise<void> {
    try {
      const response = await fetch('/api/imagekit-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file from ImageKit:', error);
      throw error;
    }
  }

  /**
   * Get ImageKit URL for an image with transformations
   */
  getImageUrl(filePath: string, transformations?: Record<string, string | number>): string {
    if (!filePath) return '';

    // If it's already a full URL, return as is
    if (filePath.startsWith('http')) {
      // If transformations are requested on an existing URL, append them
      if (transformations && Object.keys(transformations).length > 0) {
        const queryParams = Object.entries(transformations)
          .map(([key, value]) => `${key}=${value}`)
          .join(',');
        const separator = filePath.includes('?') ? '&' : '?';
        return `${filePath}${separator}tr=${queryParams}`;
      }
      return filePath;
    }

    // Otherwise, construct URL with transformations
    const baseUrl = filePath.startsWith('/') 
      ? `${this.urlEndpoint}${filePath}`
      : `${this.urlEndpoint}/${filePath}`;

    if (!transformations || Object.keys(transformations).length === 0) {
      return baseUrl;
    }

    // Convert transformations to query string
    const queryParams = Object.entries(transformations)
      .map(([key, value]) => `${key}=${value}`)
      .join(',');

    return `${baseUrl}?tr=${queryParams}`;
  }

  /**
   * Get optimized thumbnail URL
   */
  getThumbnailUrl(filePath: string, width: number = 200, height?: number): string {
    const transformations: Record<string, string | number> = {
      w: width,
      q: 80, // Quality
    };
    if (height) {
      transformations.h = height;
    }
    return this.getImageUrl(filePath, transformations);
  }

  /**
   * Get optimized profile picture URL
   */
  getProfilePictureUrl(filePath: string, size: number = 150): string {
    return this.getImageUrl(filePath, {
      w: size,
      h: size,
      q: 90,
      c: 'at_max', // Crop at max
    });
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File, options?: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
  }): { valid: boolean; error?: string } {
    const maxSize = options?.maxSize || 10 * 1024 * 1024; // 10MB default
    const allowedTypes = options?.allowedTypes || ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`,
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      };
    }

    return { valid: true };
  }
}

export const imagekitService = new ImageKitService();

