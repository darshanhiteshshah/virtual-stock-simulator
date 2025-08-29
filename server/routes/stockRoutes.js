const express = require("express");
const router = express.Router();
// Import all three controller functions for stocks
const { 
    getStockPrice, 
    getAllStocks, 
    getMultipleStockPrices,
    getStockHistory ,
    screenStocks,
    getStockProfile
} = require("../controllers/stockController");
const { protect } = require("../middleware/authMiddleware");

// Route to get the list of all available stocks for the dropdown
// GET /api/stocks
router.get("/", protect, getAllStocks);

// Route to get a specific stock's price and details
// GET /api/stocks/price/:symbol
router.get("/price/:symbol", protect, getStockPrice);

// Route to get live prices for multiple stocks at once (for the ticker)
// POST /api/stocks/prices
router.post("/prices", protect, getMultipleStockPrices);

router.get("/history/:symbol", protect, getStockHistory);

router.post("/screener", protect, screenStocks);



router.get("/profile/:symbol", protect, getStockProfile);
module.exports = router;
