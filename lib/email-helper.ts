import { supabase } from './supabase';

/**
 * Get user email from auth.users (requires admin/service role)
 * For client-side, we'll use an API route
 */
export async function getUserEmail(userId: string): Promise<string | null> {
  try {
    // Try to get email from API route (server-side)
    const response = await fetch(`/api/users/${userId}/email`, {
      method: 'GET',
    });

    if (response.ok) {
      const data = await response.json();
      return data.email || null;
    }

    return null;
  } catch (error) {
    console.error('Error fetching user email:', error);
    return null;
  }
}

/**
 * Send notification email via API route
 */
export async function sendNotificationEmailViaAPI(
  userId: string,
  title: string,
  message: string
): Promise<boolean> {
  try {
    const response = await fetch('/api/send-notification-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        title,
        message,
      }),
    });

    if (response.ok) {
      return true;
    }

    const error = await response.json();
    console.error('Error sending notification email:', error);
    return false;
  } catch (error) {
    console.error('Error sending notification email:', error);
    return false;
  }
}

