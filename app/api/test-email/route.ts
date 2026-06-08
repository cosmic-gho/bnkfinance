import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, verifyEmailConfig } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to } = body;

    if (!to) {
      return NextResponse.json(
        { error: 'Missing required field: to (email address)' },
        { status: 400 }
      );
    }

    // First verify email configuration
    console.log('Verifying email configuration...');
    const isVerified = await verifyEmailConfig();
    
    if (!isVerified) {
      return NextResponse.json(
        { error: 'Email configuration verification failed. Check your SMTP settings.' },
        { status: 500 }
      );
    }

    // Send test email
    console.log('Sending test email to:', to);
    await sendEmail({
      to,
      subject: 'Test Email from BNK Finance Bank',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Test Email</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h1 style="color: #2563eb; margin-top: 0;">BNK Finance Bank</h1>
            </div>
            <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
              <h2 style="color: #1f2937; margin-top: 0;">Test Email</h2>
              <p>This is a test email to verify that your email configuration is working correctly.</p>
              <p>If you received this email, your SMTP settings are configured properly!</p>
              <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
                Sent at: ${new Date().toLocaleString()}
              </p>
            </div>
          </body>
        </html>
      `,
    });

    return NextResponse.json(
      { 
        success: true, 
        message: 'Test email sent successfully',
        details: 'Check your inbox and spam folder'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in test-email API:', error);
    return NextResponse.json(
      {
        error: 'Failed to send test email',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Verify email configuration
  try {
    const isVerified = await verifyEmailConfig();
    return NextResponse.json(
      {
        verified: isVerified,
        config: {
          host: process.env.EMAIL_HOST || 'smtp.hostinger.com',
          port: process.env.EMAIL_PORT || '465',
          user: process.env.EMAIL_HOST_USER || 'support@atlanticgates.live',
          from: process.env.DEFAULT_FROM_EMAIL || 'support@atlanticgates.live',
          passwordSet: !!process.env.EMAIL_HOST_PASSWORD,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        verified: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

