import { imagekitService } from "./imagekit-service";

/**
 * Get optimized image URL from ImageKit
 * Use this utility throughout the app for consistent image handling
 */
export function getImageUrl(
  url: string | null | undefined,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    crop?: "at_max" | "at_least" | "maintain_ratio";
  }
): string {
  if (!url) return "";

  // If no options, return as is
  if (!options) return url;

  const transformations: Record<string, string | number> = {};
  
  if (options.width) transformations.w = options.width;
  if (options.height) transformations.h = options.height;
  if (options.quality) transformations.q = options.quality;
  if (options.crop) transformations.c = options.crop;

  return imagekitService.getImageUrl(url, transformations);
}

/**
 * Get profile picture URL with standard size
 */
export function getProfilePictureUrl(
  url: string | null | undefined,
  size: number = 150
): string {
  if (!url) return "";
  return imagekitService.getProfilePictureUrl(url, size);
}

/**
 * Get thumbnail URL
 */
export function getThumbnailUrl(
  url: string | null | undefined,
  width: number = 200,
  height?: number
): string {
  if (!url) return "";
  return imagekitService.getThumbnailUrl(url, width, height);
}

