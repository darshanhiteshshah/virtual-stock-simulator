const User = require("../models/User");
const PendingOrder = require("../models/PendingOrder");
const Decimal = require("decimal.js");
const { getMockStockData } = require("./mockStockService");
const { checkAndAwardAchievements } = require('./achievementService');
const { addTradeToFeed } = require('./tradeFeedService');
const { sendTransactionEmail } = require("./emailService");

const executeBuyOrder = async (order, user, stockData) => {
    const pricePerStock = new Decimal(stockData.price);
    const tradeQuantity = new Decimal(order.quantity);
    const totalCost = pricePerStock.times(tradeQuantity);
    const userWallet = new Decimal(user.walletBalance);

    if (userWallet.lessThan(totalCost)) {
        order.status = "FAILED"; // Mark as failed due to insufficient funds
        await order.save();
        return;
    }

    user.walletBalance = userWallet.minus(totalCost).toNumber();

    const existingStock = user.portfolio.find(s => s.symbol === order.symbol);
    if (existingStock) {
        const existingQuantity = new Decimal(existingStock.quantity);
        const existingAvgPrice = new Decimal(existingStock.avgBuyPrice);
        const totalShares = existingQuantity.plus(tradeQuantity);
        const newAvgBuyPrice = ((existingAvgPrice.times(existingQuantity)).plus(totalCost)).dividedBy(totalShares);
        existingStock.avgBuyPrice = newAvgBuyPrice.toNumber();
        existingStock.quantity = totalShares.toNumber();
    } else {
        user.portfolio.push({
            symbol: order.symbol,
            quantity: tradeQuantity.toNumber(),
            avgBuyPrice: pricePerStock.toNumber(),
        });
    }

    const transaction = { type: "BUY", symbol: order.symbol, quantity: order.quantity, price: pricePerStock.toNumber(), date: new Date() };
    user.transactions.push(transaction);

    await user.save();
    order.status = "EXECUTED";
    order.executedPrice = pricePerStock.toNumber();
    await order.save();

    addTradeToFeed(transaction);
    await checkAndAwardAchievements(user._id);
    await sendTransactionEmail(user.email, user.username, transaction);
    console.log(`✅ Executed BUY order #${order._id} for ${user.username}`);
};

const executeSellOrder = async (order, user, stockData) => {
    const pricePerStock = new Decimal(stockData.price);
    const tradeQuantity = new Decimal(order.quantity);
    
    const stockIndex = user.portfolio.findIndex((s) => s.symbol === order.symbol);
    if (stockIndex === -1 || new Decimal(user.portfolio[stockIndex].quantity).lessThan(tradeQuantity)) {
        order.status = "FAILED"; // Not enough shares to sell
        await order.save();
        return;
    }

    user.portfolio[stockIndex].quantity = new Decimal(user.portfolio[stockIndex].quantity).minus(tradeQuantity).toNumber();
    
    const earnings = pricePerStock.times(tradeQuantity);
    user.walletBalance = new Decimal(user.walletBalance).plus(earnings).toNumber();

    if (user.portfolio[stockIndex].quantity === 0) {
        user.portfolio.splice(stockIndex, 1);
    }

    const transaction = { type: "SELL", symbol: order.symbol, quantity: order.quantity, price: pricePerStock.toNumber(), date: new Date() };
    user.transactions.push(transaction);

    await user.save();
    order.status = "EXECUTED";
    order.executedPrice = pricePerStock.toNumber();
    await order.save();

    addTradeToFeed(transaction);
    await checkAndAwardAchievements(user._id);
    await sendTransactionEmail(user.email, user.username, transaction);
    console.log(`✅ Executed SELL order #${order._id} for ${user.username}`);
};

const checkPendingOrders = async () => {
    try {
        const pendingOrders = await PendingOrder.find({ status: "PENDING" }).populate('user');

        for (const order of pendingOrders) {
            const stockData = getMockStockData(order.symbol);
            if (!stockData || !order.user) continue;

            const currentPrice = parseFloat(stockData.price);
            let conditionMet = false;

            if (order.tradeType === 'BUY') {
                if (order.orderType === 'LIMIT' && currentPrice <= order.targetPrice) conditionMet = true;
                if (order.orderType === 'STOP_LOSS' && currentPrice >= order.targetPrice) conditionMet = true;
            } else { // SELL
                if (order.orderType === 'LIMIT' && currentPrice >= order.targetPrice) conditionMet = true;
                if (order.orderType === 'STOP_LOSS' && currentPrice <= order.targetPrice) conditionMet = true;
            }

            if (conditionMet) {
                if(order.tradeType === 'BUY') await executeBuyOrder(order, order.user, stockData);
                else await executeSellOrder(order, order.user, stockData);
            }
        }
    } catch (error) {
        console.error("Error in order execution engine:", error);
    }
};

const startOrderExecutor = (interval = 5000) => { // Check every 5 seconds
    console.log('📈 Order Execution Engine has started.');
    setInterval(checkPendingOrders, interval);
};

module.exports = { startOrderExecutor };