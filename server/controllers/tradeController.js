const User = require("../models/User");
const Decimal = require("decimal.js");
const { getMockStockData } = require("../services/StockService");
// --- ADD THIS LINE ---
const { sendTransactionEmail } = require("../utils/emailService");
const { checkAndAwardAchievements } = require('../utils/achievementService'); // Import the new service
const { addTradeToFeed}=require("../utils/tradeFeedService")// Import the trade feed service
const PendingOrder = require("../models/PendingOrder");

const BROKERAGE_FEE = 20.00;


// ------------------------ BUY STOCK ------------------------
exports.buyStock = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const { symbol, quantity } = req.body;

        if (quantity <= 0) {
            return res.status(400).json({ message: "Quantity must be a positive number." });
        }

        const stockData = getMockStockData(symbol);
        if (!stockData) {
            return res.status(404).json({ message: `Stock symbol '${symbol}' not found.` });
        }
        
        const pricePerStock = new Decimal(stockData.price);
        const tradeQuantity = new Decimal(quantity);
        const totalCost = pricePerStock.times(tradeQuantity).plus(BROKERAGE_FEE);
        const userWallet = new Decimal(user.walletBalance);

        if (userWallet.lessThan(totalCost)) {
            return res.status(400).json({ message: "Insufficient funds." });
        }

        user.walletBalance = userWallet.minus(totalCost).toNumber();

        const existingStock = user.portfolio.find(stock => stock.symbol === symbol);
        if (existingStock) {
            const existingQuantity = new Decimal(existingStock.quantity);
            const existingAvgPrice = new Decimal(existingStock.avgBuyPrice);
            const totalShares = existingQuantity.plus(tradeQuantity);
            const newAvgBuyPrice = ((existingAvgPrice.times(existingQuantity)).plus(totalCost)).dividedBy(totalShares);
            existingStock.avgBuyPrice = newAvgBuyPrice.toNumber();
            existingStock.quantity = totalShares.toNumber();
        } else {
            user.portfolio.push({
                symbol,
                quantity: tradeQuantity.toNumber(),
                avgBuyPrice: pricePerStock.toNumber(),
            });
        }

        const transaction = {
            type: "BUY",
            symbol,
            quantity: tradeQuantity.toNumber(),
            price: pricePerStock.toNumber(),
            date: new Date(),
        };
        user.transactions.push(transaction);

        await user.save();
        await checkAndAwardAchievements(user._id); 
        addTradeToFeed(transaction);

        // --- ADD THIS LINE ---
        // Send a confirmation email after the trade is saved
        await sendTransactionEmail(user.email, user.username, transaction);

        res.json({
            message: `Successfully bought ${quantity} shares of ${symbol}`,
            updatedPortfolio: user.portfolio,
            updatedWallet: user.walletBalance,
        });
    } catch (error) {
        console.error("Error in buyStock:", error);
        res.status(500).json({ message: "Server error during buy operation." });
    }
};

// ------------------------ SELL STOCK ------------------------
exports.sellStock = async (req, res) => {
    try {
        const { symbol, quantity } = req.body;
        const user = await User.findById(req.user.id);

        if (quantity <= 0) {
            return res.status(400).json({ message: "Quantity must be a positive number." });
        }

        const stockData = getMockStockData(symbol);
        if (!stockData) {
            return res.status(404).json({ message: `Stock symbol '${symbol}' not found.` });
        }

        const pricePerStock = new Decimal(stockData.price);
        const tradeQuantity = new Decimal(quantity);

        const stockIndex = user.portfolio.findIndex((s) => s.symbol === symbol);
        if (stockIndex === -1) {
            return res.status(400).json({ message: "You do not own this stock." });
        }

        const stockToSell = user.portfolio[stockIndex];
        if (new Decimal(stockToSell.quantity).lessThan(tradeQuantity)) {
            return res.status(400).json({ message: "Not enough shares to sell." });
        }

        stockToSell.quantity = new Decimal(stockToSell.quantity).minus(tradeQuantity).toNumber();
        
        const earnings = pricePerStock.times(tradeQuantity).minus(BROKERAGE_FEE);
        user.walletBalance = new Decimal(user.walletBalance).plus(earnings).toNumber();

        if (stockToSell.quantity === 0) {
            user.portfolio.splice(stockIndex, 1);
        }

        const transaction = {
            type: "SELL",
            symbol,
            quantity: tradeQuantity.toNumber(),
            price: pricePerStock.toNumber(),
            date: new Date(),
        };
        user.transactions.push(transaction);

        await user.save();
        await checkAndAwardAchievements(user._id); 
        addTradeToFeed(transaction);

        // --- ADD THIS LINE ---
        // Send a confirmation email after the trade is saved
        await sendTransactionEmail(user.email, user.username, transaction);

        res.json({
            message: `Successfully sold ${quantity} shares of ${symbol}`,
            updatedPortfolio: user.portfolio,
            updatedWallet: user.walletBalance,
        });
    } catch (error) {
        console.error("Error in sellStock:", error);
        res.status(500).json({ message: "Server error during sell operation." });
    }
};


exports.placeOrder = async (req, res) => {
    const { symbol, quantity, targetPrice, orderType, tradeType } = req.body;

    if (quantity <= 0 || targetPrice <= 0) {
        return res.status(400).json({ message: "Quantity and price must be positive." });
    }

    try {
        const order = new PendingOrder({
            user: req.user.id,
            symbol: symbol.toUpperCase(),
            quantity,
            targetPrice,
            orderType,
            tradeType,
        });
        await order.save();
        res.status(201).json({ message: `${orderType} order placed successfully.` });
    } catch (error) {
        res.status(500).json({ message: "Server error placing order." });
    }
};

// @desc    Get user's pending orders
// @route   GET /api/trade/pending-orders
exports.getPendingOrders = async (req, res) => {
    try {
        const orders = await PendingOrder.find({ user: req.user.id, status: 'PENDING' }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "Server error fetching orders." });
    }
};

// @desc    Cancel a pending order
// @route   DELETE /api/trade/cancel-order/:orderId
exports.cancelOrder = async (req, res) => {
    try {
        const order = await PendingOrder.findOne({ _id: req.params.orderId, user: req.user.id });
        if (!order) {
            return res.status(404).json({ message: "Order not found." });
        }
        if (order.status !== 'PENDING') {
            return res.status(400).json({ message: "Only pending orders can be cancelled." });
        }
        order.status = "CANCELLED";
        await order.save();
        res.json({ message: "Order cancelled successfully." });
    } catch (error) {
        res.status(500).json({ message: "Server error cancelling order." });
    }
};
