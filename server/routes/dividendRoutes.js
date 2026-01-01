const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getUserDividends, getUpcomingDividends } = require('../controllers/dividendController');

router.get('/user', protect, getUserDividends);
router.get('/upcoming', protect, getUpcomingDividends);

module.exports = router;
