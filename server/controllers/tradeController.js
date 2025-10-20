const { getMockStockData } = require('../services/stockService');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const PendingOrder = require('../models/PendingOrder');
const { sendTransactionEmail } = require('../utils/emailService');

/**
 * @desc    Buy stock at current market price
 * @route   POST /api/trade/buy
 * @access  Private
 */
const buyStock = async (req, res) => {
    try {
        const { symbol, quantity } = req.body;
        const userId = req.user._id;

        console.log(`🛒 Buy request: ${quantity} shares of ${symbol} by user ${userId}`);

        // Validation
        if (!symbol || !quantity || quantity <= 0) {
            return res.status(400).json({ 
                message: 'Invalid symbol or quantity' 
            });
        }

        // Get current stock price from Yahoo Finance
        let stockData;
        try {
            stockData = await getMockStockData(symbol);
            
            if (!stockData || !stockData.price) {
                console.error(`❌ No price data for ${symbol}:`, stockData);
                return res.status(400).json({ 
                    message: `Unable to fetch current price for ${symbol}. Stock may not be available.` 
                });
            }
            
            console.log(`📊 Current price for ${symbol}: ₹${stockData.price}`);
        } catch (error) {
            console.error(`❌ Error fetching stock data for ${symbol}:`, error.message);
            return res.status(400).json({ 
                message: `Unable to fetch stock data: ${error.message}` 
            });
        }

        const currentPrice = parseFloat(stockData.price);
        const totalCost = currentPrice * quantity;

        console.log(`💰 Total cost: ₹${totalCost.toFixed(2)}`);

        // Get user
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user has enough balance
        if (user.walletBalance < totalCost) {
            return res.status(400).json({ 
                message: `Insufficient funds. Required: ₹${totalCost.toFixed(2)}, Available: ₹${user.walletBalance.toFixed(2)}` 
            });
        }

        // Deduct from wallet
        user.walletBalance -= totalCost;

        // Update or add to portfolio
        const existingHolding = user.portfolio.find(p => p.symbol === symbol);
        
        if (existingHolding) {
            // Calculate new average price
            const totalShares = existingHolding.quantity + quantity;
            const totalValue = (existingHolding.avgBuyPrice * existingHolding.quantity) + totalCost;
            existingHolding.avgBuyPrice = totalValue / totalShares;
            existingHolding.quantity = totalShares;
            
            console.log(`📈 Updated holding: ${existingHolding.quantity} shares at avg ₹${existingHolding.avgBuyPrice.toFixed(2)}`);
        } else {
            user.portfolio.push({
                symbol,
                quantity,
                avgBuyPrice: currentPrice
            });
            
            console.log(`🆕 New holding: ${quantity} shares at ₹${currentPrice}`);
        }

        await user.save();

        // Create transaction record
        const transaction = await Transaction.create({
            user: userId,
            symbol,
            quantity,
            price: currentPrice,
            type: 'BUY',
            totalAmount: totalCost
        });

        console.log(`✅ Transaction completed: ${transaction._id}`);

        // 📧 Send email notification (non-blocking)
        sendTransactionEmail(user.email, user.username, {
    type: 'BUY',
    symbol,
    quantity,
    price: currentPrice,
    date: transaction.createdAt
}).catch(err => {
    console.error('📧 Email send failed:', err.message);
    console.error('📧 Full error:', err);
});


        res.status(200).json({
            message: `Successfully bought ${quantity} shares of ${symbol}`,
            transaction: {
                id: transaction._id,
                symbol,
                quantity,
                price: currentPrice,
                totalCost: totalCost.toFixed(2),
                type: 'BUY'
            },
            portfolio: user.portfolio,
            walletBalance: user.walletBalance
        });

    } catch (error) {
        console.error('❌ Error in buyStock controller:', error);
        res.status(500).json({ 
            message: 'Server error during buy operation.',
            error: error.message 
        });
    }
};

/**
 * @desc    Sell stock at current market price
 * @route   POST /api/trade/sell
 * @access  Private
 */
const sellStock = async (req, res) => {
    try {
        const { symbol, quantity } = req.body;
        const userId = req.user._id;

        console.log(`💰 Sell request: ${quantity} shares of ${symbol} by user ${userId}`);

        // Validation
        if (!symbol || !quantity || quantity <= 0) {
            return res.status(400).json({ 
                message: 'Invalid symbol or quantity' 
            });
        }

        // Get current stock price from Yahoo Finance
        let stockData;
        try {
            stockData = await getMockStockData(symbol);
            
            if (!stockData || !stockData.price) {
                console.error(`❌ No price data for ${symbol}:`, stockData);
                return res.status(400).json({ 
                    message: `Unable to fetch current price for ${symbol}` 
                });
            }
            
            console.log(`📊 Current price for ${symbol}: ₹${stockData.price}`);
        } catch (error) {
            console.error(`❌ Error fetching stock data for ${symbol}:`, error.message);
            return res.status(400).json({ 
                message: `Unable to fetch stock data: ${error.message}` 
            });
        }

        const currentPrice = parseFloat(stockData.price);
        const totalRevenue = currentPrice * quantity;

        // Get user
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user has the stock
        const holding = user.portfolio.find(p => p.symbol === symbol);
        
        if (!holding) {
            return res.status(400).json({ 
                message: `You don't own any shares of ${symbol}` 
            });
        }

        if (holding.quantity < quantity) {
            return res.status(400).json({ 
                message: `Insufficient shares. You own ${holding.quantity} shares but trying to sell ${quantity}` 
            });
        }

        // Calculate P&L
        const profitLoss = (currentPrice - holding.avgBuyPrice) * quantity;
        console.log(`📊 Avg buy price: ₹${holding.avgBuyPrice}, Current price: ₹${currentPrice}`);
        console.log(`📈 P&L: ₹${profitLoss.toFixed(2)}`);

        // Update portfolio
        if (holding.quantity === quantity) {
            // Remove from portfolio completely
            user.portfolio = user.portfolio.filter(p => p.symbol !== symbol);
            console.log(`🗑️ Removed ${symbol} from portfolio (sold all shares)`);
        } else {
            // Reduce quantity
            holding.quantity -= quantity;
            console.log(`📉 Reduced holding: ${holding.quantity} shares remaining`);
        }

        // Add to wallet
        user.walletBalance += totalRevenue;

        await user.save();

        // Create transaction record
        const transaction = await Transaction.create({
            user: userId,
            symbol,
            quantity,
            price: currentPrice,
            type: 'SELL',
            totalAmount: totalRevenue
        });

        console.log(`✅ Sell transaction completed: ${transaction._id}`);

        // 📧 Send email notification (non-blocking)
        sendTransactionEmail(user.email, user.username, {
    type: 'SELL',
    symbol,
    quantity,
    price: currentPrice,
    date: transaction.createdAt
}).catch(err => {
    console.error('📧 Email send failed:', err.message);
    console.error('📧 Full error:', err);
});


        res.status(200).json({
            message: `Successfully sold ${quantity} shares of ${symbol}`,
            transaction: {
                id: transaction._id,
                symbol,
                quantity,
                price: currentPrice,
                totalRevenue: totalRevenue.toFixed(2),
                profitLoss: profitLoss.toFixed(2),
                type: 'SELL'
            },
            portfolio: user.portfolio,
            walletBalance: user.walletBalance
        });

    } catch (error) {
        console.error('❌ Error in sellStock controller:', error);
        res.status(500).json({ 
            message: 'Server error during sell operation.',
            error: error.message 
        });
    }
};

/**
 * @desc    Place a limit/stop loss order
 * @route   POST /api/trade/place-order
 * @access  Private
 */
const placeOrder = async (req, res) => {
    try {
        const { symbol, quantity, orderType, tradeType, targetPrice, stopPrice, expiresAt } = req.body;
        const userId = req.user._id;

        console.log(`📝 Placing ${orderType} ${tradeType} order for ${symbol}`);

        // Validation
        if (!symbol || !quantity || !orderType || !tradeType) {
            return res.status(400).json({
                message: 'Missing required fields'
            });
        }

        if (!['LIMIT', 'STOP_LOSS'].includes(orderType)) {
            return res.status(400).json({
                message: 'Invalid order type. Must be LIMIT or STOP_LOSS'
            });
        }

        if (!['BUY', 'SELL'].includes(tradeType)) {
            return res.status(400).json({
                message: 'Invalid trade type. Must be BUY or SELL'
            });
        }

        // Validate prices based on order type
        if (orderType === 'LIMIT' && !targetPrice) {
            return res.status(400).json({
                message: 'Target price is required for limit orders'
            });
        }

        if (orderType === 'STOP_LOSS' && !stopPrice) {
            return res.status(400).json({
                message: 'Stop price is required for stop loss orders'
            });
        }

        // Get current price for validation
        let stockData;
        try {
            stockData = await getMockStockData(symbol);
            if (!stockData || !stockData.price) {
                return res.status(400).json({
                    message: `Unable to fetch current price for ${symbol}`
                });
            }
        } catch (error) {
            return res.status(400).json({
                message: `Stock ${symbol} not found`
            });
        }

        const currentPrice = parseFloat(stockData.price);
        console.log(`📊 Current price: ₹${currentPrice}`);

        // For SELL orders, verify user owns the stock
        if (tradeType === 'SELL') {
            const user = await User.findById(userId);
            const holding = user.portfolio.find(p => p.symbol === symbol);
            
            if (!holding || holding.quantity < quantity) {
                return res.status(400).json({
                    message: `Insufficient shares. You own ${holding?.quantity || 0} shares but trying to sell ${quantity}`
                });
            }
        }

        // For BUY orders, check funds
        if (tradeType === 'BUY') {
            const user = await User.findById(userId);
            const estimatedCost = (targetPrice || stopPrice || currentPrice) * quantity;
            
            if (user.walletBalance < estimatedCost) {
                return res.status(400).json({
                    message: `Insufficient funds. Required: ₹${estimatedCost.toFixed(2)}, Available: ₹${user.walletBalance.toFixed(2)}`
                });
            }
        }

        // Create order
        const order = await PendingOrder.create({
            user: userId,
            symbol,
            quantity,
            orderType,
            tradeType,
            targetPrice: targetPrice || null,
            stopPrice: stopPrice || null,
            expiresAt: expiresAt ? new Date(expiresAt) : undefined,
            status: 'PENDING'
        });

        console.log(`✅ Order placed: ${order._id}`);

        res.status(201).json({
            success: true,
            message: `${orderType} ${tradeType} order placed successfully`,
            order: {
                id: order._id,
                symbol,
                quantity,
                orderType,
                tradeType,
                targetPrice,
                stopPrice,
                currentPrice,
                status: 'PENDING',
                expiresAt: order.expiresAt,
                createdAt: order.createdAt
            }
        });

    } catch (error) {
        console.error('❌ Error placing order:', error);
        res.status(500).json({
            message: 'Server error placing order',
            error: error.message
        });
    }
};

/**
 * @desc    Get pending orders
 * @route   GET /api/trade/pending-orders
 * @access  Private
 */
const getPendingOrders = async (req, res) => {
    try {
        const userId = req.user._id;

        console.log(`📋 Fetching pending orders for user ${userId}`);

        const orders = await PendingOrder.find({
            user: userId,
            status: 'PENDING'
        })
            .sort({ createdAt: -1 })
            .lean();

        console.log(`✅ Found ${orders.length} PENDING orders`);

        res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });

    } catch (error) {
        console.error('❌ Error fetching pending orders:', error);
        res.status(500).json({
            message: 'Server error fetching orders',
            error: error.message
        });
    }
};

/**
 * @desc    Get all orders (pending, executed, cancelled)
 * @route   GET /api/trade/all-orders
 * @access  Private
 */
const getAllOrders = async (req, res) => {
    try {
        const userId = req.user._id;
        const { status } = req.query;

        console.log(`📋 Fetching all orders for user ${userId}`);

        const query = { user: userId };
        if (status) {
            query.status = status.toUpperCase();
        }

        const orders = await PendingOrder.find(query)
            .sort({ createdAt: -1 })
            .limit(100)
            .lean();

        console.log(`✅ Found ${orders.length} orders`);

        res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });

    } catch (error) {
        console.error('❌ Error fetching orders:', error);
        res.status(500).json({
            message: 'Server error fetching orders',
            error: error.message
        });
    }
};

/**
 * @desc    Cancel a pending order
 * @route   DELETE /api/trade/cancel-order/:orderId
 * @access  Private
 */
const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user._id;

        console.log(`🚫 Cancelling order ${orderId}`);

        const order = await PendingOrder.findOne({
            _id: orderId,
            user: userId
        });

        if (!order) {
            return res.status(404).json({
                message: 'Order not found'
            });
        }

        if (order.status !== 'PENDING') {
            return res.status(400).json({
                message: `Cannot cancel order with status ${order.status}`
            });
        }

        order.status = 'CANCELLED';
        await order.save();

        console.log(`✅ Order cancelled: ${orderId}`);

        res.status(200).json({
            success: true,
            message: 'Order cancelled successfully',
            order: {
                id: order._id,
                symbol: order.symbol,
                status: 'CANCELLED'
            }
        });

    } catch (error) {
        console.error('❌ Error cancelling order:', error);
        res.status(500).json({
            message: 'Server error cancelling order',
            error: error.message
        });
    }
};

/**
 * @desc    Get trade history
 * @route   GET /api/trade/history
 * @access  Private
 */
const getTradeHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        const { startDate, endDate, symbol } = req.query;

        console.log(`📜 Fetching trade history for user ${userId}`);

        // Build query
        const query = { user: userId };

        if (symbol) {
            query.symbol = symbol.toUpperCase();
        }

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        // Fetch transactions
        const transactions = await Transaction.find(query)
            .sort({ createdAt: -1 })
            .limit(100);

        console.log(`✅ Found ${transactions.length} transactions`);

        res.status(200).json({
            success: true,
            count: transactions.length,
            transactions
        });

    } catch (error) {
        console.error('❌ Error fetching trade history:', error);
        res.status(500).json({ 
            message: 'Server error fetching trade history',
            error: error.message 
        });
    }
};

/**
 * @desc    Validate buy order
 * @route   POST /api/trade/validate-buy
 * @access  Private
 */
const validateBuyOrder = async (req, res) => {
    try {
        const { symbol, quantity, price } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const totalCost = price * quantity;
        const canAfford = user.walletBalance >= totalCost;

        res.status(200).json({
            valid: canAfford,
            totalCost: totalCost.toFixed(2),
            walletBalance: user.walletBalance.toFixed(2),
            shortfall: canAfford ? 0 : (totalCost - user.walletBalance).toFixed(2),
            message: canAfford 
                ? 'You have sufficient funds' 
                : `Insufficient funds. Need ₹${(totalCost - user.walletBalance).toFixed(2)} more`
        });

    } catch (error) {
        console.error('❌ Error validating buy order:', error);
        res.status(500).json({ 
            message: 'Validation error',
            error: error.message 
        });
    }
};

/**
 * @desc    Validate sell order
 * @route   POST /api/trade/validate-sell
 * @access  Private
 */
const validateSellOrder = async (req, res) => {
    try {
        const { symbol, quantity } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const holding = user.portfolio.find(p => p.symbol === symbol);
        
        if (!holding) {
            return res.status(200).json({
                valid: false,
                ownedShares: 0,
                message: `You don't own any shares of ${symbol}`
            });
        }

        const canSell = holding.quantity >= quantity;

        res.status(200).json({
            valid: canSell,
            ownedShares: holding.quantity,
            requestedShares: quantity,
            shortfall: canSell ? 0 : quantity - holding.quantity,
            message: canSell 
                ? 'You have sufficient shares' 
                : `Insufficient shares. You own ${holding.quantity} but trying to sell ${quantity}`
        });

    } catch (error) {
        console.error('❌ Error validating sell order:', error);
        res.status(500).json({ 
            message: 'Validation error',
            error: error.message 
        });
    }
};

// Export all functions
module.exports = { 
    buyStock, 
    sellStock, 
    placeOrder, 
    getPendingOrders,
    getAllOrders,
    cancelOrder,
    getTradeHistory,
    validateBuyOrder,
    validateSellOrder
};
