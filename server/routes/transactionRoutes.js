const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
    getTransactions,
    getTransactionById,
    getTransactionsBySymbol,
    getTransactionsByType,
    getTransactionStats
} = require("../controllers/transactionController");

// Get all transactions for logged-in user
router.get("/", protect, getTransactions);

// Get transaction statistics
router.get("/stats", protect, getTransactionStats);

// Get transactions by type (BUY/SELL)
router.get("/type/:type", protect, getTransactionsByType);

// Get transactions by stock symbol
router.get("/symbol/:symbol", protect, getTransactionsBySymbol);

// Get specific transaction by ID
router.get("/:id", protect, getTransactionById);

module.exports = router;
