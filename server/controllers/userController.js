const User = require("../models/User");
const Decimal = require("decimal.js");
const { getMockStockData } = require("../services/stockService");
const { generateToken } = require("./authController");
const PortfolioSnapshot = require("../models/PortfolioSnapshot");

// @desc    Get user profile data
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Calculate portfolio value with async support
        let portfolioValue = new Decimal(0);
        
        for (const stock of user.portfolio) {
            try {
                // getMockStockData might be async, so await it
                const stockData = await getMockStockData(stock.symbol);
                if (stockData && stockData.price) {
                    const price = new Decimal(stockData.price);
                    const quantity = new Decimal(stock.quantity);
                    portfolioValue = portfolioValue.plus(price.times(quantity));
                }
            } catch (error) {
                console.error(`Error fetching price for ${stock.symbol}:`, error.message);
                // Continue with next stock if one fails
            }
        }

        const netWorth = new Decimal(user.walletBalance).plus(portfolioValue);

        res.json({
            id: user._id,
            username: user.username,
            email: user.email,
            walletBalance: user.walletBalance,
            portfolioValue: portfolioValue.toNumber(),
            netWorth: netWorth.toNumber(),
            createdAt: user.createdAt,
        });
    } catch (error) {
        console.error("Error fetching user profile:", error.message);
        res.status(500).json({ 
            message: "Server error",
            error: error.message 
        });
    }
};

// @desc    Update user password
exports.updateUserPassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ message: "Incorrect current password" });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Error updating password:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Log out user from all other devices
// @route   POST /api/user/profile/logout-others
exports.logoutOtherSessions = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Increment token version
        user.tokenVersion += 1;
        await user.save();

        // Generate new token
        const newToken = generateToken(user);

        res.json({
            message: "Successfully logged out of all other sessions.",
            token: newToken,
        });
    } catch (error) {
        console.error("Error logging out other sessions:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Get portfolio history
exports.getPortfolioHistory = async (req, res) => {
    try {
        const history = await PortfolioSnapshot.find({ user: req.user.id })
            .sort({ date: 'asc' })
            .limit(100);
        
        res.json({
            success: true,
            history
        });
    } catch (error) {
        console.error("Error fetching portfolio history:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};
