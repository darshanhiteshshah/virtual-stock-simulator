const express = require('express');
const router = express.Router();
const { getTradeFeed, getTradeFeedStats } = require('../utils/tradefeedService');

/**
 * @route   GET /api/feed
 * @desc    Get recent trade feed
 * @access  Public
 */
router.get('/', (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 15;
        const feed = getTradeFeed(limit);
        
        res.json({
            success: true,
            count: feed.length,
            trades: feed
        });
    } catch (error) {
        console.error('Error fetching feed:', error);
        res.status(500).json({ message: 'Server error fetching feed' });
    }
});

/**
 * @route   GET /api/feed/stats
 * @desc    Get feed statistics
 * @access  Public
 */
router.get('/stats', (req, res) => {
    try {
        const stats = getTradeFeedStats();
        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Error fetching feed stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
