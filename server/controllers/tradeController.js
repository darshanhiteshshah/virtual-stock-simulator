const { getMockStockData } = require('../services/StockService');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

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
            user:userId,
            symbol,
            quantity,
            price: currentPrice,
            type: 'BUY',
            totalAmount: totalCost
        });

        console.log(`✅ Transaction completed: ${transaction._id}`);

        res.status(200).json({
            message: `Successfully bought ${quantity} shares of ${symbol}`,
            transaction: {
                id: transaction._id,
                symbol,
                quantity,
                price: currentPrice,
                totalCost: totalCost.toFixed(2),
                type: 'buy'
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
           user:userId,
            symbol,
            quantity,
            price: currentPrice,
            type: 'SELL',
            totalAmount: totalRevenue
        });

        console.log(`✅ Sell transaction completed: ${transaction._id}`);

        res.status(200).json({
            message: `Successfully sold ${quantity} shares of ${symbol}`,
            transaction: {
                id: transaction._id,
                symbol,
                quantity,
                price: currentPrice,
                totalRevenue: totalRevenue.toFixed(2),
                type: 'sell'
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
 * @desc    Place a limit/stop order
 * @route   POST /api/trade/place-order
 * @access  Private
 */
const placeOrder = async (req, res) => {
    try {
        // Placeholder for limit/stop order functionality
        res.status(200).json({ message: 'Place order functionality coming soon' });
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ message: 'Server error placing order' });
    }
};

/**
 * @desc    Get pending orders
 * @route   GET /api/trade/pending-orders
 * @access  Private
 */
const getPendingOrders = async (req, res) => {
    try {
        // Placeholder for pending orders functionality
        res.status(200).json([]);
    } catch (error) {
        console.error('Error fetching pending orders:', error);
        res.status(500).json({ message: 'Server error fetching orders' });
    }
};

/**
 * @desc    Cancel a pending order
 * @route   DELETE /api/trade/cancel-order/:orderId
 * @access  Private
 */
const cancelOrder = async (req, res) => {
    try {
        // Placeholder for cancel order functionality
        res.status(200).json({ message: 'Order cancelled' });
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({ message: 'Server error cancelling order' });
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
        const query = { userId };

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

        res.status(200).json(transactions);

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
    cancelOrder,
    getTradeHistory,
    validateBuyOrder,
    validateSellOrder
};
