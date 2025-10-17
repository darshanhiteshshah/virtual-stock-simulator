const User = require("../models/User");

/**
 * @desc    Get user's portfolio with raw holdings
 * @route   GET /api/portfolio
 * @access  Private
 * @note    Client-side calculates live prices for real-time updates
 */
const getPortfolio = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;

        console.log(`📊 Fetching portfolio for user ${userId}`);

        const user = await User.findById(userId).select("portfolio walletBalance username");
        
        if (!user) {
            console.error(`❌ User not found: ${userId}`);
            return res.status(404).json({ 
                success: false,
                message: "User not found" 
            });
        }

        // Calculate basic stats (client will add live prices)
        const totalStocks = user.portfolio.length;
        const totalShares = user.portfolio.reduce((sum, stock) => sum + stock.quantity, 0);
        const totalInvested = user.portfolio.reduce(
            (sum, stock) => sum + (stock.avgBuyPrice * stock.quantity), 
            0
        );

        console.log(`✅ Portfolio fetched: ${totalStocks} stocks, ${totalShares} shares`);

        res.status(200).json({
            success: true,
            walletBalance: user.walletBalance,
            stocks: user.portfolio, // Raw holdings with symbol, quantity, avgBuyPrice
            stats: {
                totalStocks,
                totalShares,
                totalInvested: totalInvested.toFixed(2)
            },
            username: user.username
        });

    } catch (error) {
        console.error("❌ Error fetching portfolio:", error.message);
        res.status(500).json({ 
            success: false,
            message: "Server error: Failed to fetch portfolio.",
            error: error.message
        });
    }
};

/**
 * @desc    Get portfolio summary with statistics
 * @route   GET /api/portfolio/summary
 * @access  Private
 */
const getPortfolioSummary = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;

        const user = await User.findById(userId).select("portfolio walletBalance");
        
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: "User not found" 
            });
        }

        const totalStocks = user.portfolio.length;
        const totalShares = user.portfolio.reduce((sum, stock) => sum + stock.quantity, 0);
        const totalInvested = user.portfolio.reduce(
            (sum, stock) => sum + (stock.avgBuyPrice * stock.quantity), 
            0
        );

        // Top holdings by investment value
        const topHoldings = [...user.portfolio]
            .map(stock => ({
                symbol: stock.symbol,
                quantity: stock.quantity,
                avgBuyPrice: stock.avgBuyPrice,
                invested: stock.avgBuyPrice * stock.quantity
            }))
            .sort((a, b) => b.invested - a.invested)
            .slice(0, 5);

        res.status(200).json({
            success: true,
            walletBalance: user.walletBalance,
            totalStocks,
            totalShares,
            totalInvested: totalInvested.toFixed(2),
            topHoldings
        });

    } catch (error) {
        console.error("❌ Error fetching portfolio summary:", error.message);
        res.status(500).json({ 
            success: false,
            message: "Failed to fetch portfolio summary",
            error: error.message
        });
    }
};

/**
 * @desc    Get specific stock holding details
 * @route   GET /api/portfolio/:symbol
 * @access  Private
 */
const getStockHolding = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const { symbol } = req.params;

        const user = await User.findById(userId).select("portfolio");
        
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: "User not found" 
            });
        }

        const holding = user.portfolio.find(s => s.symbol === symbol.toUpperCase());

        if (!holding) {
            return res.status(404).json({ 
                success: false,
                message: `You don't own any shares of ${symbol.toUpperCase()}` 
            });
        }

        res.status(200).json({
            success: true,
            holding: {
                symbol: holding.symbol,
                quantity: holding.quantity,
                avgBuyPrice: holding.avgBuyPrice,
                totalInvested: (holding.avgBuyPrice * holding.quantity).toFixed(2)
            }
        });

    } catch (error) {
        console.error("❌ Error fetching stock holding:", error.message);
        res.status(500).json({ 
            success: false,
            message: "Failed to fetch stock holding",
            error: error.message
        });
    }
};

/**
 * @desc    Clear/reset portfolio (for testing/demo)
 * @route   DELETE /api/portfolio/reset
 * @access  Private
 */
const resetPortfolio = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;

        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: "User not found" 
            });
        }

        // Return invested amount to wallet
        const totalInvested = user.portfolio.reduce(
            (sum, stock) => sum + (stock.avgBuyPrice * stock.quantity), 
            0
        );

        user.portfolio = [];
        user.walletBalance += totalInvested;
        await user.save();

        console.log(`🔄 Portfolio reset for user ${userId}. Returned ₹${totalInvested} to wallet`);

        res.status(200).json({
            success: true,
            message: "Portfolio reset successfully",
            walletBalance: user.walletBalance,
            amountReturned: totalInvested.toFixed(2)
        });

    } catch (error) {
        console.error("❌ Error resetting portfolio:", error.message);
        res.status(500).json({ 
            success: false,
            message: "Failed to reset portfolio",
            error: error.message
        });
    }
};

module.exports = {
    getPortfolio,
    getPortfolioSummary,
    getStockHolding,
    resetPortfolio
};
