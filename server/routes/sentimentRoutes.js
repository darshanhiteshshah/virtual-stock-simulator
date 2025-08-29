const express = require("express");
const router = express.Router();
const { getSentiment } = require("../controllers/sentimentController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getSentiment);

module.exports = router;
