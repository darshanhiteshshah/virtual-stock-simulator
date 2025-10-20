const nodemailer = require('nodemailer');

const createEmailTransporter = async () => {
    // Check if SendGrid API key exists
    if (process.env.SENDGRID_API_KEY) {
        return nodemailer.createTransport({
            host: 'smtp.sendgrid.net',
            port: 587,
            secure: false,
            auth: {
                user: 'apikey',
                pass: process.env.SENDGRID_API_KEY
            }
        });
    }
    
    // Fallback to Gmail (for local development)
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });
    }

    console.error("❌ Email credentials are not set.");
    return null;
};

const sendTransactionEmail = async (userEmail, username, transactionDetails) => {
    try {
        const transporter = await createEmailTransporter();

        if (!transporter) {
            console.log('⚠️ Email transporter not configured, skipping email');
            return;
        }

        const { type, symbol, quantity, price, date } = transactionDetails;
        const totalValue = (quantity * price).toFixed(2);
        const transactionType = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();

        const htmlBody = `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px;">
                <h2 style="color: #0D9488; text-align: center;">Trade Confirmation</h2>
                <p>Hi ${username},</p>
                <p>This email confirms that your recent trade has been successfully executed. Here are the details:</p>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="background-color: #f2f2f2;">
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Transaction Type</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${transactionType}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Stock Symbol</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${symbol}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Quantity</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${quantity}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Price per Share</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd;">₹${price.toFixed(2)}</td>
                    </tr>
                    <tr style="background-color: #f2f2f2;">
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Total Value</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>₹${totalValue}</strong></td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Date</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${new Date(date).toLocaleString('en-IN')}</td>
                    </tr>
                </table>
                <p style="text-align: center; margin-top: 20px; font-size: 12px; color: #888;">Thank you for trading with Virtual Stock Simulator!</p>
            </div>
        `;

        const fromEmail = process.env.SENDGRID_FROM_EMAIL || process.env.GMAIL_USER || 'noreply@vsm.com';

        await transporter.sendMail({
            from: `"Virtual Stock Sim" <${fromEmail}>`,
            to: userEmail,
            subject: `Trade Confirmation: ${transactionType} ${quantity} shares of ${symbol}`,
            html: htmlBody,
        });

        console.log(`📬 Transaction email successfully sent to ${userEmail}`);

    } catch (error) {
        console.error("❌ Could not send transaction email:", error.message);
    }
};

module.exports = { sendTransactionEmail };
