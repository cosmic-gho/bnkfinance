import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-utils';

// ImageKit delete endpoint
// Only admins can delete files

export async function POST(request: Request) {
  try {
    // Check if user is admin
    await requireAdmin();

    const { fileId } = await request.json();

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }

    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;

    if (!privateKey) {
      return NextResponse.json(
        { error: 'ImageKit private key not configured' },
        { status: 500 }
      );
    }

    // Create authentication for ImageKit API
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = require('crypto')
      .createHmac('sha1', privateKey)
      .update(fileId + timestamp)
      .digest('hex');

    // Delete file from ImageKit
    const response = await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${privateKey}:`).toString('base64')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete file');
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting file from ImageKit:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete file' },
      { status: error.message?.includes('admin') ? 403 : 500 }
    );
  }
}

