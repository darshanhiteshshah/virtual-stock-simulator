const User = require("../models/User");

// @desc    Get user's watchlist
// @route   GET /api/watchlist
// @access  Private
exports.getWatchlist = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user.watchlist);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Add a stock to the watchlist
// @route   POST /api/watchlist/add
// @access  Private
exports.addToWatchlist = async (req, res) => {
    const { symbol } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user.watchlist.includes(symbol)) {
            user.watchlist.push(symbol);
            await user.save();
        }
        res.json(user.watchlist);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Remove a stock from the watchlist
// @route   POST /api/watchlist/remove
// @access  Private
exports.removeFromWatchlist = async (req, res) => {
    const { symbol } = req.body;
    try {
        const user = await User.findById(req.user.id);
        user.watchlist = user.watchlist.filter((s) => s !== symbol);
        await user.save();
        res.json(user.watchlist);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
