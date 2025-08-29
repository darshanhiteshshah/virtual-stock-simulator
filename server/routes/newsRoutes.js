const express = require("express");
const router = express.Router();
const { getNews } = require("../controllers/newsController");
const { protect } = require("../middleware/authMiddleware");

// This route is protected, so only logged-in users can see the news.
router.get("/", protect, getNews);

module.exports = router;
