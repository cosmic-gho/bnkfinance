import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendTransactionReceiptEmail } from '@/lib/email-service';

// Create Supabase admin client with service role key
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
    const { user_id, transaction_id } = body;

    if (!user_id || !transaction_id) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, transaction_id' },
        { status: 400 }
      );
    }

    // Get user email from auth.users
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(user_id);

    if (authError || !authUser?.user?.email) {
      console.error('Error fetching user email:', authError);
      return NextResponse.json(
        { error: 'User not found or email not available' },
        { status: 404 }
      );
    }

    // Get transaction details with related data
    const { data: transaction, error: txError } = await supabaseAdmin
      .from('transactions')
      .select(`
        *,
        account:accounts!transactions_account_id_fkey(
          id,
          account_number,
          balance,
          account_type:account_types(name)
        ),
        recipient_account:accounts!transactions_recipient_account_id_fkey(
          id,
          account_number,
          user_id
        )
      `)
      .eq('id', transaction_id)
      .single();

    if (txError || !transaction) {
      console.error('Error fetching transaction:', txError);
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Get recipient user name if it's a transfer
    let recipientName: string | undefined;
    if (transaction.recipient_account?.user_id) {
      const { data: recipientProfile } = await supabaseAdmin
        .from('user_profiles')
        .select('first_name, last_name')
        .eq('id', transaction.recipient_account.user_id)
        .single();

      if (recipientProfile) {
        recipientName = `${recipientProfile.first_name} ${recipientProfile.last_name}`.trim();
      }
    }

    // Prepare transaction data for email
    const transactionData = {
      type: transaction.transaction_type,
      amount: parseFloat(transaction.amount.toString()),
      description: transaction.description || undefined,
      accountNumber: transaction.account.account_number,
      accountType: transaction.account.account_type?.name || 'Account',
      balance: parseFloat(transaction.account.balance.toString()),
      recipientAccountNumber: transaction.recipient_account?.account_number,
      recipientName: recipientName,
      transactionHash: transaction.description?.includes('Transaction Hash:') 
        ? transaction.description.split('Transaction Hash:')[1]?.trim() 
        : undefined,
      timestamp: transaction.timestamp || transaction.created_at || new Date().toISOString(),
    };

    // Send email
    console.log('Sending transaction receipt email to:', authUser.user.email);
    console.log('Transaction data:', transactionData);
    
    await sendTransactionReceiptEmail(authUser.user.email, transactionData);

    console.log('✅ Transaction receipt email sent successfully');

    return NextResponse.json(
      { success: true, message: 'Transaction receipt sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error in send-transaction-receipt API:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      {
        error: 'Failed to send transaction receipt',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

