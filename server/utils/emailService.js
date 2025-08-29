const nodemailer = require('nodemailer');

/**
 * Creates a transporter configured to send emails via a Gmail account.
 * It uses credentials stored securely in environment variables.
 * @returns {Promise<object>} A Nodemailer transporter object.
 */
const createGmailTransporter = async () => {
    // Check if the required environment variables are set
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.error("❌ Gmail credentials are not set in the .env file.");
        console.error("   - Please set GMAIL_USER and GMAIL_APP_PASSWORD.");
        // Return a dummy transporter to prevent crashes, but it won't send emails.
        return null;
    }

    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD, // Use the 16-digit App Password here
        },
    });
};

/**
 * Sends a transaction confirmation email to the user.
 * @param {string} userEmail - The recipient's email address.
 * @param {string} username - The user's name.
 * @param {object} transactionDetails - An object with details about the trade.
 */
const sendTransactionEmail = async (userEmail, username, transactionDetails) => {
    try {
        const transporter = await createGmailTransporter();

        // If the transporter couldn't be created (due to missing credentials), stop here.
        if (!transporter) {
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

        await transporter.sendMail({
            from: `"Virtual Stock Sim" <${process.env.GMAIL_USER}>`,
            to: userEmail,
            subject: `Trade Confirmation: ${transactionType} ${quantity} shares of ${symbol}`,
            html: htmlBody,
        });

        console.log(`📬 Transaction email successfully sent to ${userEmail}`);

    } catch (error) {
        console.error("❌ Could not send transaction email via Gmail:", error);
    }
};

module.exports = { sendTransactionEmail };
