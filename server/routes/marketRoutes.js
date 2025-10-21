const express = require('express');
const router = express.Router();
const { getMarketStatus, MARKET_HOLIDAYS_2025 } = require('../utils/marketHours');

/**
 * @route   GET /api/market/status
 * @desc    Get current market status
 * @access  Public
 */
router.get('/status', (req, res) => {
    try {
        const status = getMarketStatus();
        res.json({
            success: true,
            ...status
        });
    } catch (error) {
        console.error('Error fetching market status:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route   GET /api/market/holidays
 * @desc    Get list of market holidays
 * @access  Public
 */
router.get('/holidays', (req, res) => {
    try {
        res.json({
            success: true,
            year: 2025,
            holidays: MARKET_HOLIDAYS_2025
        });
    } catch (error) {
        console.error('Error fetching holidays:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
