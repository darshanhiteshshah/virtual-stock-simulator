const express = require("express");
const router = express.Router();
const {
    getUserProfile,
    updateUserPassword,
    logoutOtherSessions,
    getPortfolioHistory, // --- NEW ---
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

router.route("/profile").get(protect, getUserProfile);
router.route("/profile/password").put(protect, updateUserPassword);

// --- ADD NEW ROUTE ---
router.route("/profile/logout-others").post(protect, logoutOtherSessions);

router.route("/portfolio-history").get(protect, getPortfolioHistory);

module.exports = router;