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

// ⚠️ IMPORTANT: Most specific routes FIRST!



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
