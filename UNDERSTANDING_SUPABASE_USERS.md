# Understanding Supabase User Tables

## Important: There are TWO "user" concepts in Supabase

### 1. `auth.users` (Built-in, Managed by Supabase)
- **Location:** `auth` schema (not `public`)
- **Visibility:** Not directly visible in SQL Editor, but exists
- **Purpose:** Stores core authentication data (email, password hash, etc.)
- **Creation:** Automatically created when users sign up via Supabase Auth
- **You don't create this table** - Supabase does it automatically

### 2. `user_profiles` (Your Custom Table)
- **Location:** `public` schema
- **Visibility:** Visible in SQL Editor
- **Purpose:** Extends `auth.users` with additional fields (username, first_name, last_name, is_admin, etc.)
- **Creation:** You create this table (via `supabase-schema.sql`)
- **Relationship:** `user_profiles.id` references `auth.users.id`

## How They Work Together

```
User Signs Up
    ↓
Supabase Auth creates record in auth.users (automatic)
    ↓
Trigger (handle_new_user) fires
    ↓
Creates record in user_profiles (your custom table)
    ↓
Creates savings account in accounts table
```

## Tables You Should Have

In the **public** schema, you should have:

1. ✅ `user_profiles` - Extends auth.users
2. ✅ `accounts` - User bank accounts
3. ✅ `account_types` - Types of accounts (Checking, Savings, Business)
4. ✅ `transactions` - Transaction history
5. ✅ `transaction_categories` - Categories for transactions
6. ✅ `notifications` - User notifications

## How to Check Your Tables

Run this in Supabase SQL Editor:

```sql
-- See all tables in public schema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

## If Tables Are Missing

Run the complete schema setup:

**File: `scripts/verify-and-create-tables.sql`**

Or run the full schema:

**File: `supabase-schema.sql`**

## Common Confusion

❌ **Wrong:** "I need to create a users table"
✅ **Right:** "Supabase creates auth.users automatically, I just need user_profiles"

❌ **Wrong:** "I can't see the users table"
✅ **Right:** "auth.users is in the auth schema, I can see user_profiles in public schema"

## Verifying Everything Works

1. **Check if user_profiles exists:**
   ```sql
   SELECT * FROM user_profiles LIMIT 5;
   ```

2. **Check if accounts exist:**
   ```sql
   SELECT * FROM accounts LIMIT 5;
   ```

3. **Check if account_types exist:**
   ```sql
   SELECT * FROM account_types;
   ```

If any of these fail, run `scripts/verify-and-create-tables.sql`

