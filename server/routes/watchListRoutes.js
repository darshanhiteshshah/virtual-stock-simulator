const express = require("express");
const router = express.Router();
const {
    getWatchlist,
    addToWatchlist,
    removeFromWatchlist,
} = require("../controllers/watchListController");
const { protect } = require("../middleware/authMiddleware");

router.route("/").get(protect, getWatchlist);
router.route("/add").post(protect, addToWatchlist);
router.route("/remove").post(protect, removeFromWatchlist);

module.exports = router;
