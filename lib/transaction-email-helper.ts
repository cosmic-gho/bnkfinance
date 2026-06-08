/**
 * Helper function to send transaction receipt emails
 * This is called asynchronously and doesn't block the transaction
 */

export async function sendTransactionReceiptEmailHelper(
  userId: string,
  transactionId: number
): Promise<void> {
  try {
    console.log('📧 Sending transaction receipt email:', { userId, transactionId });
    
    const response = await fetch('/api/send-transaction-receipt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        transaction_id: transactionId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Failed to send transaction receipt email:', error);
      console.error('Response status:', response.status);
      console.error('Response body:', error);
    } else {
      const result = await response.json();
      console.log('✅ Transaction receipt email sent:', result);
    }
  } catch (error) {
    console.error('❌ Error sending transaction receipt email:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack);
    }
    // Don't throw - email failure shouldn't block transactions
  }
}

