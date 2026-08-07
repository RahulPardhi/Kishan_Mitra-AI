const mongoose = require("mongoose");

const connectDB = async () => {
    const uri = process.env.MONGO_URI;

    if (!uri) {
        console.error("❌ MONGO_URI is not set in environment variables.");
        return;
    }

    const connectWithRetry = async (retries = 5, delay = 5000) => {
        for (let i = 1; i <= retries; i++) {
            try {
                await mongoose.connect(uri);
                console.log("✅ MongoDB Connected");
                return;
            } catch (error) {
                console.error(`❌ Database Connection Attempt ${i}/${retries} Failed:`, error.message);
                if (i < retries) {
                    console.log(`⏳ Retrying in ${delay / 1000}s...`);
                    await new Promise((r) => setTimeout(r, delay));
                }
            }
        }
        console.error("❌ All database connection attempts failed. Server will continue running but DB features will be unavailable.");
    };

    await connectWithRetry();
};

module.exports = connectDB;