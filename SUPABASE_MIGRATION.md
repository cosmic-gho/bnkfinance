# Supabase Migration Guide

This guide explains how to migrate your banking app from the Django REST API backend to Supabase.

## Setup Steps

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and anon key from the project settings

### 2. Configure Environment Variables

Create a `.env.local` file in the root of your project:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set Up Database Schema

1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Run the SQL script from `supabase-schema.sql`

This will create:
- Account types table
- Transaction categories table
- Accounts table (with RLS policies)
- Transactions table (with RLS policies)
- Notifications table (with RLS policies)
- User profiles table (with RLS policies)
- Triggers for automatic profile creation
- Default data for account types and categories

### 4. Authentication Changes

The app now uses Supabase Auth instead of JWT tokens:
- Login uses email/password (changed from username/password)
- Signup creates users in Supabase Auth
- Session management is handled automatically by Supabase
- No need to manually manage access/refresh tokens

### 5. Key Changes Made

#### Authentication
- ✅ Login page now uses email instead of username
- ✅ Signup page includes email field
- ✅ Session management via Supabase Auth

#### Data Access
- ✅ All API calls replaced with Supabase service functions
- ✅ Row Level Security (RLS) policies ensure users can only access their own data
- ✅ Automatic user profile creation on signup

#### Services
- `lib/supabase-services.ts` - Centralized service layer for all database operations
- `lib/supabase.ts` - Supabase client configuration

### 6. Features to Implement

#### OTP Verification (Withdrawals)
The OTP verification for withdrawals is currently stubbed out. To implement:

1. Create a Supabase Edge Function for OTP generation and verification
2. Use Supabase Realtime or email service for sending OTP codes
3. Store OTP codes in a separate table with expiration times
4. Update `handleOtpSubmit` in `app/transfers/page.tsx` to call the Edge Function

#### Notifications
Notifications are set up in the schema but you'll need to:
- Create triggers or Edge Functions to generate notifications on events
- Implement real-time updates using Supabase Realtime subscriptions

### 7. Testing

1. Test user registration with email/password
2. Test login with email/password
3. Test account creation
4. Test deposits, withdrawals, and transfers
5. Verify RLS policies are working (users can only see their own data)

### 8. Migration from Existing Data

If you have existing data in your Django backend:

1. Export data from Django models
2. Transform data to match Supabase schema
3. Import data using Supabase dashboard or SQL scripts
4. Map old user IDs to new Supabase user UUIDs

## Notes

- The schema uses UUIDs for user IDs (from Supabase Auth)
- Row Level Security (RLS) is enabled on all user-specific tables
- All timestamps use `TIMESTAMP WITH TIME ZONE`
- Account balances use `DECIMAL(15, 2)` for precision
- Transaction types are constrained via CHECK constraints

