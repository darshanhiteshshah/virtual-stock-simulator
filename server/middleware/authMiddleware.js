const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select("-password");

            // --- NEW CHECK ---
            // Verify if the token version matches the one in the database
            if (req.user.tokenVersion !== decoded.tokenVersion) {
                return res.status(401).json({ message: "Not authorized, session has expired." });
            }

            if (req.user) {
                return next();
            } else {
                return res.status(401).json({ message: "Not authorized, user not found" });
            }

        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: "Not authorized, token has expired" });
            }
            console.error("JWT verification failed:", error.message);
            return res.status(401).json({ message: "Not authorized, token failed" });
        }
    }

    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token provided" });
    }
};

module.exports = { protect };