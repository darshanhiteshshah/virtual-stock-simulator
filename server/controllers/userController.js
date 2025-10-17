const User = require("../models/User");
const Decimal = require("decimal.js");
const { getMockStockData } = require("../services/StockService");
const { generateToken } = require("./authController"); // Import token generator
const PortfolioSnapshot = require("../models/PortfolioSnapshot");

// @desc    Get user profile data
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const portfolioValue = user.portfolio.reduce((acc, stock) => {
            const stockData = getMockStockData(stock.symbol);
            if (stockData) {
                const price = new Decimal(stockData.price);
                const quantity = new Decimal(stock.quantity);
                return acc.plus(price.times(quantity));
            }
            return acc;
        }, new Decimal(0));

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
        res.status(500).json({ message: "Server error" });
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

// --- NEW FUNCTION ---
// @desc    Log out user from all other devices by invalidating old tokens
// @route   POST /api/user/profile/logout-others
exports.logoutOtherSessions = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Increment the token version to invalidate all older tokens
        user.tokenVersion += 1;
        await user.save();

        // Generate a new token for the current session so it remains active
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

exports.getPortfolioHistory = async (req, res) => {
    try {
        const history = await PortfolioSnapshot.find({ user: req.user.id }).sort({ date: 'asc' });
        res.json(history);
    } catch (error) {
        console.error("Error fetching portfolio history:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};