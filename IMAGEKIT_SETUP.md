# ImageKit.io Integration Guide

This application uses ImageKit.io as the primary media storage solution for all file uploads throughout the site.

## Setup Instructions

### 1. Create ImageKit Account

1. Go to [ImageKit.io](https://imagekit.io) and create an account
2. Create a new media library
3. Get your credentials from the dashboard:
   - **Public Key** (starts with `public_`)
   - **Private Key** (starts with `private_`)
   - **URL Endpoint** (e.g., `https://ik.imagekit.io/your_imagekit_id`)

### 2. Configure Environment Variables

Add these to your `.env.local` file:

```env
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=your_public_key_here
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
IMAGEKIT_PRIVATE_KEY=your_private_key_here
```

### 3. Database Setup

Run the migration script to add profile_picture column (if not already done):

```sql
-- Run in Supabase SQL Editor
scripts/add-profile-picture-column.sql
```

## Usage Throughout the Application

### Using the ImageUpload Component

The `ImageUpload` component is a reusable component for uploading images to ImageKit:

```tsx
import { ImageUpload } from "@/components/image-upload";

<ImageUpload
  value={imageUrl}
  onChange={(url) => setImageUrl(url)}
  folder="my-folder"
  tags={["tag1", "tag2"]}
  maxSize={5 * 1024 * 1024} // 5MB
  showPreview={true}
  label="Upload Image"
/>
```

### Using the useImageUpload Hook

For more control, use the `useImageUpload` hook:

```tsx
import { useImageUpload } from "@/hooks/use-image-upload";

const { upload, uploading, error, url } = useImageUpload({
  folder: "my-folder",
  tags: ["tag1"],
  maxSize: 5 * 1024 * 1024,
  onSuccess: (url) => console.log("Uploaded:", url),
  onError: (error) => console.error(error),
});

// In your handler
const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    await upload(file);
  }
};
```

### Using Image Utilities

Get optimized image URLs using the utility functions:

```tsx
import { getImageUrl, getProfilePictureUrl, getThumbnailUrl } from "@/lib/image-utils";

// Get optimized image with custom dimensions
const optimizedUrl = getImageUrl(imageUrl, {
  width: 800,
  height: 600,
  quality: 90,
  crop: "at_max",
});

// Get profile picture (150x150, cropped)
const profilePic = getProfilePictureUrl(imageUrl, 150);

// Get thumbnail
const thumbnail = getThumbnailUrl(imageUrl, 200, 200);
```

### Direct ImageKit Service Usage

For advanced use cases, use the service directly:

```tsx
import { imagekitService } from "@/lib/imagekit-service";

// Upload file
const uploaded = await imagekitService.uploadFile(
  file,
  "my-file.jpg",
  "folder/subfolder",
  ["tag1", "tag2"]
);

// Get optimized URL
const url = imagekitService.getImageUrl(uploaded.url, {
  w: 800,
  h: 600,
  q: 90,
});
```

## Current Implementations

### 1. KYC ID Card Uploads
- **Location**: `app/kyc/page.tsx`
- **Folder**: `kyc/id-cards`
- **Tags**: `["kyc", "front"]` or `["kyc", "back"]`

### 2. Profile Pictures
- **Location**: `app/profile/page.tsx`
- **Folder**: `profile-pictures`
- **Tags**: `["profile", "avatar"]`
- **Component**: Uses `ImageUpload` component

## File Organization in ImageKit

Recommended folder structure:

```
/
├── profile-pictures/     # User profile pictures
├── kyc/
│   └── id-cards/        # KYC document uploads
├── documents/           # General documents
└── uploads/             # General uploads
```

## Image Optimization

ImageKit automatically optimizes images. You can request specific transformations:

- **Width/Height**: `w=800&h=600`
- **Quality**: `q=90` (0-100)
- **Crop**: `c=at_max` (at_max, at_least, maintain_ratio)
- **Format**: `f=auto` (auto, webp, jpg, png)

Example:
```tsx
const optimized = imagekitService.getImageUrl(url, {
  w: 800,
  h: 600,
  q: 90,
  c: "at_max",
});
```

## Security

- **Authentication**: Client-side uploads use temporary tokens (40-minute expiry)
- **File Validation**: Files are validated for type and size before upload
- **Admin Deletion**: Only admins can delete files via `/api/imagekit-delete`

## API Endpoints

### `/api/imagekit-auth`
- **Method**: GET
- **Purpose**: Get authentication parameters for client-side uploads
- **Access**: Public (but tokens expire quickly)

### `/api/imagekit-delete`
- **Method**: POST
- **Purpose**: Delete files from ImageKit
- **Access**: Admin only
- **Body**: `{ fileId: string }`

## Best Practices

1. **Always validate files** before upload (type, size)
2. **Use appropriate folders** to organize files
3. **Add tags** for easier searching and management
4. **Use optimized URLs** for better performance
5. **Store only URLs** in database, not file data
6. **Clean up unused files** periodically

## Troubleshooting

### Upload fails
- Check environment variables are set correctly
- Verify ImageKit credentials are valid
- Check file size and type restrictions

### Images not displaying
- Verify URL is correct
- Check ImageKit dashboard for file existence
- Ensure Next.js Image component allows external domains (if using)

### Authentication errors
- Verify private key is correct
- Check token expiry (40 minutes)
- Ensure API routes are accessible

