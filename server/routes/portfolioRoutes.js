const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
    getPortfolio,
    getPortfolioSummary,
    getStockHolding,
    resetPortfolio
} = require("../controllers/portfolioController");

/**
 * @route   GET /api/portfolio
 * @desc    Get user's complete portfolio with raw holdings
 * @access  Private
 */
router.get("/", protect, getPortfolio);

/**
 * @route   GET /api/portfolio/summary
 * @desc    Get portfolio summary with statistics
 * @access  Private
 */
router.get("/summary", protect, getPortfolioSummary);

/**
 * @route   GET /api/portfolio/:symbol
 * @desc    Get specific stock holding details
 * @access  Private
 */
router.get("/:symbol", protect, getStockHolding);

/**
 * @route   DELETE /api/portfolio/reset
 * @desc    Reset portfolio (for testing)
 * @access  Private
 */
router.delete("/reset", protect, resetPortfolio);

module.exports = router;
