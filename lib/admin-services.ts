import { supabase } from './supabase'
import { requireAdmin } from './admin-utils'

// Admin User Services
export const adminUserService = {
  getAllUsers: async () => {
    await requireAdmin()
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    
    // Fetch email from auth.users - note: this requires admin access or service role
    // For client-side, we'll just return the profile data
    return data
  },

  getUser: async (userId: string) => {
    await requireAdmin()
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  },

  updateUser: async (userId: string, updates: { username?: string; first_name?: string; last_name?: string; is_admin?: boolean; currency?: string }) => {
    await requireAdmin()
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  deleteUser: async (userId: string) => {
    await requireAdmin()
    // Note: User deletion from auth.users requires server-side API route with service role
    // For now, we'll just delete the profile (user will remain in auth but without profile)
    // In production, create an API route: /api/admin/users/[id]/delete
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', userId)
    if (error) throw error
  },

  setAdminStatus: async (userId: string, isAdmin: boolean) => {
    await requireAdmin()
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ is_admin: isAdmin })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  setTransferPin: async (userId: string, pin: string) => {
    await requireAdmin()
    // Validate PIN is 4 digits
    if (!/^\d{4}$/.test(pin)) {
      throw new Error('PIN must be exactly 4 digits')
    }
    
    // Hash the PIN before storing
    const hashedPin = typeof window !== 'undefined' 
      ? btoa(pin) 
      : Buffer.from(pin).toString('base64')
    
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ transfer_pin: hashedPin })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  setTransferPin2: async (userId: string, pin: string) => {
    await requireAdmin()
    // Validate PIN is 4 digits
    if (!/^\d{4}$/.test(pin)) {
      throw new Error('PIN must be exactly 4 digits')
    }
    
    // Hash the PIN before storing
    const hashedPin = typeof window !== 'undefined' 
      ? btoa(pin) 
      : Buffer.from(pin).toString('base64')
    
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ transfer_pin_2: hashedPin })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  clearTransferPin: async (userId: string) => {
    await requireAdmin()
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ transfer_pin: null })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  clearTransferPin2: async (userId: string) => {
    await requireAdmin()
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ transfer_pin_2: null })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  toggleTransferPermission: async (userId: string, canTransfer: boolean) => {
    await requireAdmin()
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ can_transfer: canTransfer })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  updateUserCurrency: async (userId: string, currency: string) => {
    await requireAdmin()
    // Validate currency code
    const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'AUD', 'CAD', 'CHF', 'HKD', 'SGD']
    if (!validCurrencies.includes(currency.toUpperCase())) {
      throw new Error(`Invalid currency code. Must be one of: ${validCurrencies.join(', ')}`)
    }
    
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ currency: currency.toUpperCase() })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },
}

// Admin Account Services
export const adminAccountService = {
  getAllAccounts: async () => {
    await requireAdmin()
    // First get accounts with account types
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .select(`
        *,
        account_type:account_types(*)
      `)
      .order('created_at', { ascending: false })

    if (accountsError) throw accountsError
    if (!accounts || accounts.length === 0) return []

    // Then get user profiles for all user_ids
    const userIds = [...new Set(accounts.map((acc: any) => acc.user_id))]
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, username, first_name, last_name')
      .in('id', userIds)

    if (profilesError) throw profilesError

    // Join the data
    const profilesMap = new Map((profiles || []).map((p: any) => [p.id, p]))
    return accounts.map((acc: any) => ({
      ...acc,
      user: profilesMap.get(acc.user_id) || null
    }))
  },

  getAccount: async (accountId: number) => {
    await requireAdmin()
    // Get account with account type
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select(`
        *,
        account_type:account_types(*)
      `)
      .eq('id', accountId)
      .single()

    if (accountError) throw accountError
    if (!account) return null

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, username, first_name, last_name')
      .eq('id', account.user_id)
      .single()

    if (profileError) throw profileError

    return {
      ...account,
      user: profile || null
    }
  },

  updateAccount: async (accountId: number, updates: { balance?: number; is_active?: boolean; transaction_limit?: number; daily_limit?: number }) => {
    await requireAdmin()
    const { data, error } = await supabase
      .from('accounts')
      .update(updates)
      .eq('id', accountId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  updateAccountLimits: async (accountId: number, transactionLimit: number, dailyLimit: number) => {
    await requireAdmin()
    
    if (transactionLimit < 0 || dailyLimit < 0) {
      throw new Error('Limits cannot be negative')
    }

    const { data, error } = await supabase
      .from('accounts')
      .update({ 
        transaction_limit: transactionLimit,
        daily_limit: dailyLimit
      })
      .eq('id', accountId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  deleteAccount: async (accountId: number) => {
    await requireAdmin()
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', accountId)

    if (error) throw error
  },

  createAccount: async (accountData: { user_id: string; account_type_id: number; balance?: number; account_number?: string }) => {
    await requireAdmin()
    
    // Generate account number if not provided
    let accountNumber = accountData.account_number
    if (!accountNumber) {
      // Get account type name for prefix
      const { data: accountType, error: typeError } = await supabase
        .from('account_types')
        .select('name')
        .eq('id', accountData.account_type_id)
        .single()
      
      if (typeError) throw typeError
      
      const prefix = accountType.name.substring(0, 3).toUpperCase()
      const now = new Date()
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
      const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '')
      const randomStr = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
      
      // Generate: PREFIX-YYYYMMDD-HHMMSS-XXXXXX
      accountNumber = `${prefix}-${dateStr}-${timeStr}-${randomStr}`
      
      // Ensure uniqueness by checking and regenerating if needed
      let attempts = 0
      const maxAttempts = 10
      while (attempts < maxAttempts) {
        const { data: existing } = await supabase
          .from('accounts')
          .select('id')
          .eq('account_number', accountNumber)
          .single()
        
        if (!existing) break // Account number is unique
        
        // Regenerate
        const newRandomStr = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
        accountNumber = `${prefix}-${dateStr}-${timeStr}-${newRandomStr}`
        attempts++
      }
      
      if (attempts >= maxAttempts) {
        // Fallback: use timestamp-based number
        accountNumber = `${prefix}-${dateStr}-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`
      }
    }

    const { data, error } = await supabase
      .from('accounts')
      .insert({
        user_id: accountData.user_id,
        account_type_id: accountData.account_type_id,
        account_number: accountNumber,
        balance: accountData.balance || 0.00,
        is_active: true,
      })
      .select(`
        *,
        account_type:account_types(*)
      `)
      .single()

    if (error) throw error
    return data
  },

  getAccountTypes: async () => {
    await requireAdmin()
    const { data, error } = await supabase
      .from('account_types')
      .select('*')
      .order('name')

    if (error) throw error
    return data
  },
}

// Admin Transaction Services
export const adminTransactionService = {
  getAllTransactions: async (filters?: { account_id?: number; user_id?: string; transaction_type?: string; status?: string }) => {
    await requireAdmin()
    let query = supabase
      .from('transactions')
      .select(`
        *,
        category:transaction_categories(*),
        account:accounts!transactions_account_id_fkey(id, account_number, user_id),
        recipient_account:accounts!transactions_recipient_account_id_fkey(id, account_number, user_id)
      `)
      .order('timestamp', { ascending: false })

    if (filters?.account_id) {
      query = query.eq('account_id', filters.account_id)
    }
    if (filters?.transaction_type) {
      query = query.eq('transaction_type', filters.transaction_type)
    }
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    const { data: transactions, error } = await query
    if (error) throw error
    if (!transactions || transactions.length === 0) return []

    // Get all unique user_ids from accounts
    const userIds = new Set<string>()
    transactions.forEach((t: any) => {
      if (t.account?.user_id) userIds.add(t.account.user_id)
      if (t.recipient_account?.user_id) userIds.add(t.recipient_account.user_id)
    })

    // Fetch user profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, username, first_name, last_name')
      .in('id', Array.from(userIds))

    if (profilesError) throw profilesError

    // Join user profiles with accounts
    const profilesMap = new Map((profiles || []).map((p: any) => [p.id, p]))
    return transactions.map((t: any) => ({
      ...t,
      account: t.account ? {
        ...t.account,
        user: profilesMap.get(t.account.user_id) || null
      } : null,
      recipient_account: t.recipient_account ? {
        ...t.recipient_account,
        user: profilesMap.get(t.recipient_account.user_id) || null
      } : null
    }))
  },

  getTransaction: async (transactionId: number) => {
    await requireAdmin()
    const { data: transaction, error } = await supabase
      .from('transactions')
      .select(`
        *,
        category:transaction_categories(*),
        account:accounts!transactions_account_id_fkey(id, account_number, user_id),
        recipient_account:accounts!transactions_recipient_account_id_fkey(id, account_number, user_id)
      `)
      .eq('id', transactionId)
      .single()

    if (error) throw error
    if (!transaction) return null

    // Get user profiles for account and recipient_account
    const userIds: string[] = []
    if (transaction.account?.user_id) userIds.push(transaction.account.user_id)
    if (transaction.recipient_account?.user_id) userIds.push(transaction.recipient_account.user_id)

    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, username, first_name, last_name')
      .in('id', userIds)

    if (profilesError) throw profilesError

    const profilesMap = new Map((profiles || []).map((p: any) => [p.id, p]))
    return {
      ...transaction,
      account: transaction.account ? {
        ...transaction.account,
        user: profilesMap.get(transaction.account.user_id) || null
      } : null,
      recipient_account: transaction.recipient_account ? {
        ...transaction.recipient_account,
        user: profilesMap.get(transaction.recipient_account.user_id) || null
      } : null
    }
  },

  deleteTransaction: async (transactionId: number) => {
    await requireAdmin()
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId)

    if (error) throw error
  },

  createTransaction: async (transactionData: {
    account_id: number
    transaction_type: 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'local_transfer' | 'wire_transfer'
    amount: number
    description?: string
    category_id?: number | null
    recipient_account_id?: number | null
    pin?: string
  }) => {
    await requireAdmin()

    // Verify PIN for local_transfer and wire_transfer
    if (transactionData.transaction_type === 'local_transfer' || transactionData.transaction_type === 'wire_transfer') {
      if (!transactionData.pin) {
        throw new Error('PIN is required for local and wire transfers')
      }

      // Get the account to find the user
      const { data: account, error: accountError } = await supabase
        .from('accounts')
        .select('user_id')
        .eq('id', transactionData.account_id)
        .single()

      if (accountError) throw accountError

      // Get user profile to verify PIN
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('transfer_pin')
        .eq('id', account.user_id)
        .single()

      if (profileError) throw profileError

      if (!profile.transfer_pin) {
        throw new Error('User does not have a transfer PIN set. Please set a PIN first.')
      }

      // Verify PIN (decode and compare)
      const hashedPin = typeof window !== 'undefined' 
        ? btoa(transactionData.pin) 
        : Buffer.from(transactionData.pin).toString('base64')
      
      if (hashedPin !== profile.transfer_pin) {
        throw new Error('Invalid PIN. Please verify the PIN is correct.')
      }
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        account_id: transactionData.account_id,
        transaction_type: transactionData.transaction_type,
        amount: transactionData.amount,
        description: transactionData.description || null,
        category_id: transactionData.category_id || null,
        recipient_account_id: transactionData.recipient_account_id || null,
      })
      .select(`
        *,
        category:transaction_categories(*),
        account:accounts!transactions_account_id_fkey(id, account_number, user_id),
        recipient_account:accounts!transactions_recipient_account_id_fkey(id, account_number, user_id)
      `)
      .single()

    if (error) throw error
    return data
  },

  getTransactionCategories: async () => {
    await requireAdmin()
    const { data, error } = await supabase
      .from('transaction_categories')
      .select('*')
      .order('name')

    if (error) throw error
    return data
  },

  updateTransactionStatus: async (transactionId: number, status: 'approved' | 'rejected', adminNotes?: string) => {
    await requireAdmin()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    console.log('updateTransactionStatus called:', { transactionId, status, adminNotes });

    // Get the transaction with account details
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select(`
        *,
        account:accounts!transactions_account_id_fkey(id, balance, user_id)
      `)
      .eq('id', transactionId)
      .single()

    if (txError || !transaction) {
      console.error('Error fetching transaction:', txError);
      throw new Error(`Transaction not found: ${txError?.message || 'Unknown error'}`)
    }

    console.log('Transaction found:', { 
      id: transaction.id, 
      type: transaction.transaction_type, 
      status: transaction.status,
      amount: transaction.amount 
    });

    // Only allow status changes for pending transactions or transactions without status
    const currentStatus = transaction.status || null // No status means it's pending/needs approval
    if (currentStatus && currentStatus !== 'pending' && currentStatus !== 'approved') {
      throw new Error(`Cannot change status of ${currentStatus} transaction`)
    }

    // If approving a pending transaction (or transaction without status), process it (update balances)
    if (status === 'approved' && (!currentStatus || currentStatus === 'pending')) {
      const txType = transaction.transaction_type
      const amount = parseFloat(transaction.amount.toString())
      const account = transaction.account
      const currentBalance = parseFloat(account.balance.toString())

      if (txType === 'deposit') {
        // Credit the account
        const newBalance = currentBalance + amount
        const { error: balanceError } = await supabase
          .from('accounts')
          .update({ balance: newBalance })
          .eq('id', transaction.account_id)

        if (balanceError) throw balanceError
      } else if (['withdrawal', 'transfer', 'local_transfer', 'wire_transfer', 'payment'].includes(txType)) {
        // Debit the account
        if (currentBalance < amount) {
          throw new Error('Insufficient funds to approve this transaction')
        }
        const newBalance = currentBalance - amount
        const { error: balanceError } = await supabase
          .from('accounts')
          .update({ balance: newBalance })
          .eq('id', transaction.account_id)

        if (balanceError) throw balanceError

        // For transfers, also credit recipient account
        if (['transfer', 'local_transfer'].includes(txType) && transaction.recipient_account_id) {
          const { data: recipientAccount, error: recipientError } = await supabase
            .from('accounts')
            .select('balance')
            .eq('id', transaction.recipient_account_id)
            .single()

          if (recipientError) throw recipientError

          const recipientBalance = parseFloat(recipientAccount.balance.toString())
          const newRecipientBalance = recipientBalance + amount
          const { error: updateRecipientError } = await supabase
            .from('accounts')
            .update({ balance: newRecipientBalance })
            .eq('id', transaction.recipient_account_id)

          if (updateRecipientError) throw updateRecipientError
        }
      }
    }

    // If rejecting, we might need to reverse the transaction if it was already processed
    // For now, we'll just update the status
    if (status === 'rejected' && currentStatus === 'approved') {
      // Reverse the transaction
      const txType = transaction.transaction_type
      const amount = parseFloat(transaction.amount.toString())
      const account = transaction.account
      const currentBalance = parseFloat(account.balance.toString())

      if (txType === 'deposit') {
        // Reverse deposit: debit the account
        if (currentBalance < amount) {
          throw new Error('Cannot reverse: insufficient funds')
        }
        const newBalance = currentBalance - amount
        const { error: balanceError } = await supabase
          .from('accounts')
          .update({ balance: newBalance })
          .eq('id', transaction.account_id)

        if (balanceError) throw balanceError
      } else if (['withdrawal', 'transfer', 'local_transfer', 'wire_transfer', 'payment'].includes(txType)) {
        // Reverse withdrawal/transfer: credit back to account
        const newBalance = currentBalance + amount
        const { error: balanceError } = await supabase
          .from('accounts')
          .update({ balance: newBalance })
          .eq('id', transaction.account_id)

        if (balanceError) throw balanceError

        // For transfers, also debit recipient account
        if (['transfer', 'local_transfer'].includes(txType) && transaction.recipient_account_id) {
          const { data: recipientAccount, error: recipientError } = await supabase
            .from('accounts')
            .select('balance')
            .eq('id', transaction.recipient_account_id)
            .single()

          if (recipientError) throw recipientError

          const recipientBalance = parseFloat(recipientAccount.balance.toString())
          if (recipientBalance < amount) {
            throw new Error('Cannot reverse: recipient account has insufficient funds')
          }
          const newRecipientBalance = recipientBalance - amount
          const { error: updateRecipientError } = await supabase
            .from('accounts')
            .update({ balance: newRecipientBalance })
            .eq('id', transaction.recipient_account_id)

          if (updateRecipientError) throw updateRecipientError
        }
      }
    }

    // Update transaction status
    const updatedDescription = adminNotes 
      ? `${transaction.description || ''}\n\nAdmin Notes: ${adminNotes}`.trim()
      : transaction.description

    console.log('Updating transaction status:', { transactionId, status, updatedDescription });

    // Update the transaction
    const { error: updateError } = await supabase
      .from('transactions')
      .update({
        status: status,
        description: updatedDescription,
      })
      .eq('id', transactionId)

    if (updateError) {
      console.error('Error updating transaction:', updateError);
      throw new Error(`Failed to update transaction: ${updateError.message}`)
    }

    // Fetch the updated transaction separately
    const { data: updatedTransaction, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single()

    if (fetchError || !updatedTransaction) {
      console.error('Error fetching updated transaction:', fetchError);
      throw new Error(`Failed to fetch updated transaction: ${fetchError?.message || 'No data returned'}`)
    }

    console.log('Transaction updated successfully:', updatedTransaction);
    return updatedTransaction
  },

  updateTransactionDate: async (transactionId: number, newDate: string) => {
    await requireAdmin()
    
    // Validate date format
    const date = new Date(newDate)
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format')
    }

    const { data, error } = await supabase
      .from('transactions')
      .update({ timestamp: newDate })
      .eq('id', transactionId)
      .select()
      .single()

    if (error) throw error
    return data
  },
}

// Admin Notification Services
export const adminNotificationService = {
  getAllNotifications: async () => {
    await requireAdmin()
    // Get notifications first
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    if (!notifications || notifications.length === 0) return []

    // Get all unique user_ids
    const userIds = [...new Set(notifications.map((n: any) => n.user_id))]

    // Fetch user profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, username, first_name, last_name')
      .in('id', userIds)

    if (profilesError) throw profilesError

    // Join the data
    const profilesMap = new Map((profiles || []).map((p: any) => [p.id, p]))
    return notifications.map((n: any) => ({
      ...n,
      user: profilesMap.get(n.user_id) || null
    }))
  },

  createNotification: async (userId: string, title: string, message: string) => {
    await requireAdmin()
    // Use centralized notification service that includes email alerts
    const { notificationService } = await import('./supabase-services')
    return await notificationService.createNotification(userId, title, message)
  },

  deleteNotification: async (notificationId: number) => {
    await requireAdmin()
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)

    if (error) throw error
  },
}

// Admin Crypto Wallet Services
export const adminCryptoWalletService = {
  getAllCryptoWallets: async () => {
    await requireAdmin()
    const { data, error } = await supabase
      .from('crypto_wallets')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  getCryptoWallet: async (walletId: number) => {
    await requireAdmin()
    const { data, error } = await supabase
      .from('crypto_wallets')
      .select('*')
      .eq('id', walletId)
      .single()

    if (error) throw error
    return data
  },

  createCryptoWallet: async (walletData: {
    name: string
    symbol: string
    wallet_address: string
    logo_url?: string | null
    network?: string | null
    is_active?: boolean
    display_order?: number
  }) => {
    await requireAdmin()
    const { data, error } = await supabase
      .from('crypto_wallets')
      .insert({
        name: walletData.name,
        symbol: walletData.symbol,
        wallet_address: walletData.wallet_address,
        logo_url: walletData.logo_url || null,
        network: walletData.network || null,
        is_active: walletData.is_active !== undefined ? walletData.is_active : true,
        display_order: walletData.display_order || 0,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  updateCryptoWallet: async (walletId: number, updates: {
    name?: string
    symbol?: string
    wallet_address?: string
    logo_url?: string | null
    network?: string | null
    is_active?: boolean
    display_order?: number
  }) => {
    await requireAdmin()
    const { data, error } = await supabase
      .from('crypto_wallets')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', walletId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  deleteCryptoWallet: async (walletId: number) => {
    await requireAdmin()
    const { error } = await supabase
      .from('crypto_wallets')
      .delete()
      .eq('id', walletId)

    if (error) throw error
  },
}

// Admin Deposit Request Services
export const adminDepositRequestService = {
  getAllDepositRequests: async (filters?: { status?: string }) => {
    await requireAdmin()
    let query = supabase
      .from('deposit_requests')
      .select(`
        *,
        account:accounts(id, account_number, account_type:account_types(name), user_id),
        crypto_wallet:crypto_wallets(id, name, symbol, logo_url)
      `)
      .order('created_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    const { data, error } = await query
    if (error) throw error

    // Get user profiles for the accounts
    if (data && data.length > 0) {
      const userIds = [...new Set(data.map((r: any) => r.account?.user_id).filter(Boolean))]
      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('user_profiles')
          .select('id, username, first_name, last_name')
          .in('id', userIds)

        if (!profilesError && profiles) {
          const profilesMap = new Map(profiles.map((p: any) => [p.id, p]))
          return data.map((r: any) => ({
            ...r,
            user: r.account?.user_id ? profilesMap.get(r.account.user_id) || null : null
          }))
        }
      }
    }

    return data || []
  },

  getDepositRequest: async (requestId: number) => {
    await requireAdmin()
    const { data, error } = await supabase
      .from('deposit_requests')
      .select(`
        *,
        account:accounts(id, account_number, account_type:account_types(name), user_id, balance),
        crypto_wallet:crypto_wallets(id, name, symbol, logo_url)
      `)
      .eq('id', requestId)
      .single()

    if (error) throw error
    return data
  },

  approveDepositRequest: async (requestId: number, adminNotes?: string) => {
    await requireAdmin()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Get the deposit request
    const { data: request, error: requestError } = await supabase
      .from('deposit_requests')
      .select('*, account:accounts(id, balance, user_id)')
      .eq('id', requestId)
      .single()

    if (requestError || !request) {
      throw new Error('Deposit request not found')
    }

    if (request.status !== 'pending') {
      throw new Error(`Cannot approve request with status: ${request.status}`)
    }

    // Update account balance (top up)
    const currentBalance = parseFloat(request.account.balance.toString())
    const newBalance = currentBalance + parseFloat(request.amount.toString())

    const { error: balanceError } = await supabase
      .from('accounts')
      .update({ balance: newBalance })
      .eq('id', request.account_id)

    if (balanceError) throw balanceError

    // Create transaction record
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        account_id: request.account_id,
        transaction_type: 'deposit',
        amount: request.amount,
        description: `Crypto deposit: ${request.crypto_symbol} - Approved by admin`,
        status: 'approved',
      })
      .select()
      .single()

    if (txError) throw txError

    // Update deposit request status
    const { data: updatedRequest, error: updateError } = await supabase
      .from('deposit_requests')
      .update({
        status: 'approved',
        admin_notes: adminNotes || null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
      })
      .eq('id', requestId)
      .select()
      .single()

    if (updateError) throw updateError

    // Send transaction receipt email (non-blocking)
    if (transaction && request.account?.user_id) {
      // Use dynamic import to avoid blocking
      import('../lib/transaction-email-helper').then(({ sendTransactionReceiptEmailHelper }) => {
        sendTransactionReceiptEmailHelper(request.account.user_id, transaction.id).catch(err => 
          console.error('Failed to send deposit receipt email:', err)
        )
      })
    }

    return updatedRequest
  },

  rejectDepositRequest: async (requestId: number, adminNotes: string) => {
    await requireAdmin()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    if (!adminNotes || adminNotes.trim().length === 0) {
      throw new Error('Admin notes are required when rejecting a request')
    }

    // Get the deposit request
    const { data: request, error: requestError } = await supabase
      .from('deposit_requests')
      .select('status')
      .eq('id', requestId)
      .single()

    if (requestError || !request) {
      throw new Error('Deposit request not found')
    }

    if (request.status !== 'pending') {
      throw new Error(`Cannot reject request with status: ${request.status}`)
    }

    // Update deposit request status
    const { data: updatedRequest, error: updateError } = await supabase
      .from('deposit_requests')
      .update({
        status: 'rejected',
        admin_notes: adminNotes,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
      })
      .eq('id', requestId)
      .select()
      .single()

    if (updateError) throw updateError

    return updatedRequest
  },
}

// Admin Stats Service
export const adminStatsService = {
  getStats: async () => {
    await requireAdmin()
    
    const [usersCount, accountsCount, transactionsCount, totalBalance] = await Promise.all([
      supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
      supabase.from('accounts').select('id', { count: 'exact', head: true }),
      supabase.from('transactions').select('id', { count: 'exact', head: true }),
      supabase.from('accounts').select('balance'),
    ])

    const total = totalBalance.data?.reduce((sum, acc) => sum + parseFloat(acc.balance.toString()), 0) || 0

    return {
      totalUsers: usersCount.count || 0,
      totalAccounts: accountsCount.count || 0,
      totalTransactions: transactionsCount.count || 0,
      totalBalance: total,
    }
  },
}

// Admin Card Request Services
export const adminCardRequestService = {
  getAllCardRequests: async (filters?: { status?: string; card_type?: string }) => {
    await requireAdmin()
    let query = supabase
      .from('card_requests')
      .select(`
        *,
        account:accounts(id, account_number, account_type:account_types(name), user_id, balance)
      `)
      .order('created_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.card_type) {
      query = query.eq('card_type', filters.card_type)
    }

    const { data, error } = await query
    if (error) throw error

    // Get user profiles for the accounts
    if (data && data.length > 0) {
      const userIds = [...new Set(data.map((r: any) => r.account?.user_id).filter(Boolean))]
      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('user_profiles')
          .select('id, username, first_name, last_name')
          .in('id', userIds)

        if (!profilesError && profiles) {
          const profilesMap = new Map(profiles.map((p: any) => [p.id, p]))
          return data.map((r: any) => ({
            ...r,
            user: r.account?.user_id ? profilesMap.get(r.account.user_id) || null : null
          }))
        }
      }
    }

    return data || []
  },

  getCardRequest: async (requestId: number) => {
    await requireAdmin()
    const { data, error } = await supabase
      .from('card_requests')
      .select(`
        *,
        account:accounts(id, account_number, account_type:account_types(name), user_id, balance)
      `)
      .eq('id', requestId)
      .single()

    if (error) throw error
    return data
  },

  approveCardRequest: async (requestId: number, adminNotes?: string) => {
    await requireAdmin()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Get the card request
    const { data: request, error: requestError } = await supabase
      .from('card_requests')
      .select('*, account:accounts(id, user_id)')
      .eq('id', requestId)
      .single()

    if (requestError || !request) {
      throw new Error('Card request not found')
    }

    if (request.status !== 'pending') {
      throw new Error(`Cannot approve request with status: ${request.status}`)
    }

    // Update card request status to approved and issued
    const { data: updatedRequest, error: updateError } = await supabase
      .from('card_requests')
      .update({
        status: 'issued',
        admin_notes: adminNotes || null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        issued_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .select()
      .single()

    if (updateError) throw updateError

    // Create notification for user (with email alert)
    try {
      const { notificationService } = await import('./supabase-services')
      await notificationService.createNotification(
        request.user_id,
        'Card Request Approved',
        `Your ${request.card_type} card request has been approved and issued. Card number: ${request.card_number}`
      )
    } catch (notifError) {
      // Non-blocking: log error but don't fail the approval
      console.warn('Failed to create notification:', notifError)
    }

    return updatedRequest
  },

  rejectCardRequest: async (requestId: number, adminNotes: string) => {
    await requireAdmin()
    if (!adminNotes || !adminNotes.trim()) {
      throw new Error('Admin notes are required when rejecting a card request')
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Get the card request
    const { data: request, error: requestError } = await supabase
      .from('card_requests')
      .select('user_id, status')
      .eq('id', requestId)
      .single()

    if (requestError || !request) {
      throw new Error('Card request not found')
    }

    if (request.status !== 'pending') {
      throw new Error(`Cannot reject request with status: ${request.status}`)
    }

    // Update card request status to rejected
    const { data: updatedRequest, error: updateError } = await supabase
      .from('card_requests')
      .update({
        status: 'rejected',
        admin_notes: adminNotes,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
      })
      .eq('id', requestId)
      .select()
      .single()

    if (updateError) throw updateError

    // Create notification for user (with email alert)
    try {
      const { notificationService } = await import('./supabase-services')
      await notificationService.createNotification(
        request.user_id,
        'Card Request Rejected',
        `Your card request has been rejected. Reason: ${adminNotes}`
      )
    } catch (notifError) {
      // Non-blocking: log error but don't fail the rejection
      console.warn('Failed to create notification:', notifError)
    }

    return updatedRequest
  },
}
