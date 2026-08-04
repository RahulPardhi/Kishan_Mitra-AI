const express = require("express");
const router = express.Router();
const {
    registerUser,
    loginUser,
    getProfile,
    updateProfile,
    getProfileAiAdvisory,
} = require("../controllers/authcontroller");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.get("/ai-advisory", protect, getProfileAiAdvisory);

module.exports = router;