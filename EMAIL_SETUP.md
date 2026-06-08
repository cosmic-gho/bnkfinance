# Email Configuration Setup

This document explains how to configure email functionality for the banking application.

## Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Email SMTP Configuration
EMAIL_HOST=smtp.hostinger.com
EMAIL_HOST_USER=support@atlanticgates.live
EMAIL_HOST_PASSWORD=Aaasssaaa1@
DEFAULT_FROM_EMAIL=support@atlanticgates.live
SERVER_EMAIL=support@atlanticgates.live
EMAIL_PORT=465
EMAIL_USE_SSL=true

# Supabase Configuration (if not already set)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Important Notes

1. **Service Role Key**: The `SUPABASE_SERVICE_ROLE_KEY` is required to access user emails from the `auth.users` table. This key should be kept secret and never exposed to the client.

2. **Email Credentials**: Store email credentials securely. Never commit `.env.local` to version control.

3. **Email Sending**: Emails are sent asynchronously when notifications are created. If email sending fails, the notification will still be created in the database.

## How It Works

1. When an admin creates a notification via the admin panel, the system:
   - Creates a notification record in the database
   - Attempts to send an email to the user's email address
   - If email fails, the notification is still created (non-blocking)

2. The email service:
   - Uses nodemailer with SMTP configuration
   - Sends HTML-formatted emails
   - Includes proper styling and branding

## Testing Email Configuration

### Quick Test

You can test the email configuration using the test endpoint:

**Option 1: Using Browser/Postman**
```
POST http://localhost:3000/api/test-email
Content-Type: application/json

{
  "to": "your-email@example.com"
}
```

**Option 2: Check Configuration**
```
GET http://localhost:3000/api/test-email
```

This will show your email configuration status.

### Other Testing Methods

1. Creating a notification in the admin panel
2. Performing a transaction (deposit, transfer, wire transfer)
3. Checking the user's email inbox and spam folder
4. Checking the server console logs for email errors

## Troubleshooting

If emails are not being sent:

1. **Check Environment Variables**: Ensure all email environment variables are set correctly
2. **Check SMTP Credentials**: Verify the email and password are correct
3. **Check Service Role Key**: Ensure `SUPABASE_SERVICE_ROLE_KEY` is set
4. **Check Server Logs**: Look for error messages in the console
5. **Test SMTP Connection**: The email service includes a `verifyEmailConfig()` function for testing

## Security Considerations

- Never expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code
- Use environment variables for all sensitive credentials
- Consider using a secrets management service in production
- Regularly rotate email passwords and API keys

