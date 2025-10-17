// server/utils/orderExecutor.js
const User = require("../models/User");
const PendingOrder = require("../models/PendingOrder");
const Decimal = require("decimal.js");
const { getMockStockData } = require("../services/StockService"); // Fixed path
const { checkAndAwardAchievements } = require('./achievementService');
const { addTradeToFeed } = require('./tradeFeedService');
const { sendTransactionEmail } = require("./emailService");

/**
 * Execute a BUY order
 */
const executeBuyOrder = async (order, user, stockData) => {
    try {
        const pricePerStock = new Decimal(stockData.price);
        const tradeQuantity = new Decimal(order.quantity);
        const brokerageFee = new Decimal(20); // ₹20 brokerage fee
        const totalCost = pricePerStock.times(tradeQuantity).plus(brokerageFee);
        const userWallet = new Decimal(user.walletBalance);

        // Check if user has sufficient funds
        if (userWallet.lessThan(totalCost)) {
            console.log(`❌ Insufficient funds for order #${order._id}: Required ₹${totalCost}, Available ₹${userWallet}`);
            order.status = "FAILED";
            order.failureReason = "Insufficient funds";
            await order.save();
            return;
        }

        // Deduct from wallet
        user.walletBalance = userWallet.minus(totalCost).toNumber();

        // Update or add to portfolio
        const existingStock = user.portfolio.find(s => s.symbol === order.symbol);
        if (existingStock) {
            const existingQuantity = new Decimal(existingStock.quantity);
            const existingAvgPrice = new Decimal(existingStock.avgBuyPrice);
            const existingInvestment = existingAvgPrice.times(existingQuantity);
            const newInvestment = pricePerStock.times(tradeQuantity);
            const totalShares = existingQuantity.plus(tradeQuantity);
            const newAvgBuyPrice = existingInvestment.plus(newInvestment).dividedBy(totalShares);
            
            existingStock.avgBuyPrice = newAvgBuyPrice.toNumber();
            existingStock.quantity = totalShares.toNumber();
        } else {
            user.portfolio.push({
                symbol: order.symbol,
                quantity: tradeQuantity.toNumber(),
                avgBuyPrice: pricePerStock.toNumber(),
            });
        }

        // Record transaction
        const transaction = {
            type: "BUY",
            symbol: order.symbol,
            quantity: order.quantity,
            price: pricePerStock.toNumber(),
            date: new Date()
        };
        user.transactions.push(transaction);

        await user.save();

        // Update order status
        order.status = "EXECUTED";
        order.executedPrice = pricePerStock.toNumber();
        order.executedAt = new Date();
        await order.save();

        // Post-execution tasks
        await addTradeToFeed(transaction);
        await checkAndAwardAchievements(user._id);
        await sendTransactionEmail(user.email, user.username, transaction);

        console.log(`✅ Executed BUY order #${order._id}: ${order.quantity} ${order.symbol} @ ₹${pricePerStock} for ${user.username}`);
    } catch (error) {
        console.error(`❌ Error executing BUY order #${order._id}:`, error.message);
        order.status = "FAILED";
        order.failureReason = error.message;
        await order.save();
    }
};

/**
 * Execute a SELL order
 */
const executeSellOrder = async (order, user, stockData) => {
    try {
        const pricePerStock = new Decimal(stockData.price);
        const tradeQuantity = new Decimal(order.quantity);
        const brokerageFee = new Decimal(20); // ₹20 brokerage fee
        
        // Find stock in portfolio
        const stockIndex = user.portfolio.findIndex(s => s.symbol === order.symbol);
        
        if (stockIndex === -1) {
            console.log(`❌ Stock ${order.symbol} not found in portfolio for order #${order._id}`);
            order.status = "FAILED";
            order.failureReason = "Stock not in portfolio";
            await order.save();
            return;
        }

        const availableQuantity = new Decimal(user.portfolio[stockIndex].quantity);
        
        if (availableQuantity.lessThan(tradeQuantity)) {
            console.log(`❌ Insufficient shares for order #${order._id}: Need ${tradeQuantity}, Have ${availableQuantity}`);
            order.status = "FAILED";
            order.failureReason = "Insufficient shares";
            await order.save();
            return;
        }

        // Update portfolio
        user.portfolio[stockIndex].quantity = availableQuantity.minus(tradeQuantity).toNumber();
        
        // Calculate earnings
        const earnings = pricePerStock.times(tradeQuantity).minus(brokerageFee);
        user.walletBalance = new Decimal(user.walletBalance).plus(earnings).toNumber();

        // Remove stock from portfolio if quantity is 0
        if (user.portfolio[stockIndex].quantity === 0) {
            user.portfolio.splice(stockIndex, 1);
        }

        // Record transaction
        const transaction = {
            type: "SELL",
            symbol: order.symbol,
            quantity: order.quantity,
            price: pricePerStock.toNumber(),
            date: new Date()
        };
        user.transactions.push(transaction);

        await user.save();

        // Update order status
        order.status = "EXECUTED";
        order.executedPrice = pricePerStock.toNumber();
        order.executedAt = new Date();
        await order.save();

        // Post-execution tasks
        await addTradeToFeed(transaction);
        await checkAndAwardAchievements(user._id);
        await sendTransactionEmail(user.email, user.username, transaction);

        console.log(`✅ Executed SELL order #${order._id}: ${order.quantity} ${order.symbol} @ ₹${pricePerStock} for ${user.username}`);
    } catch (error) {
        console.error(`❌ Error executing SELL order #${order._id}:`, error.message);
        order.status = "FAILED";
        order.failureReason = error.message;
        await order.save();
    }
};

/**
 * Check and execute pending orders
 */
const checkPendingOrders = async () => {
    try {
        const pendingOrders = await PendingOrder.find({ status: "PENDING" }).populate('user');

        if (pendingOrders.length === 0) {
            return; // No pending orders
        }

        console.log(`🔍 Checking ${pendingOrders.length} pending orders...`);

        for (const order of pendingOrders) {
            try {
                // Validate order
                if (!order.user) {
                    console.warn(`⚠️ Order #${order._id} has no user, marking as failed`);
                    order.status = "FAILED";
                    order.failureReason = "User not found";
                    await order.save();
                    continue;
                }

                // Fetch current stock price from Yahoo Finance (async)
                const stockData = await getMockStockData(order.symbol);
                
                if (!stockData) {
                    console.warn(`⚠️ No data for ${order.symbol}, skipping order #${order._id}`);
                    continue;
                }

                const currentPrice = parseFloat(stockData.price);
                
                if (isNaN(currentPrice) || currentPrice <= 0) {
                    console.warn(`⚠️ Invalid price for ${order.symbol}: ${currentPrice}`);
                    continue;
                }

                let conditionMet = false;

                // Check order conditions
                if (order.tradeType === 'BUY') {
                    if (order.orderType === 'LIMIT' && currentPrice <= order.targetPrice) {
                        conditionMet = true;
                        console.log(`📉 BUY LIMIT triggered: ${order.symbol} @ ₹${currentPrice} <= ₹${order.targetPrice}`);
                    }
                    if (order.orderType === 'STOP_LOSS' && currentPrice >= order.targetPrice) {
                        conditionMet = true;
                        console.log(`📈 BUY STOP-LOSS triggered: ${order.symbol} @ ₹${currentPrice} >= ₹${order.targetPrice}`);
                    }
                } else if (order.tradeType === 'SELL') {
                    if (order.orderType === 'LIMIT' && currentPrice >= order.targetPrice) {
                        conditionMet = true;
                        console.log(`📈 SELL LIMIT triggered: ${order.symbol} @ ₹${currentPrice} >= ₹${order.targetPrice}`);
                    }
                    if (order.orderType === 'STOP_LOSS' && currentPrice <= order.targetPrice) {
                        conditionMet = true;
                        console.log(`📉 SELL STOP-LOSS triggered: ${order.symbol} @ ₹${currentPrice} <= ₹${order.targetPrice}`);
                    }
                }

                // Execute if condition met
                if (conditionMet) {
                    if (order.tradeType === 'BUY') {
                        await executeBuyOrder(order, order.user, stockData);
                    } else {
                        await executeSellOrder(order, order.user, stockData);
                    }
                }
            } catch (orderError) {
                console.error(`❌ Error processing order #${order._id}:`, orderError.message);
                continue;
            }
        }
    } catch (error) {
        console.error("❌ Error in checkPendingOrders:", error.message);
    }
};

/**
 * Start the order executor service
 * @param {number} interval - Check interval in milliseconds (default: 30000 = 30 seconds)
 */
const startOrderExecutor = (interval = 30000) => {
    console.log(`📈 Order Execution Engine started. Checking every ${interval / 1000} seconds.`);
    
    // Run immediately on startup
    checkPendingOrders();
    
    // Then run on interval
    setInterval(checkPendingOrders, interval);
};

module.exports = { 
    startOrderExecutor, 
    checkPendingOrders,
    executeBuyOrder,
    executeSellOrder 
};
