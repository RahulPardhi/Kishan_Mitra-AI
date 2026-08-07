// Apply User-Specific Dark Mode on Page Load
if (window.KisanAPI) {
    window.KisanAPI.applyTheme();
}

// ===================================
// Kisan Mitra AI - Soil Analyzer
// ===================================

const analyzeBtn = document.getElementById("analyzeSoil");
const resultCard = document.getElementById("soilResult");

const soilType = document.getElementById("soilType");
const locationInput = document.getElementById("location");
const nitrogen = document.getElementById("nitrogen");
const phosphorus = document.getElementById("phosphorus");
const potassium = document.getElementById("potassium");
const phValue = document.getElementById("phValue");

// Pre-fill location if user saved it
if (locationInput && localStorage.getItem("profileLocation")) {
    locationInput.value = localStorage.getItem("profileLocation");
}

// Hide result initially
if (resultCard) resultCard.style.display = "none";

// All-India State & Region Benchmark Map
const BENCHMARK_MAP = [
    // Maharashtra
    { loc: "nagpur", type: "black", health: "Fertile Soil", crop: "Cotton, Soybean, Wheat", fert: "Organic Manure + NPK 20:10:10", adv: "Add organic manure and maintain irrigation." },
    { loc: "nashik", type: "loamy", health: "Excellent Soil", crop: "Grapes, Onion, Tomato, Vegetables", fert: "Balanced NPK 20:20:20 + Micronutrients", adv: "Continue balanced fertilization." },
    { loc: "pune", type: "red", health: "Medium Fertility", crop: "Groundnut, Millets, Pulses", fert: "Compost + Single Super Phosphate (SSP) / DAP", adv: "Add compost and phosphorus fertilizer." },
    { loc: "kolhapur", type: "alluvial", health: "Highly Productive", crop: "Sugarcane, Rice, Wheat", fert: "Balanced NPK (12:32:16) + Vermicompost", adv: "Maintain balanced NPK." },
    { loc: "aurangabad", type: "sandy", health: "Low Water Retention", crop: "Groundnut, Watermelon, Pulses", fert: "Organic Compost + NPK 15:15:15", adv: "Irrigate frequently and add organic matter." },
    { loc: "solapur", type: "clay", health: "Good Moisture Retention", crop: "Rice, Cotton, Sorghum", fert: "Potash-enriched NPK (10:10:20)", adv: "Avoid overwatering." },
    { loc: "chandrapur", type: "red", health: "Slightly Acidic", crop: "Pulses and Millets", fert: "Agricultural Lime (if needed) + SSP", adv: "Apply lime if needed." },
    { loc: "latur", type: "laterite", health: "Low Fertility", crop: "Cashew, Tea, Coffee", fert: "Organic Compost + Lime", adv: "Add compost and lime to improve soil health." },
    { loc: "jalgaon", type: "black", health: "Fertile Soil", crop: "Banana, Cotton, Sorghum", fert: "Organic Manure + Balanced NPK 20:10:10", adv: "Maintain balanced nutrients." },
    { loc: "amravati", type: "black", health: "Good Soil Quality", crop: "Cotton, Soybean, Wheat", fert: "Organic Manure + NPK 20:10:10", adv: "Use organic manure and proper irrigation." },
    
    // States across India
    { loc: "punjab", type: "alluvial", health: "Highly Fertile Alluvial Soil", crop: "Wheat, Paddy/Rice, Mustard, Sugarcane", fert: "NPK 20:10:10 + Urea + Zinc", adv: "High yield potential. Use split nitrogen dosing." },
    { loc: "haryana", type: "alluvial", health: "Highly Fertile Alluvial Soil", crop: "Wheat, Rice, Cotton, Mustard", fert: "NPK 20:10:10 + Zinc Sulfate", adv: "Deep fertile soil. Ensure zinc & organic matter." },
    { loc: "uttar pradesh", type: "alluvial", health: "Deep Rich Alluvial Soil", crop: "Sugarcane, Wheat, Paddy, Potato", fert: "NPK 12:32:16 + Vermicompost", adv: "Highly productive. Ideal for Sugarcane & Wheat." },
    { loc: "bihar", type: "alluvial", health: "Rich Alluvial Soil", crop: "Paddy/Rice, Wheat, Maize, Potato", fert: "DAP + Urea + Organic Compost", adv: "High moisture fertile soil. Maintain balanced NPK." },
    { loc: "west bengal", type: "alluvial", health: "High Moisture Alluvial Soil", crop: "Paddy/Rice, Jute, Potato, Vegetables", fert: "NPK 10:20:20 + Vermicompost", adv: "High rainfall region. Ensure proper field drainage." },
    { loc: "gujarat", type: "black", health: "Black Cotton & Sandy Loam", crop: "Cotton, Groundnut, Castor, Cumin", fert: "NPK 20:10:10 + Gypsum + FYM", adv: "Excellent for cash crops. Use drip irrigation." },
    { loc: "rajasthan", type: "sandy", health: "Low Water Retention Arid Soil", crop: "Bajra, Mustard, Guar, Cumin, Pulses", fert: "Organic Compost + NPK 15:15:15", adv: "Arid soil. Use drip/sprinkler & heavy organic mulching." },
    { loc: "madhya pradesh", type: "black", health: "Deep Black Mineral Soil", crop: "Soybean, Wheat, Gram, Garlic", fert: "Single Super Phosphate (SSP) + NPK", adv: "Soybean & Pulse bowl. Apply adequate sulfur & zinc." },
    { loc: "andhra pradesh", type: "red", health: "Productive Mineral Soil", crop: "Paddy/Rice, Cotton, Chilli, Tobacco", fert: "NPK 20:20:0 + MOP + Neem Cake", adv: "High fertilizer response. Apply zinc & boron." },
    { loc: "telangana", type: "red", health: "Productive Red & Black Soil", crop: "Cotton, Paddy, Maize, Chilli", fert: "NPK 20:20:0 + Organic FYM", adv: "Responsive soil. Balance NPK with organic manure." },
    { loc: "karnataka", type: "red", health: "Well-Drained Loamy Soil", crop: "Ragi, Coffee, Arecanut, Sugarcane", fert: "Organic Vermicompost + NPK 15:15:15", adv: "Ideal for millets and plantation crops. Add compost." },
    { loc: "tamil nadu", type: "red", health: "Responsive Sandy Loam Soil", crop: "Paddy/Rice, Sugarcane, Groundnut, Coconut", fert: "NPK 20:10:10 + Azospirillum", adv: "Suitable for multi-crop Rice. Use drip fertigation." },
    { loc: "kerala", type: "laterite", health: "Acidic Laterite Plantation Soil", crop: "Coconut, Rubber, Spices, Tea, Coffee", fert: "Agricultural Lime / Dolomite + Organic Manure", adv: "Acidic soil. Apply lime/dolomite annually to adjust pH." },
    { loc: "himachal pradesh", type: "forest", health: "Organic-Rich Hill Soil", crop: "Apple, Potato, Maize, Vegetables", fert: "Farmyard Manure + NPK 15:15:15", adv: "Ideal for fruits. Practice contour farming & mulching." },
    { loc: "jammu & kashmir", type: "forest", health: "Organic Hill Soil", crop: "Apple, Saffron, Walnut, Paddy", fert: "FYM + NPK + Calcium Nitrate", adv: "High organic matter. Ideal for temperate fruits." },
    { loc: "uttarakhand", type: "hill", health: "Hill Loamy Soil", crop: "Rice, Maize, Potato, Pulses, Apple", fert: "Vermicompost + NPK 15:15:15", adv: "Hill soil. Maintain organic carbon and terrace steps." },
    { loc: "odisha", type: "alluvial", health: "Medium Fertility Soil", crop: "Paddy/Rice, Pulses, Oilseeds, Maize", fert: "DAP + Urea + Zinc Sulfate", adv: "Major rice belt. Split nitrogen dosing across stages." },
    { loc: "assam", type: "alluvial", health: "High Moisture Acidic Soil", crop: "Tea, Paddy/Rice, Jute, Pulses", fert: "NPK 10:20:20 + Rock Phosphate", adv: "High rainfall zone. Ensure proper field drainage." }
];

function getLocalBenchmark(locStr, typeStr, phNum) {
    const l = (locStr || "").toLowerCase();
    const t = (typeStr || "").toLowerCase();

    for (const b of BENCHMARK_MAP) {
        if (l.includes(b.loc) && t.includes(b.type)) return b;
    }
    for (const b of BENCHMARK_MAP) {
        if (l.includes(b.loc)) return b;
    }
    for (const b of BENCHMARK_MAP) {
        if (t.includes(b.type)) return b;
    }
    if (phNum < 6.0) return { health: "Acidic Soil (low pH)", crop: "Rice, Tea, Potato, Pulses", fert: "Lime + Organic Compost", adv: "Apply agricultural lime @ 200kg/acre." };
    if (phNum > 7.5) return { health: "Alkaline Soil (high pH)", crop: "Cotton, Mustard, Barley", fert: "Gypsum + Organic Compost", adv: "Apply Gypsum @ 400kg/acre and irrigate." };
    return { health: "Fertile Soil", crop: "Cotton, Soybean, Wheat", fert: "Organic Manure + Balanced NPK", adv: "Maintain balanced nutrients and organic matter." };
}

// Analyze Button Event
if (analyzeBtn) {
    analyzeBtn.addEventListener("click", async () => {
        if (
            soilType.selectedIndex === 0 ||
            locationInput.value.trim() === "" ||
            nitrogen.value === "" ||
            phosphorus.value === "" ||
            potassium.value === "" ||
            phValue.value === ""
        ) {
            alert("Please fill all soil parameters before running AI analysis.");
            return;
        }

        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML = "⏳ Analyzing Soil with AI...";

        const lang = localStorage.getItem("language") || "en";
        const locVal = locationInput.value.trim();
        const typeVal = soilType.value;
        const phNum = parseFloat(phValue.value);

        try {
            if (window.KisanAPI) {
                const payload = {
                    soilType: typeVal,
                    location: locVal,
                    nitrogen: nitrogen.value,
                    phosphorus: phosphorus.value,
                    potassium: potassium.value,
                    phValue: phValue.value,
                };

                const res = await window.KisanAPI.request("/soil/analyze", {
                    method: "POST",
                    body: JSON.stringify(payload),
                });

                if (res && res.success && res.report) {
                    const r = res.report;
                    const health = r.health[lang] || r.health.en;
                    const crop = r.recommendedCrop[lang] || r.recommendedCrop.en;
                    const fert = r.suggestedFertilizer[lang] || r.suggestedFertilizer.en;
                    const adv = r.advice[lang] || r.advice.en;

                    let geminiHtml = "";
                    if (r.geminiAdvice) {
                        geminiHtml = `
                            <div style="margin-top:14px; padding:12px; background:rgba(34, 197, 94, 0.12); border-left:4px solid #22c55e; border-radius:8px; font-size:14px; line-height:1.6;">
                                🤖 <strong>Gemini AI Custom Advisory:</strong><br>${r.geminiAdvice.replace(/\n/g, '<br>')}
                            </div>
                        `;
                    }

                    resultCard.innerHTML = `
                        <h3>🌱 Soil Analysis Report</h3>
                        <p><strong>📍 Location:</strong> ${r.location}</p>
                        <p><strong>🌿 Soil Type:</strong> ${r.soilType}</p>
                        <p><strong>💚 Soil Health:</strong> ${health}</p>
                        <p><strong>🌾 Recommended Crop:</strong> ${crop}</p>
                        <p><strong>🧪 Suggested Fertilizer:</strong> ${fert}</p>
                        <p><strong>💧 pH Value:</strong> ${r.phValue}</p>
                        <div style="margin-top:12px; padding:12px; background:rgba(74, 222, 128, 0.1); border-left:4px solid #4ade80; border-radius:8px; font-size:14px;">
                            💡 <strong>Expert Advisory:</strong> ${adv}
                        </div>
                        ${geminiHtml}
                    `;
                    resultCard.style.display = "block";
                    resultCard.scrollIntoView({ behavior: "smooth" });
                    return;
                }
            }
        } catch (err) {
            console.warn("Soil API fetch failed, using benchmark classifier fallback:", err);
        } finally {
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = `<i class="fa-solid fa-flask"></i> Analyze Soil`;
        }

        // Local fallback using benchmark map
        const bm = getLocalBenchmark(locVal, typeVal, phNum);

        resultCard.innerHTML = `
            <h3>🌱 Soil Report</h3>
            <p><strong>📍 Location:</strong> ${locVal}</p>
            <p><strong>🌿 Soil Type:</strong> ${typeVal}</p>
            <p><strong>💚 Health:</strong> ${bm.health}</p>
            <p><strong>🌾 Recommended Crop:</strong> ${bm.crop}</p>
            <p><strong>🧪 Suggested Fertilizer:</strong> ${bm.fert}</p>
            <p><strong>💧 pH:</strong> ${phNum}</p>
            <div style="margin-top:12px; padding:10px; background:rgba(74, 222, 128, 0.1); border-radius:8px; font-size:14px;">
                💡 <strong>Expert Advisory:</strong> ${bm.adv}
            </div>
        `;
        resultCard.style.display = "block";
        resultCard.scrollIntoView({ behavior: "smooth" });
    });
}