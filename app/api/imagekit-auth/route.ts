import { NextResponse } from 'next/server';
import crypto from 'crypto';

// ImageKit authentication endpoint
// This generates a token and signature for client-side uploads
// Documentation: https://docs.imagekit.io/api-reference/upload-file-api/client-side-file-upload#authentication-parameter-generation

export async function GET() {
  try {
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    
    if (!privateKey) {
      return NextResponse.json(
        { error: 'ImageKit private key not configured' },
        { status: 500 }
      );
    }

    const token = crypto.randomBytes(16).toString('hex');
    const expire = Math.floor(Date.now() / 1000) + 2400; // 40 minutes from now

    // Create signature
    const stringToSign = `${token}${expire}`;
    const signature = crypto
      .createHmac('sha1', privateKey)
      .update(stringToSign)
      .digest('hex');

    return NextResponse.json({
      token,
      expire,
      signature,
    });
  } catch (error: any) {
    console.error('Error generating ImageKit auth params:', error);
    return NextResponse.json(
      { error: 'Failed to generate authentication parameters' },
      { status: 500 }
    );
  }
}

