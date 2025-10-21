const express = require('express');
const router = express.Router();
const { 
    getMarketNews, 
    getStockNews, 
    getNewsServiceStatus 
} = require('../controllers/newsController');

/**
 * @route   GET /api/news
 * @desc    Get recent market news
 * @access  Public
 * @query   ?limit=10 (optional)
 * 
 * Example: GET /api/news?limit=15
 */
router.get('/', getMarketNews);

/**
 * @route   GET /api/news/status
 * @desc    Check if news service is configured
 * @access  Public
 * 
 * Example: GET /api/news/status
 */
router.get('/status', getNewsServiceStatus);

/**
 * @route   GET /api/news/:symbol
 * @desc    Get news for specific stock
 * @access  Public
 * @query   ?limit=7 (optional)
 * 
 * Example: GET /api/news/RELIANCE?limit=5
 */
router.get('/:symbol', getStockNews);

module.exports = router;
