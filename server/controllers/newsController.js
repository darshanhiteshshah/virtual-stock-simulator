const { getRecentNews } = require('../utils/newsService');

// @desc    Get recent market news
// @route   GET /api/news
// @access  Private
exports.getNews = async (req, res) => {
    try {
        const news = getRecentNews();
        res.json(news);
    } catch (error) {
        console.error("Error fetching news:", error.message);
        res.status(500).json({ message: "Server error while fetching news." });
    }
};
