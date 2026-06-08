import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendNotificationEmail } from '@/lib/email-service';

// Create Supabase admin client with service role key
// This allows us to access auth.users table
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, title, message } = body;

    if (!user_id || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, title, message' },
        { status: 400 }
      );
    }

    // Get user email from auth.users using admin client
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(user_id);

    if (authError || !authUser?.user?.email) {
      console.error('Error fetching user email:', authError);
      return NextResponse.json(
        { error: 'User not found or email not available' },
        { status: 404 }
      );
    }

    // Send email
    await sendNotificationEmail(authUser.user.email, title, message);

    return NextResponse.json(
      { success: true, message: 'Notification email sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in send-notification-email API:', error);
    return NextResponse.json(
      {
        error: 'Failed to send notification email',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

