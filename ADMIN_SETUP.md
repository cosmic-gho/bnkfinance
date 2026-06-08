# Admin Panel Setup Guide

## Overview

The admin panel provides comprehensive management tools for users, accounts, transactions, and notifications.

## Setup Steps

### 1. Update Database Schema

Run the updated `supabase-schema.sql` script in your Supabase SQL Editor. This adds:
- `is_admin` field to `user_profiles` table
- Admin RLS policies that allow admins to view and manage all data

### 2. Create Your First Admin User

After running the schema, you need to manually set a user as admin. Run this SQL in Supabase:

```sql
-- Replace 'your-user-email@example.com' with the email of the user you want to make admin
UPDATE user_profiles 
SET is_admin = TRUE 
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'your-user-email@example.com'
);
```

Or if you know the user ID:

```sql
UPDATE user_profiles SET is_admin = TRUE WHERE id = 'user-uuid-here';
```

### 3. Access the Admin Panel

1. Log in with your admin account
2. Navigate to `/admin` in your browser
3. The admin layout will verify you have admin privileges before showing the panel

## Admin Features

### Dashboard (`/admin`)
- Overview statistics (total users, accounts, transactions, balance)
- Quick access to all admin sections

### User Management (`/admin/users`)
- View all users
- Edit user information (name, username)
- Promote/demote users to/from admin status
- View user creation dates

### Account Management (`/admin/accounts`)
- View all accounts across all users
- Edit account balances
- Activate/deactivate accounts
- View account owners

### Transaction Management (`/admin/transactions`)
- View all transactions
- Filter by transaction type (deposit, withdrawal, transfer, payment)
- See transaction details including accounts and users involved
- View transaction history

### Notification Management (`/admin/notifications`)
- View all notifications
- Create new notifications for users
- See notification status (read/unread)

## Security Notes

1. **RLS Policies**: Admin RLS policies check if the current user has `is_admin = TRUE` before allowing access to all data
2. **Client-Side Protection**: The admin layout checks admin status on page load and redirects non-admins
3. **Service Functions**: All admin service functions call `requireAdmin()` to verify permissions

## Limitations

1. **User Email Access**: Due to RLS restrictions, user emails from `auth.users` are not directly accessible from client-side code. Consider creating an API route if email access is needed.

2. **User Deletion**: The `deleteUser` function currently only deletes the user profile, not the auth user. For full user deletion, create a server-side API route using the service role key.

3. **Complex Joins**: Some joins in the admin services might need adjustment based on your actual foreign key names. Test and adjust as needed.

## Future Enhancements

- Server-side API routes for operations requiring service role key
- Bulk operations (bulk user updates, bulk notifications)
- Export functionality (CSV/Excel exports)
- Advanced filtering and search
- Activity logs and audit trails
- User impersonation (for support)
- Email integration for notifications


