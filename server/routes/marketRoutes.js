// const express = require('express');
// const router = express.Router();
// const { getMarketStatus, MARKET_HOLIDAYS_2025 } = require('../utils/marketHours');

// /**
//  * @route   GET /api/market/status
//  * @desc    Get current market status
//  * @access  Public
//  */
// router.get('/status', (req, res) => {
//     try {
//         const status = getMarketStatus();
//         res.json({
//             success: true,
//             ...status
//         });
//     } catch (error) {
//         console.error('Error fetching market status:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// });

// /**
//  * @route   GET /api/market/holidays
//  * @desc    Get list of market holidays
//  * @access  Public
//  */
// router.get('/holidays', (req, res) => {
//     try {
//         res.json({
//             success: true,
//             year: 2025,
//             holidays: MARKET_HOLIDAYS_2025
//         });
//     } catch (error) {
//         console.error('Error fetching holidays:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const { getMarketStatus, MARKET_HOLIDAYS_2025 } = require('../utils/marketHours');

// ✅ IMPORT THIS
const { getMockStockData } = require('../services/stockService');

/**
 * @route   GET /api/market/status
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


// ===============================
// ✅ ADD THIS (IMPORTANT)
// ===============================

/**
 * @route   GET /api/market/live-price/:symbol
 * @desc    Get live stock price (Upstox)
 */
router.get('/live-price/:symbol', async (req, res) => {
    try {
        const symbol = req.params.symbol;

        const stock = await getMockStockData(symbol);

        if (!stock) {
            return res.status(404).json({ message: "Stock not found" });
        }

        res.json({
            success: true,
            data: stock
        });

    } catch (error) {
        console.error("Error fetching live price:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;