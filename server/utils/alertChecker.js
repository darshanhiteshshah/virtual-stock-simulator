const User = require("../models/User");
const { getMockStockData } = require("./mockStockService");
const { sendTransactionEmail } = require("./emailService"); // We can reuse this!

const checkPriceAlerts = async () => {
    try {
        const usersWithAlerts = await User.find({ "priceAlerts.0": { "$exists": true } });

        for (const user of usersWithAlerts) {
            const triggeredAlerts = [];

            for (const alert of user.priceAlerts) {
                const stockData = getMockStockData(alert.symbol);
                if (!stockData) continue;

                const currentPrice = parseFloat(stockData.price);
                let triggered = false;

                if (alert.condition === 'above' && currentPrice >= alert.targetPrice) {
                    triggered = true;
                } else if (alert.condition === 'below' && currentPrice <= alert.targetPrice) {
                    triggered = true;
                }

                if (triggered) {
                    console.log(`🔔 Alert triggered for ${user.username}: ${alert.symbol} reached ${currentPrice}`);
                    // We can adapt the transaction email function to send alerts
                    const alertDetails = {
                        type: `Price Alert Triggered`,
                        symbol: alert.symbol,
                        quantity: `Target: ${alert.condition} ₹${alert.targetPrice}`,
                        price: currentPrice,
                        date: new Date()
                    };
                    sendTransactionEmail(user.email, user.username, alertDetails);
                    triggeredAlerts.push(alert._id);
                }
            }

            if (triggeredAlerts.length > 0) {
                // Remove triggered alerts to prevent sending multiple emails
                user.priceAlerts = user.priceAlerts.filter(alert => !triggeredAlerts.includes(alert._id));
                await user.save();
            }
        }
    } catch (error) {
        console.error("Error checking price alerts:", error);
    }
};

const startAlertChecker = (interval = 10000) => { // Check every 10 seconds
    console.log('⏰ Price Alert Checker has started.');
    setInterval(checkPriceAlerts, interval);
};

module.exports = { startAlertChecker };
