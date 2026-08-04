const jwt = require("jsonwebtoken");
const User = require("../models/user");

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");

            try {
                req.user = await User.findById(decoded.id).select("-password");
            } catch (dbErr) {
                console.error("Profile database error:", dbErr.message);
                return res.status(503).json({
                    success: false,
                    message: "Unable to access the profile. Please verify the database connection and try again.",
                });
            }

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Profile not found. Please sign in again.",
                });
            }

            return next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "Not authorized, token invalid"
            });
        }
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Not authorized, no token provided"
        });
    }
};

module.exports = { protect };
