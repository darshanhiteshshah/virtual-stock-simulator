// routes/stockRoutes.js
const express = require("express");
const router = express.Router();

// Import controller functions
const { 
    getStockPrice, 
    getAllStocks, 
    getMultipleStockPrices,
    getStockHistory,
    screenStocks,
    getStockProfile
} = require("../controllers/stockController");

const { protect } = require("../middleware/authMiddleware");

// Get all available stocks (for dropdown, watchlist, etc.)
// GET /api/stocks
router.get("/", protect, getAllStocks);

// Get single stock quote with current price
// GET /api/stocks/price/:symbol
router.get("/price/:symbol", protect, getStockPrice);

// Get multiple stock prices at once (for ticker, portfolio updates)
// POST /api/stocks/prices
// Body: { symbols: ["RELIANCE", "TCS", "INFY"] }
router.post("/prices", protect, getMultipleStockPrices);

// Get historical OHLC data for charts
// GET /api/stocks/history/:symbol?period=1mo
router.get("/history/:symbol", protect, getStockHistory);

// Screen stocks by filters (sector, market cap, P/E ratio)
// POST /api/stocks/screener
// Body: { sector: "IT", minMarketCap: 1000, maxMarketCap: 100000, minPeRatio: 10, maxPeRatio: 30 }
router.post("/screener", protect, screenStocks);

// Get complete stock profile (quote + history + news)
// GET /api/stocks/profile/:symbol
router.get("/profile/:symbol", protect, getStockProfile);

module.exports = router;
