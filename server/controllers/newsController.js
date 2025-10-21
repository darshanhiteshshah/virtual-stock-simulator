const { getRecentNews, getNewsForSymbol, isNewsServiceConfigured } = require('../utils/newsService');

/**
 * @desc    Get recent market news
 * @route   GET /api/news
 * @access  Public
 */
const getMarketNews = async (req, res) => {
    try {
        // Check if news service is configured
        if (!isNewsServiceConfigured()) {
            return res.status(503).json({
                success: false,
                message: 'News service not configured. Please add NEWS_API_KEY or GNEWS_API_KEY to environment variables.',
                docs: 'Get free API keys from: https://newsapi.org/ or https://gnews.io/'
            });
        }

        const limit = parseInt(req.query.limit) || 10;
        
        console.log(`📰 Fetching ${limit} market news articles...`);
        
        const news = await getRecentNews();
        
        res.json({
            success: true,
            count: news.length,
            news: news.slice(0, limit)
        });

    } catch (error) {
        console.error('❌ Error fetching market news:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch news',
            error: error.message
        });
    }
};

/**
 * @desc    Get news for specific stock symbol
 * @route   GET /api/news/:symbol
 * @access  Public
 */
const getStockNews = async (req, res) => {
    try {
        const { symbol } = req.params;

        if (!symbol) {
            return res.status(400).json({
                success: false,
                message: 'Stock symbol is required'
            });
        }

        // Check if news service is configured
        if (!isNewsServiceConfigured()) {
            return res.status(503).json({
                success: false,
                message: 'News service not configured',
                docs: 'Get free API keys from: https://newsapi.org/ or https://gnews.io/'
            });
        }

        const limit = parseInt(req.query.limit) || 7;

        console.log(`📰 Fetching news for ${symbol}...`);

        const news = await getNewsForSymbol(symbol.toUpperCase());

        res.json({
            success: true,
            symbol: symbol.toUpperCase(),
            count: news.length,
            news: news.slice(0, limit)
        });

    } catch (error) {
        console.error(`❌ Error fetching news for ${req.params.symbol}:`, error);
        res.status(500).json({
            success: false,
            message: `Failed to fetch news for ${req.params.symbol}`,
            error: error.message
        });
    }
};

/**
 * @desc    Check news service status
 * @route   GET /api/news/status
 * @access  Public
 */
const getNewsServiceStatus = async (req, res) => {
    try {
        const isConfigured = isNewsServiceConfigured();
        const hasNewsAPI = !!process.env.NEWS_API_KEY;
        const hasGNewsAPI = !!process.env.GNEWS_API_KEY;

        res.json({
            success: true,
            configured: isConfigured,
            services: {
                newsAPI: hasNewsAPI ? 'configured' : 'not configured',
                gNewsAPI: hasGNewsAPI ? 'configured' : 'not configured'
            },
            message: isConfigured 
                ? 'News service is operational' 
                : 'News service not configured. Add API keys to use this feature.',
            docs: {
                newsAPI: 'https://newsapi.org/',
                gNewsAPI: 'https://gnews.io/'
            }
        });

    } catch (error) {
        console.error('❌ Error checking news service status:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking service status',
            error: error.message
        });
    }
};

module.exports = {
    getMarketNews,
    getStockNews,
    getNewsServiceStatus
};
