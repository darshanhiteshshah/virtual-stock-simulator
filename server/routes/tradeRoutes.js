const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { buyStock, sellStock, placeOrder, getPendingOrders, cancelOrder } = require("../controllers/tradeController");
const router = express.Router();

// --- MARKET ORDERS ---
router.post("/buy", protect, buyStock);
router.post("/sell", protect, sellStock);

// --- PENDING ORDERS ---
router.post("/place-order", protect, placeOrder);
router.get("/pending-orders", protect, getPendingOrders);
router.delete("/cancel-order/:orderId", protect, cancelOrder);

module.exports = router;