const sgMail = require('@sendgrid/mail');

/**
 * Sends a transaction confirmation email using SendGrid HTTP API
 */
const sendTransactionEmail = async (userEmail, username, transactionDetails) => {
    try {
        // Check if SendGrid API key is configured
        if (!process.env.SENDGRID_API_KEY) {
            console.log('⚠️ SendGrid API key not configured, skipping email');
            return;
        }

        // Initialize SendGrid
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);

        const { type, symbol, quantity, price, date } = transactionDetails;
        const totalValue = (quantity * price).toFixed(2);
        const transactionType = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();

        const htmlBody = `
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #0D9488 0%, #0ea5e9 100%); padding: 30px; text-align: center;">
                    <h1 style="color: white; margin: 0;">Trade Confirmation</h1>
                    <p style="color: #f0f9ff; margin: 10px 0 0 0;">Virtual Stock Simulator</p>
                </div>
                <div style="padding: 30px; background: white;">
                    <p>Hi <strong>${username}</strong>,</p>
                    <p>Your trade has been successfully executed:</p>
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                        <tr style="background: #f8f9fa;">
                            <td style="padding: 12px; border: 1px solid #ddd;"><strong>Type</strong></td>
                            <td style="padding: 12px; border: 1px solid #ddd;">${transactionType}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #ddd;"><strong>Stock</strong></td>
                            <td style="padding: 12px; border: 1px solid #ddd;">${symbol}</td>
                        </tr>
                        <tr style="background: #f8f9fa;">
                            <td style="padding: 12px; border: 1px solid #ddd;"><strong>Quantity</strong></td>
                            <td style="padding: 12px; border: 1px solid #ddd;">${quantity} shares</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #ddd;"><strong>Price</strong></td>
                            <td style="padding: 12px; border: 1px solid #ddd;">₹${price.toFixed(2)}</td>
                        </tr>
                        <tr style="background: #f8f9fa;">
                            <td style="padding: 12px; border: 1px solid #ddd;"><strong>Total</strong></td>
                            <td style="padding: 12px; border: 1px solid #ddd;"><strong>₹${totalValue}</strong></td>
                        </tr>
                    </table>
                    <p style="color: #666; font-size: 13px;">Thank you for trading with Virtual Stock Simulator!</p>
                </div>
            </body>
            </html>
        `;

        const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@vsm.com';

        console.log('📤 Sending email via SendGrid HTTP API...');
        console.log('   To:', userEmail);
        console.log('   From:', fromEmail);

        // Send via SendGrid HTTP API (port 443 - works on Render!)
        await sgMail.send({
            to: userEmail,
            from: fromEmail,
            subject: `Trade Confirmation: ${transactionType} ${quantity} shares of ${symbol}`,
            html: htmlBody,
        });

        console.log(`✅ Email sent successfully to ${userEmail}`);

    } catch (error) {
        console.error("❌ Email error:", error.message);
        if (error.response) {
            console.error('SendGrid response:', error.response.body);
        }
    }
};

module.exports = { sendTransactionEmail };
