const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Generate JWT Token - NOW INCLUDES tokenVersion
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, username: user.username, tokenVersion: user.tokenVersion },
        process.env.JWT_SECRET,
        { expiresIn: "7d" } // Token expires in 7 days
    );
};

// @desc    Register a new user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingUserByUsername = await User.findOne({ username });
        if (existingUserByUsername) {
            return res.status(400).json({ message: "Username is already taken." });
        }
        const existingUserByEmail = await User.findOne({ email });
        if (existingUserByEmail) {
            return res.status(400).json({ message: "An account with this email already exists." });
        }

        const user = await User.create({
            username,
            email,
            password,
            walletBalance: 100000,
        });

        const token = generateToken(user);

        res.status(201).json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                walletBalance: user.walletBalance,
            },
            token,
        });
    } catch (error) {
        console.error("Error during user registration:", error.message);
        res.status(500).json({ message: "Server error during registration." });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ message: "Invalid username or password." });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid username or password." });
        }

        const token = generateToken(user);

        res.json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                walletBalance: user.walletBalance,
            },
            token,
        });
    } catch (error) {
        console.error("Error during user login:", error.message);
        res.status(500).json({ message: "Server error during login." });
    }
};

// --- EXPORT generateToken ---
exports.generateToken = generateToken;