const { getTradeFeed } = require('../utils/tradeFeedService');

// @desc    Get the live public trade feed
// @route   GET /api/feed
// @access  Private
exports.getFeed = (req, res) => {
    try {
        const feed = getTradeFeed();
        res.json(feed);
    } catch (error) {
        res.status(500).json({ message: "Server error fetching trade feed." });
    }
};
