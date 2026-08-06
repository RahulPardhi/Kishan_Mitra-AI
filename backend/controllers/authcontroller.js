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
        const { name, email, password, mobile, location, language } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields (name, email, password)",
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let userObj = null;

        try {
            const existingUser = await User.findOne({ email: normalizedEmail });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: "User already exists with this email",
                });
            }

            const dbUser = await User.create({
                name: name.trim(),
                email: normalizedEmail,
                password: hashedPassword,
                mobile: mobile || "",
                location: location || "Nagpur",
                language: language || "en",
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
            };
        } catch (dbError) {
            console.error("Registration database error:", dbError.message);
            return res.status(503).json({
                success: false,
                message: "Unable to save your account. Please verify the database connection and try again.",
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

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please enter both Email and Password",
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        let foundUser = null;
        let isMatch = false;

        try {
            let dbUser = await User.findOne({ email: normalizedEmail });
            if (!dbUser) {
                // Save user to database upon login if record does not exist
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
                const defaultName = req.body.name || normalizedEmail.split("@")[0];
                dbUser = await User.create({
                    name: defaultName,
                    email: normalizedEmail,
                    password: hashedPassword,
                    mobile: req.body.mobile || "",
                    location: req.body.location || "Nagpur",
                    language: req.body.language || "en",
                });
                isMatch = true;
            } else {
                isMatch = await bcrypt.compare(password, dbUser.password);
                if (isMatch) {
                    let dirty = false;
                    if (req.body.name && req.body.name !== dbUser.name) { dbUser.name = req.body.name; dirty = true; }
                    if (req.body.mobile !== undefined && req.body.mobile !== dbUser.mobile) { dbUser.mobile = req.body.mobile; dirty = true; }
                    if (req.body.location !== undefined && req.body.location !== dbUser.location) { dbUser.location = req.body.location; dirty = true; }
                    if (req.body.language && req.body.language !== dbUser.language) { dbUser.language = req.body.language; dirty = true; }
                    if (dirty) await dbUser.save();
                }
            }

            if (dbUser && isMatch) {
                foundUser = {
                    _id: dbUser._id,
                    name: dbUser.name,
                    email: dbUser.email,
                    password: dbUser.password,
                    mobile: dbUser.mobile,
                    location: dbUser.location,
                    language: dbUser.language,
                    avatar: dbUser.avatar,
                    notificationsEnabled: dbUser.notificationsEnabled,
                };
            }
        } catch (dbErr) {
            console.error("Login database error:", dbErr.message);
            return res.status(503).json({
                success: false,
                message: "Unable to access accounts. Please verify the database connection and try again.",
            });
        }

        if (!foundUser || !isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const token = generateToken({
            id: foundUser._id,
            name: foundUser.name,
            email: foundUser.email,
            mobile: foundUser.mobile,
            location: foundUser.location,
            language: foundUser.language,
            avatar: foundUser.avatar,
        });

        const responseUser = { ...foundUser };
        delete responseUser.password;

        res.json({
            success: true,
            message: "Login successful 🚀",
            token,
            user: responseUser,
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
        const { name, email, mobile, location, language, avatar, notificationsEnabled } = req.body;

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
        const userLocation = user.location || "Nagpur, India";
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

