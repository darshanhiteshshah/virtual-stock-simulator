const express = require("express");
const router = express.Router();

const { 
    getStockPrice, 
    getAllStocks, 
    getMultipleStockPrices,
    getStockHistory,
    screenStocks,
    getStockProfile,
} = require("../controllers/stockController");

const { protect } = require("../middleware/authMiddleware");
const { getMarketStatus } = require("../utils/marketHours");

// ⚠️ IMPORTANT: Most specific routes FIRST!

// Market status endpoint (NO AUTH REQUIRED - public info)
router.get("/market-status", (req, res) => {
    try {
        const status = getMarketStatus();
        
        // Add current time in IST
        const now = new Date();
        const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
        
        res.json({
            ...status,
            currentTime: istTime.toLocaleTimeString('en-IN', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
            })
        });
    } catch (error) {
        console.error('Error getting market status:', error);
        res.status(500).json({ 
            error: 'Failed to get market status',
            isOpen: false,
            status: 'ERROR',
            message: 'Unable to determine market status'
        });
    }
});

// Get all stocks list
router.get("/", protect, getAllStocks);

// Get single stock quote
router.get("/price/:symbol", protect, getStockPrice);

// Get multiple prices
router.post("/prices", protect, getMultipleStockPrices);

// Get history
router.get("/history/:symbol", protect, getStockHistory);

// Stock screener
router.post("/screener", protect, screenStocks);

// Get stock profile (must be LAST)
router.get("/profile/:symbol", protect, getStockProfile);

module.exports = router;
