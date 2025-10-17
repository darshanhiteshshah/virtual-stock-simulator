// server/services/orderExecutionService.js
const User = require("../models/User");
const PendingOrder = require("../models/PendingOrder");
const Transaction = require("../models/Transaction");
const Decimal = require("decimal.js");
const { getMockStockData } = require("./StockService"); // Corrected path

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

        await user.save();

        // Create transaction record
        await Transaction.create({
            user: user._id,
            symbol: order.symbol,
            quantity: order.quantity,
            price: pricePerStock.toNumber(),
            type: 'BUY',
            totalAmount: pricePerStock.times(tradeQuantity).toNumber()
        });

        // Update order status
        order.status = "EXECUTED";
        order.executedPrice = pricePerStock.toNumber();
        order.executedAt = new Date();
        await order.save();

        console.log(`✅ Executed BUY order #${order._id}: ${order.quantity} ${order.symbol} @ ₹${pricePerStock} for ${user.username}`);
        
        // Optional: Call additional services if they exist
        try {
            // Only call if services exist
            if (require.resolve('../utils/achievementService')) {
                const { checkAndAwardAchievements } = require('../utils/achievementService');
                await checkAndAwardAchievements(user._id);
            }
        } catch (e) {
            // Service doesn't exist, skip
        }

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
        const newQuantity = availableQuantity.minus(tradeQuantity);
        user.portfolio[stockIndex].quantity = newQuantity.toNumber();
        
        // Calculate earnings (subtract brokerage)
        const grossEarnings = pricePerStock.times(tradeQuantity);
        const netEarnings = grossEarnings.minus(brokerageFee);
        user.walletBalance = new Decimal(user.walletBalance).plus(netEarnings).toNumber();

        // Remove stock from portfolio if quantity is 0
        if (user.portfolio[stockIndex].quantity === 0) {
            user.portfolio.splice(stockIndex, 1);
        }

        await user.save();

        // Create transaction record
        await Transaction.create({
            user: user._id,
            symbol: order.symbol,
            quantity: order.quantity,
            price: pricePerStock.toNumber(),
            type: 'SELL',
            totalAmount: grossEarnings.toNumber()
        });

        // Update order status
        order.status = "EXECUTED";
        order.executedPrice = pricePerStock.toNumber();
        order.executedAt = new Date();
        await order.save();

        console.log(`✅ Executed SELL order #${order._id}: ${order.quantity} ${order.symbol} @ ₹${pricePerStock} for ${user.username}`);
        
        // Optional: Call additional services if they exist
        try {
            if (require.resolve('../utils/achievementService')) {
                const { checkAndAwardAchievements } = require('../utils/achievementService');
                await checkAndAwardAchievements(user._id);
            }
        } catch (e) {
            // Service doesn't exist, skip
        }

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
        const pendingOrders = await PendingOrder.find({ 
            status: "PENDING",
            // Optional: Add expiry check
            $or: [
                { expiresAt: { $exists: false } },
                { expiresAt: { $gte: new Date() } }
            ]
        }).populate('user');

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

                // Fetch current stock price from Yahoo Finance
                const stockData = await getMockStockData(order.symbol);
                
                if (!stockData || !stockData.price) {
                    console.warn(`⚠️ No data for ${order.symbol}, skipping order #${order._id}`);
                    continue;
                }

                const currentPrice = parseFloat(stockData.price);
                
                if (isNaN(currentPrice) || currentPrice <= 0) {
                    console.warn(`⚠️ Invalid price for ${order.symbol}: ${currentPrice}`);
                    continue;
                }

                let conditionMet = false;
                let triggerReason = '';

                // Check order conditions
                if (order.tradeType === 'BUY') {
                    if (order.orderType === 'LIMIT' && order.targetPrice && currentPrice <= order.targetPrice) {
                        conditionMet = true;
                        triggerReason = `BUY LIMIT triggered: ${order.symbol} @ ₹${currentPrice} <= ₹${order.targetPrice}`;
                    }
                    if (order.orderType === 'STOP_LOSS' && order.stopPrice && currentPrice >= order.stopPrice) {
                        conditionMet = true;
                        triggerReason = `BUY STOP-LOSS triggered: ${order.symbol} @ ₹${currentPrice} >= ₹${order.stopPrice}`;
                    }
                } else if (order.tradeType === 'SELL') {
                    if (order.orderType === 'LIMIT' && order.targetPrice && currentPrice >= order.targetPrice) {
                        conditionMet = true;
                        triggerReason = `SELL LIMIT triggered: ${order.symbol} @ ₹${currentPrice} >= ₹${order.targetPrice}`;
                    }
                    if (order.orderType === 'STOP_LOSS' && order.stopPrice && currentPrice <= order.stopPrice) {
                        conditionMet = true;
                        triggerReason = `SELL STOP-LOSS triggered: ${order.symbol} @ ₹${currentPrice} <= ₹${order.stopPrice}`;
                    }
                }

                // Execute if condition met
                if (conditionMet) {
                    console.log(`📈 ${triggerReason}`);
                    
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

        // Handle expired orders
        await PendingOrder.updateMany(
            {
                status: "PENDING",
                expiresAt: { $exists: true, $lt: new Date() }
            },
            {
                $set: { 
                    status: "EXPIRED",
                    failureReason: "Order expired"
                }
            }
        );

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
    
    // Run after 5 seconds to allow server to fully start
    setTimeout(() => {
        checkPendingOrders();
        // Then run on interval
        setInterval(checkPendingOrders, interval);
    }, 5000);
};

module.exports = { 
    startOrderExecutor, 
    checkPendingOrders,
    executeBuyOrder,
    executeSellOrder 
};
