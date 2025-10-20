const nodemailer = require('nodemailer');

/**
 * Creates email transporter
 * Priority: SendGrid (for production) → Gmail (for local dev)
 */
const createEmailTransporter = async () => {
    // Option 1: SendGrid (works on Render free tier)
    if (process.env.SENDGRID_API_KEY) {
        console.log('📧 Using SendGrid email service');
        return nodemailer.createTransport({
            host: 'smtp.sendgrid.net',
            port: 587,
            secure: false, // Use TLS
            auth: {
                user: 'apikey', // This is literally the string "apikey"
                pass: process.env.SENDGRID_API_KEY
            }
        });
    }
    
    // Option 2: Gmail (for local development only)
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
        console.log('📧 Using Gmail email service');
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });
    }

    // No credentials configured
    console.error("❌ Email credentials are not set in environment variables.");
    console.error("   Please set either:");
    console.error("   - SENDGRID_API_KEY and SENDGRID_FROM_EMAIL (recommended for production)");
    console.error("   - GMAIL_USER and GMAIL_APP_PASSWORD (for local development)");
    return null;
};

/**
 * Sends a transaction confirmation email to the user
 * @param {string} userEmail - The recipient's email address
 * @param {string} username - The user's name
 * @param {object} transactionDetails - Transaction details (type, symbol, quantity, price, date)
 */
const sendTransactionEmail = async (userEmail, username, transactionDetails) => {
    try {
        const transporter = await createEmailTransporter();

        // If transporter couldn't be created, skip email
        if (!transporter) {
            console.log('⚠️ Email transporter not configured, skipping email');
            return;
        }

        const { type, symbol, quantity, price, date } = transactionDetails;
        const totalValue = (quantity * price).toFixed(2);
        const transactionType = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();

        // HTML email template
        const htmlBody = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
                <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #0D9488 0%, #0ea5e9 100%); padding: 30px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Trade Confirmation</h1>
                        <p style="margin: 10px 0 0 0; color: #f0f9ff; font-size: 14px;">Virtual Stock Simulator</p>
                    </div>
                    
                    <!-- Content -->
                    <div style="padding: 30px;">
                        <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px;">Hi <strong>${username}</strong>,</p>
                        <p style="margin: 0 0 25px 0; color: #666666; font-size: 14px; line-height: 1.6;">
                            This email confirms that your recent trade has been successfully executed. Here are the details:
                        </p>
                        
                        <!-- Transaction Details Table -->
                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                            <tr style="background-color: #f8f9fa;">
                                <td style="padding: 12px 15px; border: 1px solid #e0e0e0; font-weight: bold; color: #555555; font-size: 14px;">Transaction Type</td>
                                <td style="padding: 12px 15px; border: 1px solid #e0e0e0; color: #333333; font-size: 14px;">
                                    <span style="display: inline-block; padding: 4px 12px; border-radius: 4px; font-weight: bold; ${type === 'BUY' ? 'background-color: #dbeafe; color: #1e40af;' : 'background-color: #d1fae5; color: #065f46;'}">
                                        ${transactionType}
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 12px 15px; border: 1px solid #e0e0e0; font-weight: bold; color: #555555; font-size: 14px;">Stock Symbol</td>
                                <td style="padding: 12px 15px; border: 1px solid #e0e0e0; color: #333333; font-size: 14px; font-weight: 600;">${symbol}</td>
                            </tr>
                            <tr style="background-color: #f8f9fa;">
                                <td style="padding: 12px 15px; border: 1px solid #e0e0e0; font-weight: bold; color: #555555; font-size: 14px;">Quantity</td>
                                <td style="padding: 12px 15px; border: 1px solid #e0e0e0; color: #333333; font-size: 14px;">${quantity} shares</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px 15px; border: 1px solid #e0e0e0; font-weight: bold; color: #555555; font-size: 14px;">Price per Share</td>
                                <td style="padding: 12px 15px; border: 1px solid #e0e0e0; color: #333333; font-size: 14px;">₹${price.toFixed(2)}</td>
                            </tr>
                            <tr style="background-color: #f8f9fa;">
                                <td style="padding: 12px 15px; border: 1px solid #e0e0e0; font-weight: bold; color: #555555; font-size: 14px;">Total Value</td>
                                <td style="padding: 12px 15px; border: 1px solid #e0e0e0; color: #0D9488; font-size: 16px; font-weight: bold;">₹${totalValue}</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px 15px; border: 1px solid #e0e0e0; font-weight: bold; color: #555555; font-size: 14px;">Date & Time</td>
                                <td style="padding: 12px 15px; border: 1px solid #e0e0e0; color: #333333; font-size: 14px;">${new Date(date).toLocaleString('en-IN', { 
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}</td>
                            </tr>
                        </table>
                        
                        <p style="margin: 20px 0 0 0; color: #666666; font-size: 13px; line-height: 1.6;">
                            You can view your complete portfolio and transaction history by logging into your account.
                        </p>
                    </div>
                    
                    <!-- Footer -->
                    <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
                        <p style="margin: 0 0 10px 0; color: #888888; font-size: 12px;">
                            Thank you for trading with Virtual Stock Simulator!
                        </p>
                        <p style="margin: 0; color: #aaaaaa; font-size: 11px;">
                            This is an automated message. Please do not reply to this email.
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `;

        // Text version (fallback)
        const textBody = `
Trade Confirmation - Virtual Stock Simulator

Hi ${username},

Your ${transactionType} order has been successfully executed:

Transaction Type: ${transactionType}
Stock Symbol: ${symbol}
Quantity: ${quantity} shares
Price per Share: ₹${price.toFixed(2)}
Total Value: ₹${totalValue}
Date: ${new Date(date).toLocaleString('en-IN')}

Thank you for trading with Virtual Stock Simulator!
        `.trim();

        // Determine "from" email address
        const fromEmail = process.env.SENDGRID_FROM_EMAIL || process.env.GMAIL_USER || 'noreply@vsm.com';

        // ✅ ADD THESE DEBUG LOGS
        console.log('📤 Attempting to send email...');
        console.log('   To:', userEmail);
        console.log('   From:', fromEmail);
        console.log('   Subject:', `Trade Confirmation: ${transactionType} ${quantity} shares of ${symbol}`);

        // Send email with try-catch
        try {
            const info = await transporter.sendMail({
                from: `"Virtual Stock Simulator" <${fromEmail}>`,
                to: userEmail,
                subject: `Trade Confirmation: ${transactionType} ${quantity} shares of ${symbol}`,
                text: textBody,
                html: htmlBody,
            });

            console.log(`📬 Transaction email successfully sent to ${userEmail}`);
            console.log(`   Message ID: ${info.messageId}`);
        } catch (sendError) {
            console.error('❌ SendMail error:', sendError.message);
            console.error('❌ Error code:', sendError.code);
            console.error('❌ Full error:', JSON.stringify(sendError, null, 2));
            throw sendError; // Re-throw so outer catch can handle it
        }

    } catch (error) {
        console.error("❌ Could not send transaction email:", error.message);
        console.error("❌ Error details:", error);
        
        if (error.code === 'ETIMEDOUT') {
            console.error("   → Connection timeout. SMTP might be blocked on this server.");
            console.error("   → Consider using SendGrid instead of direct SMTP.");
        } else if (error.code === 'EAUTH') {
            console.error("   → Authentication failed. Check your API key or credentials.");
        } else if (error.responseCode === 550) {
            console.error("   → Email rejected. Sender email may not be verified.");
        }
    }
};

module.exports = { sendTransactionEmail };
