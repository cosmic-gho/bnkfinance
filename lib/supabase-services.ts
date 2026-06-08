import { supabase } from './supabase'

// Types
export interface User {
  id: string
  username: string
  email: string
  first_name: string
  last_name: string
  currency?: string
  can_transfer?: boolean
  has_pin_2?: boolean
}

export interface Account {
  id: number
  account_type: { id: number; name: string; description: string }
  account_number: string
  balance: string
  transaction_limit?: number
  daily_limit?: number
  created_at: string
  is_active: boolean
}

export interface Transaction {
  id: number
  account: number
  transaction_type: 'deposit' | 'withdrawal' | 'transfer' | 'payment'
  amount: string
  description: string
  category: { id: number; name: string; description: string } | null
  recipient_account: number | null
  timestamp: string
}

export interface Category {
  id: number
  name: string
  description: string
}

export interface Notification {
  id: number
  title: string
  message: string
  is_read: boolean
  created_at: string
}

// Auth Services
export const authService = {
  signUp: async (email: string, password: string, userData: { username: string; first_name: string; last_name: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: userData.username,
          first_name: userData.first_name,
          last_name: userData.last_name,
        },
      },
    })
    if (error) throw error
    return data
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  },

  getUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },
}

// User Services
export const userService = {
  getCurrentUser: async (): Promise<User | null> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // If profile doesn't exist, return null (caller should handle this)
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - profile doesn't exist
        return null
      }
      throw error
    }

    return {
      id: user.id,
      email: user.email || '',
      username: profile?.username || '',
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      currency: profile?.currency || 'USD',
      can_transfer: profile?.can_transfer !== undefined ? profile.can_transfer : true,
      has_pin_2: !!profile?.transfer_pin_2,
    }
  },

  updateProfile: async (profileData: { 
    username?: string; 
    first_name?: string; 
    last_name?: string;
    phone_number?: string | null;
    address?: string | null;
    date_of_birth?: string | null;
    profile_picture?: string | null;
  }) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('user_profiles')
      .update(profileData)
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error
    return data
  },
}

// Account Services
export const accountService = {
  getAccounts: async (): Promise<Account[]> => {
    const { data, error } = await supabase
      .from('accounts')
      .select(`
        *,
        account_type:account_types(*)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data.map((acc: any) => ({
      id: acc.id,
      account_type: acc.account_type,
      account_number: acc.account_number,
      balance: acc.balance.toString(),
      transaction_limit: acc.transaction_limit ? parseFloat(acc.transaction_limit.toString()) : undefined,
      daily_limit: acc.daily_limit ? parseFloat(acc.daily_limit.toString()) : undefined,
      created_at: acc.created_at,
      is_active: acc.is_active,
    }))
  },

  getAccount: async (id: number): Promise<Account> => {
    const { data, error } = await supabase
      .from('accounts')
      .select(`
        *,
        account_type:account_types(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    return {
      id: data.id,
      account_type: data.account_type,
      account_number: data.account_number,
      balance: data.balance.toString(),
      transaction_limit: data.transaction_limit ? parseFloat(data.transaction_limit.toString()) : undefined,
      daily_limit: data.daily_limit ? parseFloat(data.daily_limit.toString()) : undefined,
      created_at: data.created_at,
      is_active: data.is_active,
    }
  },

  createAccount: async (accountData: { account_type_id: number; account_number: string }) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('accounts')
      .insert({
        user_id: user.id,
        ...accountData,
        balance: 0.00,
      })
      .select(`
        *,
        account_type:account_types(*)
      `)
      .single()

    if (error) throw error
    return data
  },

  deposit: async (accountId: number, amount: number, description: string, categoryId?: number) => {
    // Start transaction - update balance and create transaction record
    const { data: account } = await accountService.getAccount(accountId)
    const newBalance = parseFloat(account.balance) + amount

    const { error: updateError } = await supabase
      .from('accounts')
      .update({ balance: newBalance })
      .eq('id', accountId)

    if (updateError) throw updateError

    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        account_id: accountId,
        transaction_type: 'deposit',
        amount,
        description,
        category_id: categoryId || null,
      })
      .select()
      .single()

    if (txError) throw txError

    // Send transaction receipt email (non-blocking)
    const { data: { user } } = await supabase.auth.getUser()
    if (user && transaction) {
      import('./transaction-email-helper').then(({ sendTransactionReceiptEmailHelper }) => {
        sendTransactionReceiptEmailHelper(user.id, transaction.id).catch(err => 
          console.error('Failed to send deposit receipt email:', err)
        )
      })
    }

    return transaction
  },

  withdraw: async (accountId: number, amount: number, description: string, categoryId?: number, bankDetails?: any) => {
    const { data: account } = await accountService.getAccount(accountId)
    const currentBalance = parseFloat(account.balance)

    if (currentBalance < amount) {
      throw new Error('Insufficient funds')
    }

    const newBalance = currentBalance - amount

    const { error: updateError } = await supabase
      .from('accounts')
      .update({ balance: newBalance })
      .eq('id', accountId)

    if (updateError) throw updateError

    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        account_id: accountId,
        transaction_type: 'withdrawal',
        amount,
        description,
        category_id: categoryId || null,
      })
      .select()
      .single()

    if (txError) throw txError

    // In a real app, you'd store bank_details separately
    // For now, return transaction with a mock transaction_id
    return {
      ...transaction,
      transaction_id: transaction.id,
      status: 'pending',
    }
  },

  transfer: async (accountId: number, recipientAccountId: number, amount: number, description: string, categoryId?: number) => {
    // Check if user has transfer permission
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('can_transfer')
      .eq('id', user.id)
      .single()

    if (profileError) throw profileError
    if (profile?.can_transfer === false) {
      throw new Error('TRANSFER_DISABLED')
    }

    const sourceAccount = await accountService.getAccount(accountId)
    const recipientAccount = await accountService.getAccount(recipientAccountId)

    if (parseFloat(sourceAccount.balance) < amount) {
      throw new Error('Insufficient funds')
    }

    // Update source account
    const newSourceBalance = parseFloat(sourceAccount.balance) - amount
    const { error: sourceError } = await supabase
      .from('accounts')
      .update({ balance: newSourceBalance })
      .eq('id', accountId)

    if (sourceError) throw sourceError

    // Update recipient account
    const newRecipientBalance = parseFloat(recipientAccount.balance) + amount
    const { error: recipientError } = await supabase
      .from('accounts')
      .update({ balance: newRecipientBalance })
      .eq('id', recipientAccountId)

    if (recipientError) throw recipientError

    // Create transaction record
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        account_id: accountId,
        transaction_type: 'transfer',
        amount,
        description,
        category_id: categoryId || null,
        recipient_account_id: recipientAccountId,
      })
      .select()
      .single()

    if (txError) throw txError

    // Send transaction receipt email (non-blocking)
    // user is already available from the check at the beginning of the function
    if (user && transaction) {
      import('./transaction-email-helper').then(({ sendTransactionReceiptEmailHelper }) => {
        sendTransactionReceiptEmailHelper(user.id, transaction.id).catch(err => 
          console.error('Failed to send transfer receipt email:', err)
        )
      })
    }

    return transaction
  },

  wireTransfer: async (accountId: number, recipientAccountNumber: string, amount: number, description: string, pin: string, categoryId?: number, bankDetails?: { bank_name: string; bank_address: string; sort_code: string }) => {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Check if user has transfer permission
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('transfer_pin, can_transfer')
      .eq('id', user.id)
      .single()

    if (profileError) throw profileError
    if (profile?.can_transfer === false) {
      throw new Error('TRANSFER_DISABLED')
    }
    if (!profile.transfer_pin) {
      throw new Error('Transfer PIN not set. Please contact admin to set your PIN.')
    }

    // Verify PIN (decode and compare)
    const hashedPin = typeof window !== 'undefined' 
      ? btoa(pin) 
      : Buffer.from(pin).toString('base64')
    
    if (hashedPin !== profile.transfer_pin) {
      throw new Error('Invalid PIN. Please try again.')
    }

    // Get source account with user_id
    const { data: sourceAccountData, error: sourceAccountError } = await supabase
      .from('accounts')
      .select('id, balance, user_id')
      .eq('id', accountId)
      .single()

    if (sourceAccountError || !sourceAccountData) {
      throw new Error('Source account not found')
    }
    
    // Verify account belongs to user
    if (sourceAccountData.user_id !== user.id) {
      throw new Error('Unauthorized: Account does not belong to you')
    }

    if (parseFloat(sourceAccountData.balance.toString()) < amount) {
      throw new Error('Insufficient funds')
    }

    // For wire transfers, recipient is external (not in our database)
    // Only debit source account
    const newSourceBalance = parseFloat(sourceAccountData.balance.toString()) - amount
    const { error: sourceError } = await supabase
      .from('accounts')
      .update({ balance: newSourceBalance })
      .eq('id', accountId)

    if (sourceError) throw sourceError

    // Create transaction record with bank details in description
    // recipient_account_id is null for external wire transfers
    const fullDescription = bankDetails 
      ? `${description}\n\nRecipient Account: ${recipientAccountNumber}\nBank Details:\nBank Name: ${bankDetails.bank_name}\nAddress: ${bankDetails.bank_address}\nSort Code: ${bankDetails.sort_code}`
      : `${description}\n\nRecipient Account: ${recipientAccountNumber}`

    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        account_id: accountId,
        transaction_type: 'wire_transfer',
        amount,
        description: fullDescription,
        category_id: categoryId || null,
        recipient_account_id: null, // External account, not in our database
      })
      .select()
      .single()

    if (txError) throw txError
    return transaction
  },

  createPendingWireTransfer: async (accountId: number, recipientAccountNumber: string, amount: number, description: string, categoryId?: number, bankDetails?: { bank_name: string; bank_address: string; sort_code: string }, pin?: string) => {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Check if user has transfer permission
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('can_transfer, transfer_pin')
      .eq('id', user.id)
      .single()

    if (profileError) throw profileError
    if (profile?.can_transfer === false) {
      throw new Error('TRANSFER_DISABLED')
    }

    let verificationStep = 0;
    if (pin) {
       if (!profile.transfer_pin) {
          throw new Error('Transfer PIN not set. Please contact admin to set your PIN.')
       }
       const hashedPin = typeof window !== 'undefined' 
        ? btoa(pin) 
        : Buffer.from(pin).toString('base64')
       
       if (hashedPin !== profile.transfer_pin) {
          throw new Error('Invalid PIN. Please try again.')
       }
       verificationStep = 1;
    }

    // Get source account with user_id
    const { data: sourceAccountData, error: sourceAccountError } = await supabase
      .from('accounts')
      .select('id, balance, user_id')
      .eq('id', accountId)
      .single()

    if (sourceAccountError || !sourceAccountData) {
      throw new Error('Source account not found')
    }
    
    // Verify account belongs to user
    if (sourceAccountData.user_id !== user.id) {
      throw new Error('Unauthorized: Account does not belong to you')
    }

    if (parseFloat(sourceAccountData.balance.toString()) < amount) {
      throw new Error('Insufficient funds')
    }

    // For wire transfers, recipient is external (not in our database)
    // Store recipient account number and bank details in description
    const fullDescription = bankDetails 
      ? `${description}\n\nRecipient Account: ${recipientAccountNumber}\nBank Details:\nBank Name: ${bankDetails.bank_name}\nAddress: ${bankDetails.bank_address}\nSort Code: ${bankDetails.sort_code}`
      : `${description}\n\nRecipient Account: ${recipientAccountNumber}`

    // Create transaction record with status: pending
    // recipient_account_id is null for external wire transfers
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        account_id: accountId,
        transaction_type: 'wire_transfer',
        amount,
        description: fullDescription,
        category_id: categoryId || null,
        recipient_account_id: null, // External account, not in our database
        status: 'pending',
        verification_step: verificationStep
      })
      .select()
      .single()

    if (txError) throw txError
    return transaction.id
  },

  completePendingWireTransfer: async (transactionId: number, pin: string, pin2?: string) => {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Get the pending transaction FIRST to check step
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('id, account_id, recipient_account_id, amount, status, transaction_type, verification_step')
      .eq('id', transactionId)
      .single()

    if (txError || !transaction) {
      throw new Error('Transaction not found')
    }

    if (transaction.status !== 'pending') {
      throw new Error(`Transaction is already ${transaction.status}`)
    }

    // Check if user has transfer permission and get PINs
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('transfer_pin, transfer_pin_2, can_transfer')
      .eq('id', user.id)
      .single()

    if (profileError) throw profileError
    if (profile?.can_transfer === false) {
      throw new Error('TRANSFER_DISABLED')
    }
    if (!profile.transfer_pin) {
      throw new Error('Transfer PIN not set. Please contact admin to set your PIN.')
    }

    // Check verification step
    // If step is 1, user has already verified PIN 1. We expect 'pin' arg to be PIN 2.
    if (transaction.verification_step === 1) {
      if (profile.transfer_pin_2) {
        // Verify PIN 2
        const hashedPin2 = typeof window !== 'undefined' 
          ? btoa(pin) 
          : Buffer.from(pin).toString('base64')
        
        if (hashedPin2 !== profile.transfer_pin_2) {
          throw new Error('Invalid Second PIN. Please try again.')
        }
      }
      // If no PIN 2 set, step 1 is sufficient (but UI should handle this case)
    } else {
      // Step 0: Standard verification
      // Verify PIN 1
      const hashedPin = typeof window !== 'undefined' 
        ? btoa(pin) 
        : Buffer.from(pin).toString('base64')
      
      if (hashedPin !== profile.transfer_pin) {
        throw new Error('Invalid PIN. Please try again.')
      }

      // Verify PIN 2 if set
      if (profile.transfer_pin_2) {
        if (!pin2) {
          throw new Error('Second PIN is required.')
        }
        const hashedPin2 = typeof window !== 'undefined' 
          ? btoa(pin2) 
          : Buffer.from(pin2).toString('base64')
        
        if (hashedPin2 !== profile.transfer_pin_2) {
          throw new Error('Invalid Second PIN. Please try again.')
        }
      }
    }

    // Verify transaction belongs to user
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('user_id, balance')
      .eq('id', transaction.account_id)
      .single()

    if (accountError || !account) {
      throw new Error('Account not found')
    }

    if (account.user_id !== user.id) {
      throw new Error('Unauthorized: Transaction does not belong to you')
    }

    // Check sufficient funds
    if (parseFloat(account.balance.toString()) < parseFloat(transaction.amount.toString())) {
      throw new Error('Insufficient funds')
    }

    // For wire transfers, recipient is external - only debit source account
    // For local transfers, we would credit the recipient account, but wire transfers are external
    if (transaction.transaction_type === 'wire_transfer') {
      // Only debit source account (recipient is external)
      const newSourceBalance = parseFloat(account.balance.toString()) - parseFloat(transaction.amount.toString())
      const { error: sourceError } = await supabase
        .from('accounts')
        .update({ balance: newSourceBalance })
        .eq('id', transaction.account_id)

      if (sourceError) throw sourceError
    } else if (transaction.transaction_type === 'local_transfer' && transaction.recipient_account_id) {
      // For local transfers, both debit and credit
      const newSourceBalance = parseFloat(account.balance.toString()) - parseFloat(transaction.amount.toString())
      const { error: sourceError } = await supabase
        .from('accounts')
        .update({ balance: newSourceBalance })
        .eq('id', transaction.account_id)

      if (sourceError) throw sourceError

      // Get recipient account
      const { data: recipientAccount, error: recipientError } = await supabase
        .from('accounts')
        .select('id, balance')
        .eq('id', transaction.recipient_account_id)
        .single()

      if (recipientError || !recipientAccount) {
        throw new Error('Recipient account not found')
      }

      // Update recipient account (credit)
      const newRecipientBalance = parseFloat(recipientAccount.balance.toString()) + parseFloat(transaction.amount.toString())
      const { error: updateRecipientError } = await supabase
        .from('accounts')
        .update({ balance: newRecipientBalance })
        .eq('id', transaction.recipient_account_id)

      if (updateRecipientError) throw updateRecipientError
    }

    // Update transaction status to approved
    const { error: updateTxError } = await supabase
      .from('transactions')
      .update({ status: 'approved' })
      .eq('id', transactionId)

    if (updateTxError) throw updateTxError

    // Send transaction receipt email (non-blocking)
    if (user && transactionId) {
      import('./transaction-email-helper').then(({ sendTransactionReceiptEmailHelper }) => {
        sendTransactionReceiptEmailHelper(user.id, transactionId).catch(err => 
          console.error('Failed to send wire transfer receipt email:', err)
        )
      })
    }

    return { success: true }
  },

  getPendingTransactions: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Get user's accounts
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .select('id')
      .eq('user_id', user.id)

    if (accountsError) throw accountsError
    const accountIds = accounts.map(acc => acc.id)

    // Get pending transactions for user's accounts
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select(`
        *,
        category:transaction_categories(*),
        account:accounts!transactions_account_id_fkey(id, account_number),
        recipient_account:accounts!transactions_recipient_account_id_fkey(id, account_number)
      `)
      .in('account_id', accountIds)
      .or('status.is.null,status.eq.pending')
      .order('timestamp', { ascending: false })

    if (txError) throw txError
    return transactions || []
  },
}

// Transaction Services
export const transactionService = {
  getTransactions: async (filters?: { account_id?: number }): Promise<Transaction[]> => {
    let query = supabase
      .from('transactions')
      .select(`
        *,
        category:transaction_categories(*)
      `)
      .order('timestamp', { ascending: false })

    if (filters?.account_id) {
      query = query.or(`account_id.eq.${filters.account_id},recipient_account_id.eq.${filters.account_id}`)
    }

    const { data, error } = await query
    if (error) throw error

    return data.map((tx: any) => ({
      id: tx.id,
      account: tx.account_id,
      transaction_type: tx.transaction_type,
      amount: tx.amount.toString(),
      description: tx.description,
      category: tx.category,
      recipient_account: tx.recipient_account_id,
      timestamp: tx.timestamp,
    }))
  },

  getSpendingByCategory: async (accountId?: number): Promise<Array<{ category__name: string | null; total: string }>> => {
    let query = supabase
      .from('transactions')
      .select(`
        amount,
        category:transaction_categories(name),
        account_id
      `)
      .eq('transaction_type', 'withdrawal')

    if (accountId) {
      query = query.eq('account_id', accountId)
    }

    const { data, error } = await query
    if (error) throw error

    // Group by category and sum amounts
    const grouped = data.reduce((acc: any, tx: any) => {
      const categoryName = tx.category?.name || null
      if (!acc[categoryName]) {
        acc[categoryName] = 0
      }
      acc[categoryName] += parseFloat(tx.amount)
      return acc
    }, {})

    return Object.entries(grouped).map(([category__name, total]) => ({
      category__name,
      total: (total as number).toString(),
    }))
  },

  getMonthlySpending: async (accountId?: number): Promise<Array<{ month: number; total: string }>> => {
    let query = supabase
      .from('transactions')
      .select('amount, timestamp, account_id')
      .eq('transaction_type', 'withdrawal')

    if (accountId) {
      query = query.eq('account_id', accountId)
    }

    const { data, error } = await query
    if (error) throw error

    // Group by month
    const grouped = data.reduce((acc: any, tx: any) => {
      const date = new Date(tx.timestamp)
      const month = date.getMonth() + 1
      if (!acc[month]) {
        acc[month] = 0
      }
      acc[month] += parseFloat(tx.amount)
      return acc
    }, {})

    return Object.entries(grouped).map(([month, total]) => ({
      month: parseInt(month),
      total: (total as number).toString(),
    }))
  },
}

// Category Services
export const categoryService = {
  getCategories: async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from('transaction_categories')
      .select('*')
      .order('name')

    if (error) throw error
    return data
  },
}

// Notification Services
export const notificationService = {
  getNotifications: async (): Promise<Notification[]> => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  markAsRead: async (id: number) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)

    if (error) throw error
  },

  /**
   * Create a notification and send email alert
   * This is the centralized function for creating notifications with email alerts
   */
  createNotification: async (userId: string, title: string, message: string): Promise<any> => {
    // Create notification in database
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
      })
      .select()
      .single()

    if (error) throw error

    // Send email notification (don't block if email fails)
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
      })

      if (!response.ok) {
        console.error('Failed to send notification email, but notification was created')
      }
    } catch (emailError) {
      console.error('Error sending notification email:', emailError)
      // Don't throw - notification was created successfully
    }

    return data
  },
}

// Crypto Wallet Services (for users)
export const cryptoWalletService = {
  getActiveCryptoWallets: async () => {
    const { data, error } = await supabase
      .from('crypto_wallets')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },
}

// Deposit Request Services (for users)
export const depositRequestService = {
  createDepositRequest: async (requestData: {
    account_id: number
    crypto_wallet_id: number
    amount: number
    crypto_symbol: string
    transaction_hash?: string
  }) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Verify account belongs to user
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('user_id')
      .eq('id', requestData.account_id)
      .single()

    if (accountError || !account) {
      throw new Error('Account not found')
    }

    if (account.user_id !== user.id) {
      throw new Error('Unauthorized: Account does not belong to you')
    }

    const { data, error } = await supabase
      .from('deposit_requests')
      .insert({
        user_id: user.id,
        account_id: requestData.account_id,
        crypto_wallet_id: requestData.crypto_wallet_id,
        amount: requestData.amount,
        crypto_symbol: requestData.crypto_symbol,
        transaction_hash: requestData.transaction_hash || null,
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  getMyDepositRequests: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('deposit_requests')
      .select(`
        *,
        account:accounts(id, account_number, account_type:account_types(name)),
        crypto_wallet:crypto_wallets(id, name, symbol, logo_url)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  cancelDepositRequest: async (requestId: number) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Verify request belongs to user and is pending
    const { data: request, error: requestError } = await supabase
      .from('deposit_requests')
      .select('user_id, status')
      .eq('id', requestId)
      .single()

    if (requestError || !request) {
      throw new Error('Deposit request not found')
    }

    if (request.user_id !== user.id) {
      throw new Error('Unauthorized: Request does not belong to you')
    }

    if (request.status !== 'pending') {
      throw new Error('Only pending requests can be cancelled')
    }

    const { error } = await supabase
      .from('deposit_requests')
      .update({ status: 'cancelled' })
      .eq('id', requestId)

    if (error) throw error
  },
}

// Helper function to generate dummy CC number (Luhn algorithm)
function generateDummyCCNumber(): string {
  // Generate a valid-looking card number (16 digits)
  // Using 4 prefix for Visa-like numbers
  const prefix = '4'
  const digits: number[] = [parseInt(prefix)]
  
  // Generate random digits
  for (let i = 1; i < 15; i++) {
    digits.push(Math.floor(Math.random() * 10))
  }
  
  // Calculate Luhn check digit
  let sum = 0
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = digits[i]
    if ((digits.length - i) % 2 === 0) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }
    sum += digit
  }
  
  const checkDigit = (10 - (sum % 10)) % 10
  digits.push(checkDigit)
  
  // Format as XXXX XXXX XXXX XXXX
  const cardNumber = digits.join('')
  return `${cardNumber.slice(0, 4)} ${cardNumber.slice(4, 8)} ${cardNumber.slice(8, 12)} ${cardNumber.slice(12, 16)}`
}

function generateCVV(): string {
  return Math.floor(100 + Math.random() * 900).toString()
}

function generateExpiryDate(): { month: string; year: string } {
  const now = new Date()
  const month = String(now.getMonth() + 1 + Math.floor(Math.random() * 24)).padStart(2, '0')
  const year = String(now.getFullYear() + Math.floor(Math.random() * 5) + 1)
  return { month, year }
}

// Card Request Services (for users)
export const cardRequestService = {
  createCardRequest: async (requestData: {
    account_id: number
    card_type: 'virtual' | 'physical'
    card_tier?: 'standard' | 'gold' | 'platinum'
    card_holder_name: string
    daily_limit?: number
  }) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Verify account belongs to user
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('user_id')
      .eq('id', requestData.account_id)
      .single()

    if (accountError || !account) {
      throw new Error('Account not found')
    }

    if (account.user_id !== user.id) {
      throw new Error('Unauthorized: Account does not belong to you')
    }

    // Generate dummy card details
    const cardNumber = generateDummyCCNumber()
    const cvv = generateCVV()
    const { month, year } = generateExpiryDate()

    // Get user profile for card holder name if not provided
    let cardHolderName = requestData.card_holder_name
    if (!cardHolderName) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single()
      
      if (profile) {
        cardHolderName = `${profile.first_name} ${profile.last_name}`
      }
    }

    const { data, error } = await supabase
      .from('card_requests')
      .insert({
        user_id: user.id,
        account_id: requestData.account_id,
        card_type: requestData.card_type,
        card_tier: requestData.card_tier || 'standard',
        card_number: cardNumber,
        expiry_month: month,
        expiry_year: year,
        cvv: cvv,
        card_holder_name: cardHolderName,
        daily_limit: requestData.daily_limit || 1000.00,
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  getMyCardRequests: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('card_requests')
      .select(`
        *,
        account:accounts(id, account_number, account_type:account_types(name))
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  cancelCardRequest: async (requestId: number) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Verify request belongs to user
    const { data: request, error: requestError } = await supabase
      .from('card_requests')
      .select('user_id, status')
      .eq('id', requestId)
      .single()

    if (requestError || !request) {
      throw new Error('Card request not found')
    }

    if (request.user_id !== user.id) {
      throw new Error('Unauthorized: Request does not belong to you')
    }

    if (request.status !== 'pending') {
      throw new Error('Only pending requests can be cancelled')
    }

    const { error } = await supabase
      .from('card_requests')
      .update({ status: 'cancelled' })
      .eq('id', requestId)

    if (error) throw error
  },
}

// KYC Submission Services (for users)
export const kycService = {
  createKYCSubmission: async (submissionData: {
    ssn?: string
    id_card_front_url: string
    id_card_back_url: string
    address_line1: string
    address_line2?: string
    city: string
    state: string
    zip_code: string
    country?: string
    phone_number: string
    email: string
  }) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Verify email matches auth user
    if (submissionData.email !== user.email) {
      throw new Error('Email must match your account email')
    }

    // Check if user already has a pending or approved KYC
    const { data: existingKYC } = await supabase
      .from('kyc_submissions')
      .select('id, status')
      .eq('user_id', user.id)
      .in('status', ['pending', 'under_review', 'approved'])
      .single()

    if (existingKYC) {
      throw new Error(`You already have a ${existingKYC.status} KYC submission`)
    }

    const { data, error } = await supabase
      .from('kyc_submissions')
      .insert({
        user_id: user.id,
        ssn: submissionData.ssn || null,
        id_card_front_url: submissionData.id_card_front_url,
        id_card_back_url: submissionData.id_card_back_url,
        address_line1: submissionData.address_line1,
        address_line2: submissionData.address_line2 || null,
        city: submissionData.city,
        state: submissionData.state,
        zip_code: submissionData.zip_code,
        country: submissionData.country || 'United States',
        phone_number: submissionData.phone_number,
        email: submissionData.email,
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  getMyKYCSubmission: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('kyc_submissions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
    return data || null
  },

  updateKYCSubmission: async (submissionId: number, updates: {
    ssn?: string
    id_card_front_url?: string
    id_card_back_url?: string
    address_line1?: string
    address_line2?: string
    city?: string
    state?: string
    zip_code?: string
    country?: string
    phone_number?: string
    email?: string
  }) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Verify submission belongs to user and is pending
    const { data: submission, error: fetchError } = await supabase
      .from('kyc_submissions')
      .select('user_id, status')
      .eq('id', submissionId)
      .single()

    if (fetchError || !submission) {
      throw new Error('KYC submission not found')
    }

    if (submission.user_id !== user.id) {
      throw new Error('Unauthorized: This KYC submission does not belong to you')
    }

    if (submission.status !== 'pending') {
      throw new Error('Only pending KYC submissions can be updated')
    }

    const { data, error } = await supabase
      .from('kyc_submissions')
      .update(updates)
      .eq('id', submissionId)
      .select()
      .single()

    if (error) throw error
    return data
  },
}


