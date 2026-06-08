import nodemailer from 'nodemailer';

// Email configuration from environment variables
const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.EMAIL_PORT || '465'),
  secure: process.env.EMAIL_USE_SSL === 'true' || true, // SSL for port 465
  auth: {
    user: process.env.EMAIL_HOST_USER || 'support@atlanticgates.live',
    pass: process.env.EMAIL_HOST_PASSWORD || '',
  },
};

// Log email configuration (without password)
console.log('Email Configuration:', {
  host: emailConfig.host,
  port: emailConfig.port,
  secure: emailConfig.secure,
  user: emailConfig.auth.user,
  passwordSet: !!emailConfig.auth.pass,
  fromEmail: process.env.DEFAULT_FROM_EMAIL || 'support@atlanticgates.live',
});

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: emailConfig.host,
  port: emailConfig.port,
  secure: emailConfig.secure,
  auth: emailConfig.auth,
  debug: true, // Enable debug logging
  logger: true, // Enable logging
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email using the configured SMTP server
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    const mailOptions = {
      from: process.env.DEFAULT_FROM_EMAIL || 'support@atlanticgates.live',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''), // Plain text fallback
    };

    console.log('Attempting to send email:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
    });

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!', {
      messageId: info.messageId,
      response: info.response,
      accepted: info.accepted,
      rejected: info.rejected,
    });
  } catch (error) {
    console.error('❌ Error sending email:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        code: (error as any).code,
        command: (error as any).command,
        response: (error as any).response,
        responseCode: (error as any).responseCode,
      });
    }
    throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Send a notification email to a user
 */
export async function sendNotificationEmail(
  userEmail: string,
  title: string,
  message: string
): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="color: #2563eb; margin-top: 0;">BNK Finance Bank</h1>
        </div>
        <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #1f2937; margin-top: 0;">${title}</h2>
          <div style="color: #4b5563; white-space: pre-wrap;">${message}</div>
        </div>
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; text-align: center;">
          <p>This is an automated notification from BNK Finance Bank.</p>
          <p>Please do not reply to this email.</p>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: userEmail,
    subject: `BNK Finance Bank - ${title}`,
    html,
  });
}

/**
 * Send transaction receipt email
 */
export async function sendTransactionReceiptEmail(
  userEmail: string,
  transactionData: {
    type: string;
    amount: number;
    description?: string;
    accountNumber: string;
    accountType: string;
    balance: number;
    recipientAccountNumber?: string;
    recipientName?: string;
    transactionHash?: string;
    timestamp: string;
  }
): Promise<void> {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getTransactionTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      deposit: 'Deposit',
      withdrawal: 'Withdrawal',
      transfer: 'Transfer',
      local_transfer: 'Local Transfer',
      wire_transfer: 'Wire Transfer',
      payment: 'Payment',
    };
    return labels[type] || type;
  };

  const isDebit = ['withdrawal', 'transfer', 'local_transfer', 'wire_transfer', 'payment'].includes(transactionData.type);
  const amountDisplay = isDebit ? `-${formatCurrency(transactionData.amount)}` : `+${formatCurrency(transactionData.amount)}`;
  const amountColor = isDebit ? '#dc2626' : '#16a34a';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Transaction Receipt</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="color: #2563eb; margin-top: 0;">BNK Finance Bank</h1>
        </div>
        <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #1f2937; margin-top: 0;">Transaction Receipt</h2>
          
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span style="font-weight: 600; color: #4b5563;">Transaction Type:</span>
              <span style="font-weight: 700; color: #1f2937;">${getTransactionTypeLabel(transactionData.type)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 600; color: #4b5563;">Amount:</span>
              <span style="font-weight: 700; font-size: 18px; color: ${amountColor};">${amountDisplay}</span>
            </div>
          </div>

          <div style="margin-bottom: 20px;">
            <h3 style="color: #374151; font-size: 16px; margin-bottom: 10px;">Account Details</h3>
            <div style="background-color: #f9fafb; padding: 12px; border-radius: 6px;">
              <div style="margin-bottom: 8px;">
                <span style="color: #6b7280; font-size: 14px;">Account Type:</span>
                <span style="font-weight: 600; margin-left: 8px;">${transactionData.accountType}</span>
              </div>
              <div style="margin-bottom: 8px;">
                <span style="color: #6b7280; font-size: 14px;">Account Number:</span>
                <span style="font-family: monospace; margin-left: 8px;">${transactionData.accountNumber}</span>
              </div>
              <div>
                <span style="color: #6b7280; font-size: 14px;">New Balance:</span>
                <span style="font-weight: 700; margin-left: 8px; color: #16a34a;">${formatCurrency(transactionData.balance)}</span>
              </div>
            </div>
          </div>

          ${transactionData.recipientAccountNumber ? `
          <div style="margin-bottom: 20px;">
            <h3 style="color: #374151; font-size: 16px; margin-bottom: 10px;">Recipient Details</h3>
            <div style="background-color: #f9fafb; padding: 12px; border-radius: 6px;">
              ${transactionData.recipientName ? `
              <div style="margin-bottom: 8px;">
                <span style="color: #6b7280; font-size: 14px;">Recipient:</span>
                <span style="font-weight: 600; margin-left: 8px;">${transactionData.recipientName}</span>
              </div>
              ` : ''}
              <div>
                <span style="color: #6b7280; font-size: 14px;">Account Number:</span>
                <span style="font-family: monospace; margin-left: 8px;">${transactionData.recipientAccountNumber}</span>
              </div>
            </div>
          </div>
          ` : ''}

          ${transactionData.transactionHash ? `
          <div style="margin-bottom: 20px;">
            <h3 style="color: #374151; font-size: 16px; margin-bottom: 10px;">Transaction Hash</h3>
            <div style="background-color: #f9fafb; padding: 12px; border-radius: 6px;">
              <code style="font-size: 12px; word-break: break-all; color: #1f2937;">${transactionData.transactionHash}</code>
            </div>
          </div>
          ` : ''}

          ${transactionData.description ? `
          <div style="margin-bottom: 20px;">
            <h3 style="color: #374151; font-size: 16px; margin-bottom: 10px;">Description</h3>
            <div style="background-color: #f9fafb; padding: 12px; border-radius: 6px; white-space: pre-wrap; color: #4b5563;">
              ${transactionData.description}
            </div>
          </div>
          ` : ''}

          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <div style="color: #6b7280; font-size: 14px;">
              <div style="margin-bottom: 4px;"><strong>Date & Time:</strong> ${new Date(transactionData.timestamp).toLocaleString()}</div>
              <div><strong>Transaction ID:</strong> ${transactionData.timestamp}</div>
            </div>
          </div>
        </div>
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; text-align: center;">
          <p>This is an automated receipt from BNK Finance Bank.</p>
          <p>Please keep this receipt for your records.</p>
          <p>If you did not authorize this transaction, please contact support immediately.</p>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: userEmail,
    subject: `Transaction Receipt - ${getTransactionTypeLabel(transactionData.type)} - ${formatCurrency(transactionData.amount)}`,
    html,
  });
}

/**
 * Verify email configuration
 */
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('Email server is ready to send messages');
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
}

