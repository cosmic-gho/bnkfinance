import { NextRequest, NextResponse } from 'next/server';
import { sendNotificationEmail } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, message, title } = body;

    if (!to || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: to, title, message' },
        { status: 400 }
      );
    }

    // If subject is provided, use it; otherwise use title
    const emailSubject = subject || title;

    await sendNotificationEmail(to, emailSubject, message);

    return NextResponse.json(
      { success: true, message: 'Email sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in send-email API:', error);
    return NextResponse.json(
      {
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

