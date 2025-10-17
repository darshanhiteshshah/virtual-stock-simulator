// server/utils/alertChecker.js
const User = require("../models/User");
const { getMockStockData } = require("../services/StockService"); // Fixed path
const { sendTransactionEmail } = require("./emailService");

/**
 * Check all active price alerts and trigger emails when conditions are met
 */
const checkPriceAlerts = async () => {
    try {
        // Find users with at least one price alert
        const usersWithAlerts = await User.find({ 
            "priceAlerts.0": { "$exists": true } 
        });

        if (usersWithAlerts.length === 0) {
            return; // No alerts to check
        }

        console.log(`🔍 Checking price alerts for ${usersWithAlerts.length} users...`);

        for (const user of usersWithAlerts) {
            const triggeredAlerts = [];

            for (const alert of user.priceAlerts) {
                try {
                    // Fetch current stock price from Yahoo Finance (async)
                    const stockData = await getMockStockData(alert.symbol);
                    
                    if (!stockData) {
                        console.warn(`⚠️ No data for ${alert.symbol}, skipping alert check`);
                        continue;
                    }

                    const currentPrice = parseFloat(stockData.price);
                    
                    if (isNaN(currentPrice) || currentPrice <= 0) {
                        console.warn(`⚠️ Invalid price for ${alert.symbol}: ${currentPrice}`);
                        continue;
                    }

                    let triggered = false;

                    // Check alert condition
                    if (alert.condition === 'above' && currentPrice >= alert.targetPrice) {
                        triggered = true;
                    } else if (alert.condition === 'below' && currentPrice <= alert.targetPrice) {
                        triggered = true;
                    }

                    if (triggered) {
                        console.log(`🔔 Alert triggered for ${user.username}: ${alert.symbol} ${alert.condition} ₹${alert.targetPrice} (Current: ₹${currentPrice})`);
                        
                        // Send alert email
                        const alertDetails = {
                            type: `Price Alert Triggered`,
                            symbol: alert.symbol,
                            quantity: `Target: ${alert.condition} ₹${alert.targetPrice.toLocaleString()}`,
                            price: currentPrice,
                            date: new Date()
                        };
                        
                        try {
                            await sendTransactionEmail(user.email, user.username, alertDetails);
                        } catch (emailError) {
                            console.error(`Failed to send alert email to ${user.email}:`, emailError.message);
                        }
                        
                        triggeredAlerts.push(alert._id);
                    }
                } catch (stockError) {
                    console.error(`Error fetching stock data for ${alert.symbol}:`, stockError.message);
                    continue;
                }
            }

            // Remove triggered alerts to prevent duplicate notifications
            if (triggeredAlerts.length > 0) {
                user.priceAlerts = user.priceAlerts.filter(
                    alert => !triggeredAlerts.some(id => id.equals(alert._id))
                );
                await user.save();
                console.log(`✅ Removed ${triggeredAlerts.length} triggered alerts for ${user.username}`);
            }
        }
    } catch (error) {
        console.error("❌ Error checking price alerts:", error.message);
    }
};

/**
 * Start the price alert checker service
 * @param {number} interval - Check interval in milliseconds (default: 60000 = 1 minute)
 */
const startAlertChecker = (interval = 60000) => {
    console.log(`⏰ Price Alert Checker started. Checking every ${interval / 1000} seconds.`);
    
    // Run immediately on startup
    checkPriceAlerts();
    
    // Then run on interval
    setInterval(checkPriceAlerts, interval);
};

module.exports = { startAlertChecker, checkPriceAlerts };
