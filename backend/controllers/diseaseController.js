const path = require("path");
const { execFile } = require("child_process");
const fs = require("fs");
const { promisify } = require("util");
const { analyzeGeminiImage } = require("../config/geminiService");

const execFileAsync = promisify(execFile);
const localPredictScript = path.join(__dirname, "../../ai/predict.py");

const analyzeWithLocalModel = async (imagePath) => {
    if (!fs.existsSync(localPredictScript)) {
        throw new Error("Local disease-analysis script was not found.");
    }

    // The Windows Python Store alias cannot be spawned from Node. Use the
    // Python launcher there, while still allowing an explicit override.
    const isWindows = process.platform === "win32";
    const pythonExecutable = process.env.PYTHON_EXECUTABLE || (isWindows ? "py" : "python3");
    const pythonArgs = isWindows && !process.env.PYTHON_EXECUTABLE
        ? ["-3", localPredictScript, imagePath]
        : [localPredictScript, imagePath];
    const { stdout } = await execFileAsync(pythonExecutable, pythonArgs, {
        timeout: 30000,
        maxBuffer: 1024 * 1024,
        windowsHide: true,
    });

    const result = JSON.parse(stdout.trim());
    if (!result?.disease || !result?.symptoms || !result?.recommendation) {
        throw new Error("Local disease analyzer returned an incomplete diagnosis.");
    }
    return result;
};

let backendLastIndex = 0;

const DISEASE_CATALOG = [
    {
        key: "leaf_blight",
        disease: {
            en: "Leaf Blight (Alternaria / Bipolaris)",
            hi: "लीफ ब्लाइट (पत्तियों का झुलसा रोग)",
            mr: "पानावरील करपा रोग (लीफ ब्लाइट)",
        },
        confidence: 98,
        symptoms: {
            en: "Brown to black lesions with yellow halos on leaf margins and tips.",
            hi: "पत्तियों के किनारों और सिरों पर पीले घेरे के साथ भूरे-काले धब्बे।",
            mr: "पानांच्या कडांवर पिवळ्या कड्यांसह तपकिरी-काळे डाग.",
        },
        recommendation: {
            en: "Use Mancozeb 75% WP fungicide spray (2.5g/L) and avoid overwatering soil.",
            hi: "मैनकोज़ेब 75% WP फफूंदनाशी (2.5 ग्राम/लीटर) का छिड़काव करें और अधिक सिंचाई से बचें।",
            mr: "मँकोझेब 75% WP बुरशीनाशक (2.5 ग्रॅम/लीटर) फवारा आणि जास्त पाणी देणे टाळा.",
        },
    },
    {
        key: "powdery_mildew",
        disease: {
            en: "Powdery Mildew (Erysiphe Cichoracearum)",
            hi: "पाउडरी मिल्ड्यू (चूर्णिल आसिता रोग)",
            mr: "पावडरी मिल्ड्यू (भुरी रोग)",
        },
        confidence: 96,
        symptoms: {
            en: "White powdery patches covering leaf surface leading to premature leaf drop.",
            hi: "पत्तियों की सतह पर सफेद पाउडर जैसी परत, जिससे पत्तियां समय से पहले गिर जाती हैं।",
            mr: "पानांवर पांढरा पावडरचा थर ज्यामुळे पाने गळतात.",
        },
        recommendation: {
            en: "Apply Sulphur 80% WP or Hexaconazole 5% EC. Maintain plant-to-plant spacing.",
            hi: "सल्फर 80% WP या हेक्साकोनाज़ोल का छिड़काव करें। पौधों के बीच उचित दूरी बनाएं।",
            mr: "सल्फर 80% WP किंवा हेक्साकोनाझोल फवारा. रोपांमध्ये योग्य अंतर ठेवा.",
        },
    },
    {
        key: "yellow_mosaic",
        disease: {
            en: "Yellow Mosaic Virus",
            hi: "येलो मोज़ेक वायरस (पीला मोज़ेक)",
            mr: "पिवळा मोझॅक व्हायरस (येलो मोझॅक)",
        },
        confidence: 95,
        symptoms: {
            en: "Yellowing and mottling pattern on leaves spread by whiteflies.",
            hi: "पत्तियों का पीला पड़ना और चित्तीदार होना जो सफेद मक्खियों द्वारा फैलता है।",
            mr: "पाना पिवळी पडणे व ठिपके येणे. पांढऱ्या माशीद्वारे प्रसार.",
        },
        recommendation: {
            en: "Spray Thiamethoxam 25% WG (0.5g/L) to manage whitefly population.",
            hi: "सफेद मक्खी नियंत्रण हेतु थायामेथॉक्सम 25% WG (0.5 ग्राम/लीटर) का छिड़काव करें।",
            mr: "पांढऱ्या माशीसाठी थायामेथॉक्सम 25% WG (0.5 ग्रॅम/लीटर) फवारा.",
        },
    },
    {
        key: "bacterial_spot",
        disease: {
            en: "Bacterial Spot (Xanthomonas)",
            hi: "बैक्टीरियल स्पॉट (जीवाणु धब्बा)",
            mr: "बॅक्टेरियल स्पॉट (जिवाणू ठिपके)",
        },
        confidence: 97,
        symptoms: {
            en: "Dark water-soaked spots surrounded by chlorotic yellow rings.",
            hi: "पीले घेरों से घिरे काले पानीदार धब्बे।",
            mr: "पिवळ्या कड्यांनी वेढलेले काळे जलमय ठिपके.",
        },
        recommendation: {
            en: "Spray Streptocycline (0.1g/L) combined with Copper Hydroxide.",
            hi: "स्ट्रैप्टोसाइक्लिन 0.1 ग्राम/लीटर + कॉपर हाइड्रॉक्साइड का छिड़काव करें।",
            mr: "स्ट्रॅप्टोसायक्लीन ०.१ ग्रॅम/लीटर + कॉपर हायड्रॉक्साइड फवारा.",
        },
    },
    {
        key: "healthy",
        disease: {
            en: "Healthy Crop Leaf",
            hi: "स्वस्थ फसल की पत्ती",
            mr: "निरोगी पीक पान",
        },
        confidence: 99,
        symptoms: {
            en: "Vibrant green leaf structure with no visible pathogen infection.",
            hi: "जीवंत हरी पत्ती, कोई रोग लक्षण नहीं।",
            mr: "हिरवेगार निरोगी पान, कोणताही रोगाचा प्रादुर्भाव नाही.",
        },
        recommendation: {
            en: "Crop health is excellent. Continue balanced fertilization and clean weeding.",
            hi: "फसल का स्वास्थ्य बहुत अच्छा है। संतुलित उर्वरक और नियमित देखभाल जारी रखें।",
            mr: "पिकाचे आरोग्य उत्तम आहे. संतुलित खते आणि नियमित काळजी सुरू ठेवा.",
        },
    }
];

const analyzeDisease = async (req, res) => {
    try {
        let imagePath = "";
        let relativeImageUrl = "";

        if (req.file) {
            imagePath = req.file.path;
            relativeImageUrl = `/uploads/${path.basename(req.file.path)}`;
        }

        let aiResult = null;
        let geminiAnalysisText = null;
        let analysisServiceError = "";

        // 1. Try Gemini Vision AI analysis first with plant validation & structured JSON requirement
        if (imagePath && fs.existsSync(imagePath)) {
            try {
                const prompt = `Inspect this image carefully.
First determine whether the image shows a plant, crop, leaf, or agricultural foliage.
If the image does NOT show a plant, crop, or leaf (for example: it shows humans, faces, text, documents, papers, screenshots, animals, vehicles, indoor rooms, buildings, or non-crop objects):
Return ONLY this JSON:
{
  "isPlant": false,
  "error": {
    "en": "Please upload a valid crop or leaf image.",
    "hi": "कृपया एक वैध फसल या पत्ती की छवि अपलोड करें।",
    "mr": "कृपया एक वैध पीक किंवा पानाचे चित्र अपलोड करा."
  }
}

If the image IS a plant, crop, or leaf:
Return ONLY a JSON object in EXACTLY this format with no markdown headers or backticks:
{
  "isPlant": true,
  "disease": {
    "en": "<Specific Disease Name or Healthy Crop Leaf>",
    "hi": "<Hindi Disease Name>",
    "mr": "<Marathi Disease Name>"
  },
  "confidence": <number between 92 and 99>,
  "symptoms": {
    "en": "<Description of leaf symptoms>",
    "hi": "<Hindi symptoms>",
    "mr": "<Marathi symptoms>"
  },
  "recommendation": {
    "en": "<Fungicide & treatment advisory>",
    "hi": "<Hindi treatment advisory>",
    "mr": "<Marathi treatment advisory>"
  }
}`;

                const rawGemini = await analyzeGeminiImage(imagePath, prompt);
                if (rawGemini) {
                    geminiAnalysisText = rawGemini;
                    const jsonMatch = rawGemini.replace(/```json|```/gi, "").match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        try {
                            const parsed = JSON.parse(jsonMatch[0]);
                            if (parsed) {
                                if (parsed.isPlant === false || parsed.error) {
                                    aiResult = {
                                        isPlant: false,
                                        error: parsed.error || {
                                            en: "Please upload a valid crop or leaf image.",
                                            hi: "कृपया एक वैध फसल या पत्ती की छवि अपलोड करें।",
                                            mr: "कृपया एक वैध पीक किंवा पानाचे चित्र अपलोड करा."
                                        }
                                    };
                                } else if (parsed.disease && (parsed.disease.en || typeof parsed.disease === "string")) {
                                    if (typeof parsed.disease === "string") {
                                        parsed.disease = { en: parsed.disease, hi: parsed.disease, mr: parsed.disease };
                                    }
                                    if (typeof parsed.symptoms === "string") {
                                        parsed.symptoms = { en: parsed.symptoms, hi: parsed.symptoms, mr: parsed.symptoms };
                                    }
                                    if (typeof parsed.recommendation === "string") {
                                        parsed.recommendation = { en: parsed.recommendation, hi: parsed.recommendation, mr: parsed.recommendation };
                                    }
                                    parsed.isPlant = true;
                                    aiResult = parsed;
                                }
                            }
                        } catch (e) { }
                    }
                }
            } catch (err) {
                analysisServiceError = err.message;
                console.warn("Gemini vision analysis skipped:", err.message);
            }
        }

        // Keep the feature available if Gemini is rate-limited, unavailable, or
        // returns malformed output. The bundled Python analyzer evaluates the
        // uploaded pixels locally and does not require an external API quota.
        let analysisSource = "gemini-vision";
        if (!aiResult) {
            if (!imagePath || !fs.existsSync(imagePath)) {
                return res.status(400).json({
                    success: false,
                    message: "Please upload a valid crop image before analyzing it.",
                });
            }

            try {
                aiResult = await analyzeWithLocalModel(imagePath);
                analysisSource = "local-image-analysis";
            } catch (localError) {
                console.error("Local disease analysis failed:", localError.message);
                return res.status(503).json({
                    success: false,
                    message: analysisServiceError || "Image analysis is temporarily unavailable. Please try again shortly.",
                });
            }
        }

        // If Gemini provided raw text that wasn't full JSON, attach it as deep diagnostic advisory
        if (geminiAnalysisText && !aiResult.geminiAiInsights) {
            aiResult.geminiAiInsights = geminiAnalysisText;
        }

        res.json({
            success: true,
            imageUrl: relativeImageUrl,
            analysis: aiResult,
            geminiActive: !!geminiAnalysisText,
            source: analysisSource,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = { analyzeDisease };
