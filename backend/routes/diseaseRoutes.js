const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { analyzeDisease } = require("../controllers/diseaseController");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `crop_${Date.now()}${path.extname(file.originalname || ".jpg")}`);
    },
});

const upload = multer({ storage });

router.post("/analyze", upload.single("image"), analyzeDisease);

module.exports = router;
