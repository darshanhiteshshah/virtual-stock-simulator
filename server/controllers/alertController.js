const User = require("../models/User");

// @desc    Get all active alerts for a user
// @route   GET /api/alerts
exports.getAlerts = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json(user.priceAlerts);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Create a new price alert
// @route   POST /api/alerts
exports.createAlert = async (req, res) => {
    const { symbol, targetPrice, condition } = req.body;
    try {
        const user = await User.findById(req.user.id);
        user.priceAlerts.push({ symbol, targetPrice, condition });
        await user.save();
        res.status(201).json(user.priceAlerts);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Delete a price alert
// @route   DELETE /api/alerts/:id
exports.deleteAlert = async (req, res) => {
    const alertId = req.params.id;
    try {
        const user = await User.findById(req.user.id);
        user.priceAlerts.id(alertId).remove();
        await user.save();
        res.json(user.priceAlerts);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
