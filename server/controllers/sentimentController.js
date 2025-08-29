const { getSentimentData } = require('../utils/sentimentService');

// @desc    Get market sentiment heatmap data
// @route   GET /api/sentiment
// @access  Private
exports.getSentiment = (req, res) => {
    try {
        const sentimentData = getSentimentData();
        res.json(sentimentData);
    } catch (error) {
        console.error("Error fetching sentiment data:", error.message);
        res.status(500).json({ message: "Server error while fetching sentiment data." });
    }
};
