const User = require("../models/User");

// This controller is now simplified. It only sends the user's raw portfolio holdings.
// All live price calculations will be handled on the client-side for perfect synchronization.
exports.getPortfolio = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("portfolio walletBalance");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            walletBalance: user.walletBalance,
            stocks: user.portfolio, // Send the raw stock holdings
        });
    } catch (error) {
        console.error("Error fetching portfolio:", error.message);
        res.status(500).json({ message: "Server error: Failed to fetch portfolio." });
    }
};
