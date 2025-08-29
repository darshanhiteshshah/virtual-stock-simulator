const User = require("../models/User");

// Define all possible achievements in the application
const ALL_ACHIEVEMENTS = [
    { code: 'FIRST_TRADE', name: 'First Blood', description: 'Make your first successful trade.' },
    { code: 'PROFIT_MAKER', name: 'Profit Maker', description: 'Make your first profitable trade.' },
    { code: 'DIVERSIFIED', name: 'Diversified Investor', description: 'Own stocks in 3 or more different sectors.' },
    { code: 'HIGH_ROLLER', name: 'High Roller', description: 'Make a single trade worth over ₹1,00,000.' },
    { code: 'WATCHER', name: 'The Watcher', description: 'Add 5 stocks to your watchlist.' },
    { code: 'MARKET_MOVER', name: 'Market Mover', description: 'Execute 10 total trades.' },
];

/**
 * Checks all achievement conditions for a user and awards new ones.
 * @param {string} userId - The ID of the user to check.
 * @returns {Promise<void>}
 */
const checkAndAwardAchievements = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) return;

        const newAchievements = [];

        // Check for "First Trade"
        if (user.transactions.length >= 1 && !user.achievements.includes('FIRST_TRADE')) {
            newAchievements.push('FIRST_TRADE');
        }
        
        // Check for "Profit Maker"
        const hasProfitableSale = user.transactions.some(t => {
            if (t.type === 'SELL') {
                const holding = user.portfolio.find(s => s.symbol === t.symbol);
                // This is a simplified check; a real one would be more complex
                return t.price > (holding?.avgBuyPrice || 0);
            }
            return false;
        });
        if (hasProfitableSale && !user.achievements.includes('PROFIT_MAKER')) {
            newAchievements.push('PROFIT_MAKER');
        }

        // Check for "Diversified Investor"
        const sectors = new Set(user.portfolio.map(stock => stock.sector));
        if (sectors.size >= 3 && !user.achievements.includes('DIVERSIFIED')) {
            newAchievements.push('DIVERSIFIED');
        }

        // Check for "High Roller"
        const isHighRoller = user.transactions.some(t => (t.quantity * t.price) > 100000);
        if (isHighRoller && !user.achievements.includes('HIGH_ROLLER')) {
            newAchievements.push('HIGH_ROLLER');
        }

        // Check for "The Watcher"
        if (user.watchlist.length >= 5 && !user.achievements.includes('WATCHER')) {
            newAchievements.push('WATCHER');
        }

        // Check for "Market Mover"
        if (user.transactions.length >= 10 && !user.achievements.includes('MARKET_MOVER')) {
            newAchievements.push('MARKET_MOVER');
        }

        // If new achievements were earned, add them to the user's profile
        if (newAchievements.length > 0) {
            user.achievements.push(...newAchievements);
            await user.save();
            console.log(`🏆 Awarded achievements to ${user.username}:`, newAchievements);
        }

    } catch (error) {
        console.error("Error checking achievements:", error);
    }
};

module.exports = { ALL_ACHIEVEMENTS, checkAndAwardAchievements };
