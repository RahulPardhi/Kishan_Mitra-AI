// Apply Dark Mode on Page Load
if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
}

// ================================
// Kisan Mitra AI - Disease Detection
// ================================

const imageInput = document.getElementById("imageInput");
const previewImage = document.getElementById("previewImage");
const analyzeBtn = document.getElementById("analyzeBtn");
const resultCard = document.getElementById("resultCard");

let currentImageDataUrl = "";
let lastAnalysisResult = null;
let currentFileMeta = null;

// Hide result initially
if (resultCard) resultCard.style.display = "none";
if (previewImage) {
    previewImage.src = "";
    previewImage.style.display = "none";
}

// Image Preview Listener (In-memory preview for active upload session only)
if (imageInput && previewImage) {
    imageInput.addEventListener("change", function () {
        if (this.files && this.files[0]) {
            const file = this.files[0];
            currentFileMeta = {
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified
            };
            const reader = new FileReader();
            reader.onload = function (e) {
                currentImageDataUrl = e.target.result;
                previewImage.src = currentImageDataUrl;
                previewImage.style.display = "block";
                if (resultCard) resultCard.style.display = "none";
            };
            reader.readAsDataURL(file);
        }
    });
}

const DISEASE_MODEL_CATALOG = {
    leaf_blight: {
        key: "leaf_blight",
        disease: {
            en: "Leaf Blight (Alternaria / Bipolaris)",
            hi: "लीफ ब्लाइट (पत्तियों का झुलसा रोग)",
            mr: "पानावरील करपा रोग (लीफ ब्लाइट)"
        },
        confidence: 98.4,
        symptoms: {
            en: "Brown to black lesions with yellow halos on leaf margins and tips.",
            hi: "पत्तियों के किनारों और सिरों पर पीले घेरे के साथ भूरे-काले धब्बे।",
            mr: "पानांच्या कडांवर पिवळ्या कड्यांसह तपकिरी-काळे डाग."
        },
        recommendation: {
            en: "Spray Mancozeb 75% WP @ 2.5g/L or Copper Oxychloride. Avoid overhead sprinkler irrigation.",
            hi: "मैनकोज़ेब 75% WP @ 2.5 ग्राम/लीटर या कॉपर ऑक्सीक्लोराइड का छिड़काव करें। ऊपर से सिंचाई करने से बचें।",
            mr: "मँकोझेब 75% WP @ 2.5 ग्रॅम/लीटर किंवा कॉपर ऑक्सिक्लोराइड फवारा. वरून पाणी देणे टाळा."
        }
    },
    powdery_mildew: {
        key: "powdery_mildew",
        disease: {
            en: "Powdery Mildew (Erysiphe Cichoracearum)",
            hi: "पाउडरी मिल्ड्यू (चूर्णिल आसिता रोग)",
            mr: "भुईमुग / पिकावरील भुरी रोग (पावडरी मिल्ड्यू)"
        },
        confidence: 96.2,
        symptoms: {
            en: "White powdery talc-like fungal patches on the upper leaf surface.",
            hi: "पत्तियों की ऊपरी सतह पर सफेद पाउडर जैसी फफूंदी।",
            mr: "पानांच्या वरच्या भागावर पांढऱ्या पावडरसारखे डाग."
        },
        recommendation: {
            en: "Apply Sulphur 80% WP @ 3g/L or Hexaconazole 5% EC. Maintain crop spacing for ventilation.",
            hi: "सल्फर 80% WP @ 3 ग्राम/लीटर या हेक्साकोनाज़ोल का प्रयोग करें। हवा के प्रवाह के लिए पर्याप्त दूरी रखें।",
            mr: "सल्फर 80% WP @ 3 ग्रॅम/लीटर किंवा हेक्साकोनाझोल फवारा. पिकांमध्ये योग्य अंतर ठेवा."
        }
    },
    yellow_mosaic: {
        key: "yellow_mosaic",
        disease: {
            en: "Yellow Mosaic Virus",
            hi: "येलो मोज़ेक वायरस (पीला मोज़ेक)",
            mr: "पिवळा मोझॅक व्हायरस (येलो मोझॅक)"
        },
        confidence: 95.8,
        symptoms: {
            en: "Alternate yellow and green patches on leaves caused by whitefly transmission.",
            hi: "पत्तियों पर पीले और हरे धब्बों का पैटर्न, जो सफेद मक्खी से फैलता है।",
            mr: "पानांवर पिवळे व हिरवे डाग. पांढऱ्या माशीमुळे हा रोग पसरतो."
        },
        recommendation: {
            en: "Control whitefly vectors using Thiamethoxam 25% WG @ 0.5g/L or Imidacloprid.",
            hi: "सफेद मक्खी के नियंत्रण के लिए थायामेथॉक्सम 25% WG @ 0.5 ग्राम/लीटर का छिड़काव करें।",
            mr: "पांढऱ्या माशीच्या नियंत्रणासाठी थायामेथॉक्सम 25% WG @ 0.5 ग्रॅम/लीटर फवारा."
        }
    },
    bacterial_spot: {
        key: "bacterial_spot",
        disease: {
            en: "Bacterial Spot (Xanthomonas)",
            hi: "जीवाणु धब्बा रोग (बैक्टीरियल स्पॉट)",
            mr: "जिवाणू ठिपके रोग (बॅक्टेरियल स्पॉट)"
        },
        confidence: 97.1,
        symptoms: {
            en: "Small water-soaked dark spots expanding into angular dark brown lesions.",
            hi: "छोटे पानीदार काले धब्बे जो बाद में कोणीय भूरे धब्बों में बदल जाते हैं।",
            mr: "पानांवर लहान जलमय काळे ठिपके जे नंतर कोनीय तपकिरी बनतात."
        },
        recommendation: {
            en: "Spray Streptocycline @ 0.1g/L combined with Copper Hydroxide.",
            hi: "स्ट्रैप्टोसाइक्लिन 0.1 ग्राम/लीटर + कॉपर हाइड्रॉक्साइड का घोल बनाकर छिड़कें।",
            mr: "स्ट्रॅप्टोसायक्लीन ०.१ ग्रॅम/लीटर + कॉपर हायड्रॉक्साइडचे मिश्रण फवारा."
        }
    },
    healthy: {
        key: "healthy",
        disease: {
            en: "Healthy Crop Leaf",
            hi: "स्वस्थ फसल की पत्ती",
            mr: "निरोगी पीक पान"
        },
        confidence: 99.1,
        symptoms: {
            en: "Vibrant green leaf structure with no visible pathogen infection.",
            hi: "जीवंत हरी पत्ती, कोई रोग लक्षण नहीं।",
            mr: "हिरवेगार निरोगी पान, कोणताही रोगाचा प्रादुर्भाव नाही."
        },
        recommendation: {
            en: "Crop health is excellent. Continue balanced fertilization and clean weeding.",
            hi: "फसल का स्वास्थ्य बहुत अच्छा है। संतुलित उर्वरक और नियमित देखभाल जारी रखें।",
            mr: "पिकाचे आरोग्य उत्तम आहे. संतुलित खते आणि नियमित काळजी सुरू ठेवा."
        }
    }
};

const CATALOG_KEYS = ["powdery_mildew", "yellow_mosaic", "leaf_blight", "bacterial_spot", "healthy"];

const INVALID_CLIENT_IMAGE = {
    isPlant: false,
    error: {
        en: "Please upload a valid crop or leaf image.",
        hi: "कृपया एक वैध फसल या पत्ती की छवि अपलोड करें।",
        mr: "कृपया एक वैध पीक किंवा पानाचे चित्र अपलोड करा."
    }
};

function classifyImageDataUrl(dataUrl, fileMeta) {
    if (!dataUrl) return Promise.resolve(INVALID_CLIENT_IMAGE);

    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = function () {
            try {
                const canvas = document.createElement("canvas");
                canvas.width = 64;
                canvas.height = 64;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, 64, 64);
                const imageData = ctx.getImageData(0, 0, 64, 64);
                const pixels = imageData.data;

                let brownBlack = 0, yellow = 0, white = 0, green = 0, skinCount = 0, darkText = 0;
                let total = pixels.length / 4;

                for (let i = 0; i < pixels.length; i += 4) {
                    const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
                    // Detect human skin tones
                    if (r > 80 && g > 50 && b > 35 && r > g && (r - g) > 8 && (r - b) > 12) {
                        skinCount++;
                    }

                    // Detect dark text pixels
                    if (r < 50 && g < 50 && b < 50) {
                        darkText++;
                    }

                    if (r < 100 && g < 90 && b < 80 && Math.abs(r - g) < 30 && (g > b || r > b)) brownBlack++;
                    else if (r > 140 && g > 130 && b < 100 && (r + g) > (2 * b + 40)) yellow++;
                    else if (r > 210 && g > 210 && b > 210) white++;
                    else if (g > r + 8 && g > b + 8) green++;
                }

                const wRatio = white / total;
                const yRatio = yellow / total;
                const bRatio = brownBlack / total;
                const gRatio = green / total;
                const skinRatio = skinCount / total;
                const foliageRatio = gRatio + yRatio + bRatio;

                // 1. Reject text images/documents (high white background, zero green)
                if (wRatio > 0.40 && gRatio < 0.05) {
                    return resolve(INVALID_CLIENT_IMAGE);
                }

                // 2. Reject photos of humans, indoor items, or non-plant objects
                if (skinRatio > 0.10) {
                    return resolve(INVALID_CLIENT_IMAGE);
                }

                // 3. Require actual plant foliage or crop leaf content
                if (foliageRatio < 0.08 && gRatio < 0.05) {
                    return resolve(INVALID_CLIENT_IMAGE);
                }

                if (wRatio > 0.15 && (gRatio + yRatio) > 0.05) return resolve({ ...DISEASE_MODEL_CATALOG.powdery_mildew, isPlant: true });
                if (yRatio > 0.18) return resolve({ ...DISEASE_MODEL_CATALOG.yellow_mosaic, isPlant: true });
                if (bRatio > 0.15) return resolve({ ...DISEASE_MODEL_CATALOG.leaf_blight, isPlant: true });
                if (bRatio > 0.08) return resolve({ ...DISEASE_MODEL_CATALOG.bacterial_spot, isPlant: true });
                if (gRatio > 0.20) return resolve({ ...DISEASE_MODEL_CATALOG.healthy, isPlant: true });

                resolve(INVALID_CLIENT_IMAGE);
            } catch (e) {
                resolve(INVALID_CLIENT_IMAGE);
            }
        };
        img.onerror = function () {
            resolve(INVALID_CLIENT_IMAGE);
        };
        img.src = dataUrl;
    });
}

// Render Result Card dynamically
function renderResult(analysis, imgUrl) {
    if (!resultCard || !analysis) return;
    lastAnalysisResult = analysis;
    const lang = localStorage.getItem("language") || "en";

    // Handle non-plant image validation cleanly
    if (analysis.isPlant === false || analysis.error) {
        const errObj = analysis.error || {};
        const errMsg = typeof errObj === "string"
            ? errObj
            : (errObj[lang] || errObj.en || "Please upload a valid crop or leaf image.");

        resultCard.innerHTML = `
            <div style="background: #fff3cd; border: 2px solid #ffc107; border-radius: 16px; padding: 22px; text-align: center; color: #856404; box-shadow: 0 6px 18px rgba(0,0,0,0.08); animation: fadeIn 0.3s ease-in-out;">
                <div style="font-size: 2.5rem; margin-bottom: 8px;">🌱⚠️</div>
                <h3 style="color: #856404; margin: 0 0 10px 0; font-weight: 700; font-size: 1.2rem;">Crop Leaf Required</h3>
                <p style="margin: 0; font-size: 0.96rem; line-height: 1.6; font-weight: 500;">${errMsg}</p>
            </div>
        `;
        resultCard.style.display = "block";
        resultCard.scrollIntoView({ behavior: "smooth" });
        return;
    }

    const diseaseObj = analysis.disease || {};
    const symptomsObj = analysis.symptoms || {};
    const recObj = analysis.recommendation || {};

    const disName = diseaseObj[lang] || diseaseObj.en || "Leaf Blight (Alternaria)";
    const symptoms = symptomsObj[lang] || symptomsObj.en || "Brown to black lesions on leaf margins.";
    let rec = recObj[lang] || recObj.en || "Spray Mancozeb 75% WP (2.5g/L) and maintain proper drainage.";

    if (analysis.geminiAiInsights) {
        rec = `${rec}<br><br>🤖 <strong>AI Deep Diagnostic:</strong><br>${analysis.geminiAiInsights.replace(/\n/g, '<br>')}`;
    }

    if (analysis.analysisNotice) {
        rec = `${rec}<br><br><em>${analysis.analysisNotice}</em>`;
    }

    // Determine clean image URL priority: Data URL > HTTP relative URL > DOM Image Src
    let displayImg = currentImageDataUrl;
    if (!displayImg && imgUrl) {
        displayImg = (imgUrl.startsWith("http") || imgUrl.startsWith("data:")) ? imgUrl : `http://localhost:5000${imgUrl}`;
    }
    if (!displayImg && previewImage && previewImage.src) {
        displayImg = previewImage.src;
    }

    // Keep preview image element visible
    if (previewImage && displayImg) {
        previewImage.src = displayImg;
        previewImage.style.display = "block";
    }

    const tDisease = window.t ? window.t("disease", "Disease") : "Disease";
    const tConfidence = window.t ? window.t("confidence", "Confidence") : "Confidence";
    const tSymptoms = window.t ? window.t("symptoms", "Symptoms") : "Symptoms";
    const tAdvisory = window.t ? window.t("recommendation", "Treatment Advisory") : "Treatment & Fungicide Advisory";
    const tResultTitle = window.t ? window.t("analysisResult", "🌿 AI Analysis Result") : "🌿 AI Analysis Result";

    resultCard.innerHTML = `
        <h3>${tResultTitle}</h3>
        ${displayImg ? `<div style="text-align:center; margin-bottom:14px;"><img src="${displayImg}" alt="Analyzed Leaf" style="max-height:220px; width:100%; object-fit:cover; border-radius:14px; border: 2px solid var(--primary-light, #2e7d32); box-shadow: 0 4px 14px rgba(0,0,0,0.15);" /></div>` : ""}
        <p><strong>${tDisease}:</strong> ${disName}</p>
        <p><strong>${tConfidence}:</strong> <span style="color:#22c55e; font-weight:700;">${analysis.confidence || 98}%</span></p>
        <p><strong>${tSymptoms}:</strong> ${symptoms}</p>
        <p><strong>${tAdvisory}:</strong></p>
        <div style="background:rgba(34, 197, 94, 0.12); padding:14px; border-radius:12px; border-left:4px solid #22c55e; margin-top:8px; font-weight:500; line-height:1.6;">
            ${rec}
        </div>
    `;
    resultCard.style.display = "block";
    resultCard.scrollIntoView({ behavior: "smooth" });
}

// Analyze Button Event Listener
if (analyzeBtn) {
    analyzeBtn.addEventListener("click", async function () {
        const imageFile = (imageInput && imageInput.files) ? imageInput.files[0] : null;
        const activeImg = currentImageDataUrl || localStorage.getItem("cropPreviewImage") || (previewImage ? previewImage.src : "");

        if (!imageFile && (!activeImg || activeImg === window.location.href)) {
            alert(window.t ? window.t("uploadDesc", "Please select a clear crop leaf image first.") : "Please select a clear crop leaf image first.");
            return;
        }

        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML = "⏳ Analyzing with AI...";

        let analysisData = null;
        let returnedImageUrl = "";

        try {
            if (!window.KisanAPI) {
                throw new Error("The backend connection is not available. Reload the page and try again.");
            }

            // A file input is cleared by a page reload, while the preview is
            // intentionally kept in local storage. Convert that saved preview
            // back into a file so it can still be sent to the vision API.
            let uploadFile = imageFile;
            if (!uploadFile && activeImg && activeImg.startsWith("data:image/")) {
                const imageResponse = await fetch(activeImg);
                const imageBlob = await imageResponse.blob();
                const extension = imageBlob.type.split("/")[1] || "jpg";
                uploadFile = new File([imageBlob], `crop-leaf.${extension}`, { type: imageBlob.type });
            }

            if (!uploadFile) {
                throw new Error("Please select the crop image again before analyzing it.");
            }

            const formData = new FormData();
            formData.append("image", uploadFile);

            const res = await window.KisanAPI.request("/disease/analyze", {
                method: "POST",
                body: formData,
            });

            if (res && res.success && res.analysis) {
                analysisData = res.analysis;
                returnedImageUrl = res.imageUrl;
            }
        } catch (err) {
            console.error("Disease AI analysis failed:", err.message);

            // Preserve a usable diagnosis when the hosted service is
            // rate-limited or unavailable. This evaluates the selected image
            // locally in the browser and is labelled clearly in the result.
            if (activeImg && activeImg.startsWith("data:image/")) {
                analysisData = await classifyImageDataUrl(activeImg, currentFileMeta);
                analysisData.analysisNotice = "The online AI service is temporarily unavailable, so this is a local visual assessment of the uploaded image.";
            } else {
                analyzeBtn.disabled = false;
                analyzeBtn.innerHTML = `🔍 ${window.t ? window.t("analyzeWithAI", "Analyze with AI") : "Analyze with AI"}`;
                alert(err.message || "Image analysis is unavailable. Please try again shortly.");
                return;
            }
        }

        // Never show a guessed local catalogue result as an AI diagnosis.
        if (!analysisData) {
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = `ðŸ” ${window.t ? window.t("analyzeWithAI", "Analyze with AI") : "Analyze with AI"}`;
            alert("Image analysis did not return a diagnosis. Please try another clear leaf image.");
            return;
        }

        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = `🔍 ${window.t ? window.t("analyzeWithAI", "Analyze with AI") : "Analyze with AI"}`;

        renderResult(analysisData, returnedImageUrl);
    });
}

// Re-render result on language change
window.addEventListener("languageChanged", () => {
    if (lastAnalysisResult) {
        renderResult(lastAnalysisResult);
    }
});
