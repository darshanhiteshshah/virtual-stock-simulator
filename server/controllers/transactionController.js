const Transaction = require("../models/Transaction");
const User = require("../models/User");

/**
 * @desc    Get all transactions for the logged-in user
 * @route   GET /api/transactions
 * @access  Private
 */
const getTransactions = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;

        console.log(`📜 Fetching transactions for user: ${userId}`);

        // Query Transaction collection (not user.transactions)
        const transactions = await Transaction.find({ user: userId })
            .sort({ createdAt: -1 }) // Most recent first
            .limit(100) // Limit to last 100 transactions
            .lean(); // Convert to plain JavaScript objects

        console.log(`✅ Found ${transactions.length} transactions`);

        res.status(200).json({
            success: true,
            count: transactions.length,
            transactions
        });

    } catch (error) {
        console.error('❌ Error fetching transactions:', error);
        res.status(500).json({ 
            success: false,
            message: "Failed to fetch transactions",
            error: error.message 
        });
    }
};

/**
 * @desc    Get transaction by ID
 * @route   GET /api/transactions/:id
 * @access  Private
 */
const getTransactionById = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const transactionId = req.params.id;

        console.log(`🔍 Fetching transaction ${transactionId} for user ${userId}`);

        const transaction = await Transaction.findOne({
            _id: transactionId,
            user: userId // Ensure user can only access their own transactions
        });

        if (!transaction) {
            return res.status(404).json({ 
                success: false,
                message: "Transaction not found" 
            });
        }

        res.status(200).json({
            success: true,
            transaction
        });

    } catch (error) {
        console.error('❌ Error fetching transaction:', error);
        res.status(500).json({ 
            success: false,
            message: "Failed to fetch transaction",
            error: error.message 
        });
    }
};

/**
 * @desc    Get transactions filtered by symbol
 * @route   GET /api/transactions/symbol/:symbol
 * @access  Private
 */
const getTransactionsBySymbol = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const symbol = req.params.symbol.toUpperCase();

        console.log(`📊 Fetching ${symbol} transactions for user ${userId}`);

        const transactions = await Transaction.find({ 
            user: userId,
            symbol: symbol 
        })
            .sort({ createdAt: -1 })
            .lean();

        console.log(`✅ Found ${transactions.length} ${symbol} transactions`);

        res.status(200).json({
            success: true,
            symbol,
            count: transactions.length,
            transactions
        });

    } catch (error) {
        console.error('❌ Error fetching transactions by symbol:', error);
        res.status(500).json({ 
            success: false,
            message: "Failed to fetch transactions",
            error: error.message 
        });
    }
};

/**
 * @desc    Get transactions filtered by type (BUY/SELL)
 * @route   GET /api/transactions/type/:type
 * @access  Private
 */
const getTransactionsByType = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const type = req.params.type.toUpperCase();

        if (!['BUY', 'SELL'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: "Type must be either BUY or SELL"
            });
        }

        console.log(`💰 Fetching ${type} transactions for user ${userId}`);

        const transactions = await Transaction.find({ 
            user: userId,
            type: type 
        })
            .sort({ createdAt: -1 })
            .lean();

        console.log(`✅ Found ${transactions.length} ${type} transactions`);

        res.status(200).json({
            success: true,
            type,
            count: transactions.length,
            transactions
        });

    } catch (error) {
        console.error('❌ Error fetching transactions by type:', error);
        res.status(500).json({ 
            success: false,
            message: "Failed to fetch transactions",
            error: error.message 
        });
    }
};

/**
 * @desc    Get transaction statistics for user
 * @route   GET /api/transactions/stats
 * @access  Private
 */
const getTransactionStats = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;

        console.log(`📊 Calculating transaction stats for user ${userId}`);

        const transactions = await Transaction.find({ user: userId });

        const stats = {
            totalTransactions: transactions.length,
            totalBuys: transactions.filter(t => t.type === 'BUY').length,
            totalSells: transactions.filter(t => t.type === 'SELL').length,
            totalInvested: transactions
                .filter(t => t.type === 'BUY')
                .reduce((sum, t) => sum + (t.price * t.quantity), 0),
            totalReturns: transactions
                .filter(t => t.type === 'SELL')
                .reduce((sum, t) => sum + (t.price * t.quantity), 0),
            uniqueStocks: [...new Set(transactions.map(t => t.symbol))].length,
            mostTradedStock: getMostTradedStock(transactions),
            recentTransactions: transactions
                .sort((a, b) => b.createdAt - a.createdAt)
                .slice(0, 5)
        };

        res.status(200).json({
            success: true,
            stats
        });

    } catch (error) {
        console.error('❌ Error calculating stats:', error);
        res.status(500).json({ 
            success: false,
            message: "Failed to calculate statistics",
            error: error.message 
        });
    }
};

// Helper function
function getMostTradedStock(transactions) {
    if (transactions.length === 0) return null;
    
    const stockCounts = {};
    transactions.forEach(t => {
        stockCounts[t.symbol] = (stockCounts[t.symbol] || 0) + 1;
    });
    
    let mostTraded = null;
    let maxCount = 0;
    
    for (const [symbol, count] of Object.entries(stockCounts)) {
        if (count > maxCount) {
            maxCount = count;
            mostTraded = symbol;
        }
    }
    
    return mostTraded ? { symbol: mostTraded, count: maxCount } : null;
}

// Export all functions at the end
module.exports = {
    getTransactions,
    getTransactionById,
    getTransactionsBySymbol,
    getTransactionsByType,
    getTransactionStats
};
