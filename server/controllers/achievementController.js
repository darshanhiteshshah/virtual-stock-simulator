const User = require("../models/User");
const { ALL_ACHIEVEMENTS } = require('../utils/achievementService');

// @desc    Get all achievements and user's earned status
// @route   GET /api/achievements
exports.getAchievements = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("achievements");
        
        const achievementsStatus = ALL_ACHIEVEMENTS.map(ach => ({
            ...ach,
            isEarned: user.achievements.includes(ach.code),
        }));

        res.json(achievementsStatus);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
