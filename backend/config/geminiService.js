const fs = require("fs");
const path = require("path");

const getApiKey = () => {
    if (!process.env.GEMINI_API_KEY) {
        try {
            require("dotenv").config({ path: path.join(__dirname, "../.env") });
        } catch (e) { }
    }
    return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
};

const PREFERRED_MODELS = [
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro"
];

/**
 * Generate AI text content using Gemini API
 */
const generateGeminiText = async (prompt, systemInstruction = "") => {
    const apiKey = getApiKey();
    if (!apiKey) return null;

    const fullPrompt = systemInstruction ? `${systemInstruction}\n\nUser Query: ${prompt}` : prompt;

    for (const modelName of PREFERRED_MODELS) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: fullPrompt }]
                    }]
                })
            });

            if (response.ok) {
                const data = await response.json();
                const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) return text.trim();
            }
        } catch (error) {
            console.warn(`Gemini API model [${modelName}] error:`, error.message);
        }
    }
    return null;
};

/**
 * Analyze crop leaf image using Gemini Vision API
 */
const analyzeGeminiImage = async (imagePath, prompt = "Analyze this plant/crop leaf image for disease. Identify disease name, symptoms, confidence score %, and treatment recommendations.") => {
    const apiKey = getApiKey();
    if (!apiKey || !imagePath || !fs.existsSync(imagePath)) return null;

    let mimeType = "image/jpeg";
    if (imagePath.endsWith(".png")) mimeType = "image/png";
    if (imagePath.endsWith(".webp")) mimeType = "image/webp";

    const imageBuffer = fs.readFileSync(imagePath);
    const base64Data = imageBuffer.toString("base64");
    let lastErrorMessage = "";

    for (const modelName of PREFERRED_MODELS) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: prompt },
                            {
                                inlineData: {
                                    mimeType: mimeType,
                                    data: base64Data
                                }
                            }
                        ]
                    }],
                    generationConfig: {
                        responseMimeType: "application/json",
                        temperature: 0.2
                    }
                })
            });

            if (response.ok) {
                const data = await response.json();
                const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) return text.trim();
            } else {
                const errorData = await response.json().catch(() => ({}));
                lastErrorMessage = errorData?.error?.message || `Gemini returned HTTP ${response.status}.`;

                // A quota error will affect every model for this API key, so
                // avoid making unnecessary retry requests against other models.
                if (response.status === 429) break;
            }
        } catch (error) {
            lastErrorMessage = error.message;
            console.warn(`Gemini Vision API model [${modelName}] error:`, error.message);
        }
    }
    throw new Error(lastErrorMessage || "Gemini Vision did not return an analysis.");
};

module.exports = {
    getApiKey,
    generateGeminiText,
    analyzeGeminiImage,
};
