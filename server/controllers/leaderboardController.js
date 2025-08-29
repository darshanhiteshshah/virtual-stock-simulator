const User = require("../models/User");
const Decimal = require("decimal.js");
// 🔽 BEFORE (using mock data)
// const { getMockStockData } = require("../utils/mockStockService");
// ✅ AFTER (using the new, efficient market data service)
const { fetchMultipleLivePrices } = require("../utils/marketDataService");

/**
 * @desc    Get the top users by net worth
 * @route   GET /api/leaderboard
 * @access  Public
 */
exports.getLeaderboard = async (req, res) => {
    try {
        // Fetch all users from the database
        const users = await User.find({}).select("username portfolio walletBalance");

        // ✅ Step 1: Efficiently collect all unique stock symbols from every user's portfolio
        const allSymbols = [...new Set(
            users.flatMap(user => user.portfolio.map(stock => stock.symbol))
        )];

        // ✅ Step 2: Fetch all required stock prices in a single, parallel API call
        const livePrices = await fetchMultipleLivePrices(allSymbols);
        
        // Create a fast lookup map for prices (Symbol -> Price)
        const priceMap = new Map(livePrices.map(stock => [stock.symbol, stock.price]));

        // Calculate the net worth for each user using the pre-fetched prices
        const leaderboardData = users.map(user => {
            const portfolioValue = user.portfolio.reduce((acc, stock) => {
                // ✅ Step 3: Get the price instantly from the map instead of making a new API call
                const currentPrice = priceMap.get(stock.symbol) || 0; // Default to 0 if price not found
                
                if (currentPrice > 0) {
                    const price = new Decimal(currentPrice);
                    const quantity = new Decimal(stock.quantity);
                    return acc.plus(price.times(quantity));
                }
                return acc;
            }, new Decimal(0));

            const netWorth = new Decimal(user.walletBalance).plus(portfolioValue);

            return {
                username: user.username,
                netWorth: netWorth.toNumber(),
            };
        });

        // Sort the users by net worth in descending order
        leaderboardData.sort((a, b) => b.netWorth - a.netWorth);

        res.json(leaderboardData);
    } catch (error) {
        console.error("Error fetching leaderboard:", error.message);
        res.status(500).json({ message: "Server error while fetching leaderboard." });
    }
};