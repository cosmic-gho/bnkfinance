# Email Troubleshooting Guide

If you're not receiving emails, follow these steps:

## Step 1: Verify Environment Variables

1. **Check if `.env.local` exists** in your project root
2. **Verify all email variables are set:**

```env
EMAIL_HOST=smtp.hostinger.com
EMAIL_HOST_USER=support@atlanticgates.live
EMAIL_HOST_PASSWORD=Aaasssaaa1@
DEFAULT_FROM_EMAIL=support@atlanticgates.live
EMAIL_PORT=465
EMAIL_USE_SSL=true
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

3. **Important**: After adding/updating `.env.local`, you MUST restart your Next.js dev server:
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart:
   npm run dev
   ```

## Step 2: Test Email Configuration

### Option A: Using the Test Endpoint

1. **Check configuration:**
   ```
   GET http://localhost:3000/api/test-email
   ```
   This shows if your email config is loaded correctly.

2. **Send a test email:**
   ```
   POST http://localhost:3000/api/test-email
   Content-Type: application/json
   
   {
     "to": "your-email@example.com"
   }
   ```

### Option B: Using Browser Console

Open browser console and run:
```javascript
fetch('/api/test-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ to: 'your-email@example.com' })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

## Step 3: Check Server Logs

When you perform a transaction or send a test email, check your **server console** (where you ran `npm run dev`) for:

- ✅ `Email sent successfully!` - Email was sent
- ❌ `Error sending email:` - There's an error
- 📧 `Sending transaction receipt email to:` - Email is being attempted

## Step 4: Common Issues

### Issue 1: Environment Variables Not Loading

**Symptom**: Email config shows default values or empty password

**Solution**: 
- Make sure `.env.local` is in the project root (same level as `package.json`)
- Restart the dev server after changing `.env.local`
- In Next.js, environment variables starting with `NEXT_PUBLIC_` are available on client, others are server-only

### Issue 2: SMTP Authentication Failed

**Symptom**: Error like "Invalid login" or "Authentication failed"

**Solution**:
- Verify email and password are correct
- Check if your email provider requires "App Password" instead of regular password
- Some providers require enabling "Less secure app access"

### Issue 3: Connection Timeout

**Symptom**: Error like "Connection timeout" or "ECONNREFUSED"

**Solution**:
- Verify `EMAIL_HOST` is correct: `smtp.hostinger.com`
- Verify `EMAIL_PORT` is correct: `465`
- Check if your firewall/network is blocking SMTP connections
- Try port `587` with `EMAIL_USE_SSL=false` and `EMAIL_USE_TLS=true` (if supported)

### Issue 4: Emails Going to Spam

**Symptom**: Emails sent but not in inbox

**Solution**:
- Check spam/junk folder
- Verify `DEFAULT_FROM_EMAIL` matches `EMAIL_HOST_USER`
- Add SPF/DKIM records to your domain (advanced)

### Issue 5: Service Role Key Missing

**Symptom**: Error "User not found or email not available"

**Solution**:
- Get your Supabase Service Role Key from Supabase Dashboard → Settings → API
- Add it to `.env.local` as `SUPABASE_SERVICE_ROLE_KEY`
- Restart the server

## Step 5: Debug Mode

The email service now has debug logging enabled. Check your server console for:

```
Email Configuration: { host, port, user, passwordSet: true/false }
Attempting to send email: { from, to, subject }
✅ Email sent successfully! { messageId, response }
```

If you see errors, they will show detailed information about what went wrong.

## Step 6: Manual Verification

Test the SMTP connection directly:

1. Check if you can send emails from `support@atlanticgates.live` using an email client
2. Verify the password `Aaasssaaa1@` is correct
3. Test if port 465 is accessible from your server

## Still Not Working?

1. **Check browser console** for client-side errors
2. **Check server console** for server-side errors
3. **Verify transaction was created** - emails are sent after transactions
4. **Check email service is being called** - look for log messages starting with 📧

## Quick Test Checklist

- [ ] `.env.local` file exists in project root
- [ ] All email environment variables are set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set
- [ ] Dev server was restarted after adding env vars
- [ ] Test endpoint returns success: `GET /api/test-email`
- [ ] Test email sends: `POST /api/test-email` with your email
- [ ] Check spam folder
- [ ] Check server console for error messages

