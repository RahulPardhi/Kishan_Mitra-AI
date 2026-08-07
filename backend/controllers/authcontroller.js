const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET || "fallback_secret", {
        expiresIn: "30d",
    });
};

const registerUser = async (req, res) => {
    try {
        const { name, email, password, mobile, location, language, darkMode } = req.body;

        const trimmedName = (name || "").trim();
        const normalizedEmail = (email || "").toLowerCase().trim();
        const trimmedMobile = (mobile || "").trim();
        const trimmedPassword = (password || "").trim();

        if (!trimmedName || !normalizedEmail || !trimmedPassword) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields (Name, Email, Password).",
            });
        }

        // Validate Name (alphabetic and spaces only, min length 2)
        const nameRegex = /^[A-Za-z\s]+$/;
        if (!nameRegex.test(trimmedName) || trimmedName.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Name can only contain alphabetic characters and spaces (at least 2 characters).",
            });
        }

        // Validate Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address.",
            });
        }

        // Validate Mobile (must be exactly 10 digits)
        const mobileRegex = /^\d{10}$/;
        if (!trimmedMobile || !mobileRegex.test(trimmedMobile)) {
            return res.status(400).json({
                success: false,
                message: "Mobile number must consist of exactly 10 numeric digits.",
            });
        }

        // Validate Password (min 6 chars)
        if (trimmedPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long.",
            });
        }

        // Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(trimmedPassword, salt);

        let userObj = null;

        try {
            const existingUser = await User.findOne({ email: normalizedEmail });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: "User already exists with this email address.",
                });
            }

            const dbUser = await User.create({
                name: trimmedName,
                email: normalizedEmail,
                password: hashedPassword,
                mobile: trimmedMobile,
                location: location || "",
                language: language || "en",
                darkMode: darkMode === true,
            });

            userObj = {
                _id: dbUser._id,
                name: dbUser.name,
                email: dbUser.email,
                mobile: dbUser.mobile,
                location: dbUser.location,
                language: dbUser.language,
                avatar: dbUser.avatar,
                notificationsEnabled: dbUser.notificationsEnabled,
                darkMode: dbUser.darkMode,
            };
        } catch (dbError) {
            console.error("Registration database error:", dbError.message);
            if (dbError.name === "ValidationError") {
                const firstErr = Object.values(dbError.errors)[0]?.message || "Validation failed";
                return res.status(400).json({
                    success: false,
                    message: firstErr,
                });
            }
            return res.status(503).json({
                success: false,
                message: "Unable to save your account. Please verify database connection and try again.",
            });
        }

        const token = generateToken({
            id: userObj._id,
            name: userObj.name,
            email: userObj.email,
            mobile: userObj.mobile,
            location: userObj.location,
            language: userObj.language,
            avatar: userObj.avatar,
            darkMode: userObj.darkMode,
        });

        res.status(201).json({
            success: true,
            message: "User registered successfully 🎉",
            token,
            user: userObj,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const normalizedEmail = (email || "").toLowerCase().trim();
        const trimmedPassword = (password || "").trim();

        if (!normalizedEmail || !trimmedPassword) {
            return res.status(400).json({
                success: false,
                message: "Please enter both Email and Password.",
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address.",
            });
        }

        let dbUser = null;
        let isMatch = false;

        try {
            dbUser = await User.findOne({ email: normalizedEmail });
            if (!dbUser) {
                return res.status(401).json({
                    success: false,
                    message: "User account not found. Please register first.",
                });
            }

            isMatch = await bcrypt.compare(trimmedPassword, dbUser.password);
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password.",
                });
            }
        } catch (dbErr) {
            console.error("Login database error:", dbErr.message);
            return res.status(503).json({
                success: false,
                message: "Unable to access account database. Please verify the database connection.",
            });
        }

        const foundUser = {
            _id: dbUser._id,
            name: dbUser.name,
            email: dbUser.email,
            mobile: dbUser.mobile,
            location: dbUser.location,
            language: dbUser.language,
            avatar: dbUser.avatar,
            notificationsEnabled: dbUser.notificationsEnabled,
            darkMode: dbUser.darkMode || false,
        };

        const token = generateToken({
            id: foundUser._id,
            name: foundUser.name,
            email: foundUser.email,
            mobile: foundUser.mobile,
            location: foundUser.location,
            language: foundUser.language,
            avatar: foundUser.avatar,
            darkMode: foundUser.darkMode,
        });

        res.json({
            success: true,
            message: "Login successful 🚀",
            token,
            user: foundUser,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = req.user;
        res.json({
            success: true,
            user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { name, email, mobile, location, language, avatar, notificationsEnabled, darkMode } = req.body;

        let updatedUser = null;

        try {
            const dbUser = await User.findById(userId);
            if (!dbUser) {
                return res.status(404).json({
                    success: false,
                    message: "Profile not found. Please sign in again.",
                });
            }

            if (name) dbUser.name = name;
            if (email) dbUser.email = email.toLowerCase().trim();
            if (mobile !== undefined) dbUser.mobile = mobile;
            if (location !== undefined) dbUser.location = location;
            if (language) dbUser.language = language;
            if (avatar !== undefined) dbUser.avatar = avatar;
            if (notificationsEnabled !== undefined) dbUser.notificationsEnabled = notificationsEnabled;
            if (darkMode !== undefined) dbUser.darkMode = darkMode;

            await dbUser.save();
            updatedUser = {
                _id: dbUser._id,
                name: dbUser.name,
                email: dbUser.email,
                mobile: dbUser.mobile,
                location: dbUser.location,
                language: dbUser.language,
                avatar: dbUser.avatar,
                notificationsEnabled: dbUser.notificationsEnabled,
                darkMode: dbUser.darkMode,
            };
        } catch (dbErr) {
            console.error("Profile update database error:", dbErr.message);
            return res.status(503).json({
                success: false,
                message: "Unable to save profile changes. Please verify the database connection and try again.",
            });
        }

        res.json({
            success: true,
            message: "Profile updated successfully ✅",
            user: updatedUser,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const { generateGeminiText } = require("../config/geminiService");

const getProfileAiAdvisory = async (req, res) => {
    try {
        const user = req.user || {};
        const userName = user.name || "Farmer";
        const userLocation = user.location || "India";
        const userLang = user.language || "en";

        let advisory = null;
        try {
            const prompt = `You are Kisan Mitra AI. Provide a personalized 3-bullet seasonal farming advisory for a farmer named ${userName} based in ${userLocation}. Reply concisely in language '${userLang}'. Include recommended seasonal crops, soil health advice, and weather precaution.`;
            advisory = await generateGeminiText(prompt);
        } catch (e) {
            console.warn("Gemini profile advisory skipped:", e.message);
        }

        if (!advisory) {
            advisory = `🌾 Welcome ${userName}! Kisan Mitra AI recommends monitoring soil moisture and following local weather advisories for optimal crop health in ${userLocation}.`;
        }

        res.json({
            success: true,
            user: {
                name: user.name,
                location: user.location,
                language: user.language,
            },
            advisory,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getProfile,
    updateProfile,
    getProfileAiAdvisory,
};

