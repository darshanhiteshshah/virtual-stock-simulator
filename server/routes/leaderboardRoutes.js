const express = require("express");
const router = express.Router();
const { getLeaderboard } = require("../controllers/leaderboardController");

// This route is public, so it does not need the 'protect' middleware.
router.get("/", getLeaderboard);

module.exports = router;
