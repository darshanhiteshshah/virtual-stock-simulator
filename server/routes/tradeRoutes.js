const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { 
    buyStock, 
    sellStock, 
    placeOrder, 
    getPendingOrders,
    getAllOrders,
    cancelOrder,
    getTradeHistory,
    validateBuyOrder,
    validateSellOrder
} = require("../controllers/tradeController");

const router = express.Router();

// ==============================================
// MARKET ORDERS (Instant Execution at Current Price)
// ==============================================

/**
 * @route   POST /api/trade/buy
 * @desc    Buy stock at current market price (Yahoo Finance BSE)
 * @access  Private
 * @body    { symbol: "RELIANCE", quantity: 10 }
 */
router.post("/buy", protect, buyStock);

/**
 * @route   POST /api/trade/sell
 * @desc    Sell stock at current market price (Yahoo Finance BSE)
 * @access  Private
 * @body    { symbol: "TCS", quantity: 5 }
 */
router.post("/sell", protect, sellStock);

// ==============================================
// LIMIT & STOP LOSS ORDERS (Pending Orders)
// ==============================================

/**
 * @route   POST /api/trade/place-order
 * @desc    Place a limit or stop loss order
 * @access  Private
 * @body    { 
 *   symbol: "INFY", 
 *   quantity: 20, 
 *   orderType: "LIMIT", 
 *   tradeType: "BUY",
 *   targetPrice: 1450
 * }
 */
router.post("/place-order", protect, placeOrder);

/**
 * @route   GET /api/trade/pending-orders
 * @desc    Get all pending orders for current user
 * @access  Private
 */
router.get("/pending-orders", protect, getPendingOrders);

/**
 * @route   GET /api/trade/all-orders
 * @desc    Get all orders (pending, executed, cancelled, expired)
 * @access  Private
 * @query   ?status=PENDING (optional)
 */
router.get("/all-orders", protect, getAllOrders);

/**
 * @route   DELETE /api/trade/cancel-order/:orderId
 * @desc    Cancel a pending order
 * @access  Private
 */
router.delete("/cancel-order/:orderId", protect, cancelOrder);

// ==============================================
// TRADE HISTORY & VALIDATION
// ==============================================

/**
 * @route   GET /api/trade/history
 * @desc    Get trade history for current user
 * @access  Private
 * @query   ?symbol=RELIANCE&startDate=2025-01-01&endDate=2025-12-31
 */
router.get("/history", protect, getTradeHistory);

/**
 * @route   POST /api/trade/validate-buy
 * @desc    Validate if user can afford to buy stock
 * @access  Private
 * @body    { symbol: "RELIANCE", quantity: 10, price: 1408 }
 */
router.post("/validate-buy", protect, validateBuyOrder);

/**
 * @route   POST /api/trade/validate-sell
 * @desc    Validate if user has enough shares to sell
 * @access  Private
 * @body    { symbol: "TCS", quantity: 5 }
 */
router.post("/validate-sell", protect, validateSellOrder);

module.exports = router;
