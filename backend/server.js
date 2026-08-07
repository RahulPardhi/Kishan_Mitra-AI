const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const weatherRoutes = require("./routes/weatherRoutes");
const soilRoutes = require("./routes/soilRoutes");
const diseaseRoutes = require("./routes/diseaseRoutes");
const chatRoutes = require("./routes/chatRoutes");

dotenv.config();

// Connect Database
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Static uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serve Frontend Static Files (no-cache to ensure latest updates are always served)
app.use(express.static(path.join(__dirname, "../frontend"), {
    etag: false,
    maxAge: 0,
    setHeaders: (res) => {
        res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        res.set("Pragma", "no-cache");
        res.set("Expires", "0");
    },
}));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/soil", soilRoutes);
app.use("/api/disease", diseaseRoutes);
app.use("/api/chat", chatRoutes);

// Root Status Endpoint
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Kisan Mitra AI Full-Stack Backend Operational 🚀",
        timestamp: new Date().toISOString(),
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Kisan Mitra Server running on port ${PORT}`);
});