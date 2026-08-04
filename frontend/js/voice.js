// Apply Dark Mode on Page Load
if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
}

console.log("Voice Assistant Loaded 🎤");

// Elements
const micBtn = document.getElementById("micBtn");
const micIcon = document.getElementById("micIcon");
const pulseRing = document.getElementById("pulseRing");
const statusText = document.getElementById("statusText");
const transcriptBox = document.getElementById("transcriptBox");
const voiceLangSelect = document.getElementById("voiceLangSelect");
const stopSpeechBtn = document.getElementById("stopSpeechBtn");

let isListening = false;
let isSpeaking = false;
let recognition = null;

// Sync voice language selector
if (voiceLangSelect) {
    const curLang = localStorage.getItem("language") || "en";
    voiceLangSelect.value = curLang;
    voiceLangSelect.addEventListener("change", (e) => {
        const selected = e.target.value;
        localStorage.setItem("language", selected);
        if (window.applyLanguage) window.applyLanguage(selected);
    });
}

// Initialize Speech Recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
        if (isSpeaking) stopSpeaking();
        isListening = true;
        if (micBtn && micBtn.parentElement) {
            micBtn.parentElement.classList.remove("speaking");
            micBtn.parentElement.classList.add("listening");
        }
        if (statusText) statusText.innerText = window.t ? window.t("listening", "Listening...") : "Listening...";
        if (micIcon) micIcon.className = "fa-solid fa-stop";
    };

    recognition.onresult = (event) => {
        let transcript = event.results[0][0].transcript;
        
        // Phonetic & Misinterpretation Normalization for Speech-to-Text (e.g. NPK values misheard as time values)
        transcript = transcript
            .replace(/\b(n p k|n\.p\.k\.|and p k|in p k|an p k|end p k|en p k|time p k|npk values|npk value|time values|time value|time)\b/gi, "NPK")
            .replace(/\b(fertilizer values|fertiliser values|npk ratio|npk ratios)\b/gi, "NPK");

        processQuery(transcript);
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        stopListening();
        if (statusText) statusText.innerText = window.t ? window.t("tapToSpeak", "Tap microphone to speak") : "Tap microphone to speak";
    };

    recognition.onend = () => {
        stopListening();
    };
} else {
    console.warn("Web Speech API not supported in this browser. Interactive voice prompts active.");
}

if (micBtn) {
    micBtn.addEventListener("click", () => {
        if (isSpeaking) {
            stopSpeaking();
        } else if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    });
}

function startListening() {
    if (isSpeaking) stopSpeaking();

    const currentLang = localStorage.getItem("language") || "en";
    const langCodeMap = {
        en: "en-IN",
        hi: "hi-IN",
        mr: "mr-IN"
    };

    if (recognition) {
        recognition.lang = langCodeMap[currentLang] || "en-IN";
        try {
            recognition.start();
        } catch (e) {
            console.error("Failed to start recognition:", e);
        }
    } else {
        // Simulation for browsers without SpeechRecognition API
        isListening = true;
        if (micBtn && micBtn.parentElement) micBtn.parentElement.classList.add("listening");
        if (statusText) statusText.innerText = window.t ? window.t("listening", "Listening...") : "Listening...";
        if (micIcon) micIcon.className = "fa-solid fa-stop";

        setTimeout(() => {
            stopListening();
            const fallbackQueries = {
                en: "Explain NPK values and recommended fertilizer doses",
                hi: "एनपीके (NPK) खाद की मात्रा और फायदे बताएं",
                mr: "एनपीके (NPK) खतांचे प्रमाण व फायदे सांगा"
            };
            processQuery(fallbackQueries[currentLang] || fallbackQueries.en);
        }, 2500);
    }
}

function stopListening() {
    isListening = false;
    if (micBtn && micBtn.parentElement) micBtn.parentElement.classList.remove("listening");
    if (statusText && !isSpeaking) statusText.innerText = window.t ? window.t("tapToSpeak", "Tap microphone to speak") : "Tap microphone to speak";
    if (micIcon && !isSpeaking) micIcon.className = "fa-solid fa-microphone";
    if (recognition) {
        try {
            recognition.stop();
        } catch (e) { }
    }
}

window.stopSpeaking = function () {
    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
    }
    isSpeaking = false;
    if (micBtn && micBtn.parentElement) {
        micBtn.parentElement.classList.remove("speaking");
        micBtn.parentElement.classList.remove("listening");
    }
    if (micIcon) micIcon.className = "fa-solid fa-microphone";
    if (statusText) statusText.innerText = window.t ? window.t("tapToSpeak", "Tap microphone to speak") : "Tap microphone to speak";
    if (stopSpeechBtn) stopSpeechBtn.style.display = "none";
};

window.triggerVoiceQuery = function (queryText) {
    if (isSpeaking) stopSpeaking();
    if (isListening) stopListening();
    processQuery(queryText);
};

// Process query via Backend API & speak result
async function processQuery(queryText) {
    appendMessage(queryText, "user");

    if (statusText) statusText.innerText = window.t ? window.t("processing", "Processing...") : "Processing...";

    const currentLang = localStorage.getItem("language") || "en";
    let responseText = "";

    try {
        if (window.KisanAPI) {
            const res = await window.KisanAPI.request("/chat/voice", {
                method: "POST",
                body: JSON.stringify({ query: queryText, language: currentLang }),
            });

            if (res && res.success && res.reply) {
                responseText = res.reply;
            }
        }
    } catch (e) {
        console.warn("Voice API fetch error, using detailed fallback engine:", e);
    }

    if (!responseText) {
        responseText = generateVoiceReplyFallback(queryText, currentLang);
    }

    appendMessage(responseText, "ai");
    speakText(responseText);
}

function generateVoiceReplyFallback(query, lang) {
    const rawQuery = query || "";
    const cleanQ = rawQuery.toLowerCase().replace(/[^\w\s\u0900-\u097F]/gi, " ").replace(/\s+/g, " ").trim();
    
    const typoMap = {
        "orgnic": "organic", "organik": "organic", "benifit": "benefit", "benifits": "benefits",
        "irigation": "irrigation", "driping": "drip", "fertiliizer": "fertilizer", "wether": "weather"
    };
    let words = cleanQ.split(" ");
    let q = words.map(w => typoMap[w] || w).join(" ");
    const currentLang = lang || localStorage.getItem("language") || "en";

    if (currentLang === "hi") {
        if (q.includes("npk") || q.includes("खाद") || q.includes("उर्वरक") || q.includes("नाइट्रोजन") || q.includes("फास्फोरस") || q.includes("पोटाश")) {
            return "🧪 **NPK मान एवं उर्वरक मार्गदर्शिका:**\n1. **नाइट्रोजन (N):** पौधों की वानस्पतिक वृद्धि और हरी पत्तियों के विकास के लिए आवश्यक है।\n2. **फास्फोरस (P):** मजबूत जड़ों के विकास और फूलों व बीजों के निर्माण में सहायक है।\n3. **पोटाश (K):** रोगों से लड़ने की क्षमता, सूखा सहनशीलता और अनाज के वजन में सुधार करता है।\n4. **मात्रा:** सामान्य अनाज फसलों के लिए 4:2:1 (N:P:K) का अनुपात उत्तम माना जाता है। मृदा स्वास्थ्य कार्ड के अनुसार ही सही मात्रा डालें।";
        }
        if (q.includes("most water") || q.includes("अधिक पानी") || q.includes("पानी का प्रयोग") || (q.includes("बीज") && q.includes("पानी"))) {
            return "💧 **बीज व फसल जल खपत निर्देशिका:**\n1. **सर्वाधिक पानी मांगने वाली फसलें:** गन्ना (1,500 - 2,500 मिमी), धान/चावल (1,200 - 1,500 मिमी), केला (1,200 - 2,200 मिमी) और कपास (700 - 1,300 मिमी)।\n2. **कम पानी की फसलें:** बाजरा (250-350 मिमी), चना, सरसों और मूंग।\n3. **पानी बचत:** ड्रिप या स्प्रिंकलर सिंचाई अपनाकर 40% से 70% तक पानी बचाएं।";
        }
        if (q.includes("organic") || q.includes("जैविक") || q.includes("ऑर्गेनिक") || q.includes("गोबर") || q.includes("वर्मीकंपोस्ट")) {
            return "🌱 **जैविक खेती मार्गदर्शिका:**\n1. खेत में 2-3 टन प्रति एकड़ वर्मीकंपोस्ट या गोबर खाद डालें।\n2. एज़ोटोबैक्टर व राइज़ोबियम कल्चर का प्रयोग करें।\n3. कीट नियंत्रण हेतु नीम तेल 1500 ppm (5 एमएल/लीटर) का छिड़काव करें।";
        }
        if (q.includes("drip") || q.includes("ड्रिप") || q.includes("टपक") || q.includes("स्प्रिंकलर")) {
            return "💧 **ड्रिप सिंचाई के लाभ:**\n1. 40% से 70% तक पानी की बचत होती है।\n2. फसल उपज में 20% से 30% तक वृद्धि होती है।\n3. विद्राव्य खाद सीधे जड़ों तक पहुँचती है। 55%-80% सरकारी सब्सिडी उपलब्ध है।";
        }
        if (q.includes("झुलसा") || q.includes("blight") || q.includes("रोग") || q.includes("disease") || q.includes("इलाज")) {
            return "🌿 **फसल रोग (Leaf Blight) नियंत्रण:**\n1. मैनकोज़ेब 75% WP (2.5 ग्राम/लीटर) का छिड़काव करें।\n2. कॉपर ऑक्सीक्लोराइड 3 ग्राम/लीटर प्रयोग करें और प्रभावित पत्तियों को हटा दें।";
        }
        if (q.includes("मौसम") || q.includes("weather")) {
            return "☁️ **मौसम सलाह:** किसान मित्र AI के Weather सेक्शन में लाइव तापमान और बारिश का पूर्वानुमान देखें। बारिश से पूर्व कीटनाशक छिड़काव न करें।";
        }
        return `🤖 **किसान मित्र कृषि सलाह ("${rawQuery}"):**\nआपकी जिज्ञासा हेतु: प्रमाणित बीजों का चयन करें, मृदा स्वास्थ्य कार्ड अनुसार NPK उर्वरक डालें, ड्रिप सिंचाई अपनाएं एवं नीम तेल का छिड़काव करें।`;

    } else if (currentLang === "mr") {
        if (q.includes("npk") || q.includes("खत") || q.includes("नत्र") || q.includes("स्फुरद") || q.includes("पोटॅश")) {
            return "🧪 **NPK मूल्य व खत व्यवस्थापन:**\n१. **नत्र (N):** पिकांची शाकीय वाढ व हिरवेगारपणा वाढवते.\n२. **स्फुरद (P):** मुळांची भक्कम वाढ व फुलोऱ्यासाठी आवश्यक.\n३. **पोटॅश (K):** कीड-रोग प्रतिकारशक्ती व दाण्यांचे वजन वाढवते.\n४. **प्रमाण:** सर्वसाधारण पिकांसाठी ४:२:१ (N:P:K) प्रमाण वापरावे. माती चाचणीनुसार खते द्यावीत.";
        }
        if (q.includes("most water") || q.includes("जास्त पाणी") || q.includes("पाण्याचा वापर") || (q.includes("बियाणे") && q.includes("पाणी"))) {
            return "💧 **बियाणे व पीक पाणी वापर मार्गदर्शक:**\n१. **सर्वाधिक पाणी लागणारी पिके:** ऊस (१,५०० - २,५०० मिमी), भात (१,२०० - १,५०० मिमी), केळी व कापूस.\n२. **कमी पाण्याचा वापर होणारी पिके:** बाजरी, हरभरा, मोहरी व मूग.\n३. **पाणी बचत:** ठिबक सिंचनाने ४०% ते ७०% पाण्याची बचत करा.";
        }
        if (q.includes("organic") || q.includes("सेंद्रिय") || q.includes("गांडूळ खत") || q.includes("शेणखत")) {
            return "🌱 **सेंद्रिय शेती मार्गदर्शक:**\n१. गांडूळ खत किंवा कुजलेले शेणखत २-३ टन/एकरी वापरा.\n२. अॅझोटोबॅक्टर व रायझोबियमचा वापर करा.\n३. कीड नियंत्रणासाठी निंबोळी अर्क १५०० ppm फवारा.";
        }
        if (q.includes("drip") || q.includes("ड्रिप") || q.includes("ठिबक") || q.includes("तुषार")) {
            return "💧 **ठिबक सिंचनाचे फायदे:**\n१. ४०% ते ७०% पाण्याची बचत.\n२. २०% ते ३०% जास्त उत्पादन व ५०% खतांची बचत.\n३. ५५% ते ८०% शासकीय सबसिडी.";
        }
        if (q.includes("करपा") || q.includes("blight") || q.includes("रोग") || q.includes("disease")) {
            return "🌿 **करपा रोग उपाय:**\n१. मँकोझेब ७५% WP (२.५ ग्रॅम/लीटर) फवारा.\n२. बाधित पाने नष्ट करा आणि शेतातील साचलेले पाणी काढून टाका.";
        }
        if (q.includes("हवामान") || q.includes("weather")) {
            return "☁️ **हवामान अंदाज:** आजच्या थेट अंदाजासाठी अॅपमधील Weather विभाग पहा. पावसाची शक्यता असल्यास कीटकनाशक फवारणी पुढे ढकला.";
        }
        return `🤖 **किसान मित्र शेती सल्ला ("${rawQuery}"):**\nतुमच्या प्रश्नासाठी: प्रमाणित बियाणे वापरा, ठिबक सिंचन पद्धत अपनावा व माती चाचणीनुसार NPK खते द्या.`;

    } else {
        // English Detailed Responses
        if (q.includes("npk") || q.includes("fertilizer") || q.includes("fertiliser") || q.includes("nitrogen") || q.includes("phosphorus") || q.includes("potassium") || q.includes("values") || q.includes("value")) {
            return "🧪 **NPK Values & Fertilizer Advisory:**\n1. **Nitrogen (N):** Drives vegetative shoot growth, stem strength, and green foliage development.\n2. **Phosphorus (P):** Stimulates early root establishment, flower formation, and seed development.\n3. **Potassium (K):** Enhances disease resistance, drought tolerance, grain weight, and overall crop quality.\n4. **Recommended Ratio:** Standard cereal crops thrive on a **4:2:1 (N:P:K)** ratio. Always base precise fertilizer doses on Soil Health Card tests.";
        }
        if (q.includes("most water") || q.includes("high water") || q.includes("water use") || q.includes("water usage") || q.includes("water consumption") || q.includes("water requirement") || (q.includes("seed") && q.includes("water"))) {
            return "💧 **Seed & Crop Water Consumption Guide:**\n1. **Crops/Seeds Requiring Highest Water:**\n   - **Sugarcane:** 1,500 – 2,500 mm (Highest water consumer per crop cycle).\n   - **Paddy / Rice:** 1,200 – 1,500 mm (Requires continuous standing water).\n   - **Banana:** 1,200 – 2,200 mm.\n   - **Cotton:** 700 – 1,300 mm.\n2. **Moderate Water Crops:** Wheat (450–650 mm), Maize (500–800 mm), and Potato.\n3. **Low Water Crops:** Bajra (250–350 mm), Chickpea (250–350 mm), and Mustard.\n4. **Water Saving Tip:** Use Drip or Sprinkler systems to cut water consumption by up to 50%.";
        }
        if (q.includes("organic") || q.includes("compost") || q.includes("vermicompost") || q.includes("cow dung") || q.includes("neem")) {
            return "🌱 **Organic Farming Guide:**\n1. **Soil Health:** Apply Vermicompost or decomposed FYM @ 2-3 tonnes/acre.\n2. **Bio-fertilizers:** Inoculate seeds with Azotobacter, Rhizobium, and PSB cultures.\n3. **Pest Control:** Spray Neem Oil (1500 ppm @ 5ml/L) and install yellow sticky traps.";
        }
        if (q.includes("drip") || q.includes("sprinkler") || q.includes("fertigation") || q.includes("irrigation")) {
            return "💧 **Key Benefits of Drip Irrigation:**\n1. **Water Savings:** Saves 40% to 70% water compared to flood irrigation.\n2. **Yield Increase:** Boosts crop yields by 20% to 30% due to uniform root zone moisture.\n3. **Fertigation:** Soluble fertilizers are applied directly to roots, reducing waste by 50%.\n4. **Subsidy:** 55% to 80% government subsidy available under PMKSY.";
        }
        if (q.includes("blight") || q.includes("disease") || q.includes("cure") || q.includes("treatment") || q.includes("fungicide") || q.includes("spray")) {
            return "🌿 **Crop Disease & Leaf Blight Management:**\n1. **Fungicide Spray:** Apply Mancozeb 75% WP @ 2.5g/L water or Copper Oxychloride @ 3g/L for immediate leaf spot/blight control.\n2. **Cultural Care:** Remove infected foliage and ensure good drainage to prevent fungal spread.";
        }
        if (q.includes("weather") || q.includes("rain") || q.includes("forecast") || q.includes("temperature")) {
            return "☁️ **Weather Advisory:** Check the live Weather tab in Kisan Mitra AI. Avoid applying sprays or top-dress fertilizers right before heavy rains.";
        }
        return `🤖 **Kisan Mitra Farming Advisory for "${rawQuery}":**\nFor optimal agricultural outcomes, we recommend:\n1. **Soil Testing:** Verify soil pH and NPK nutrient levels.\n2. **Nutrient Management:** Use balanced organic manures and recommended NPK doses.\n3. **Modern Irrigation:** Implement Drip/Sprinkler systems for water conservation.\n4. **Pest Control:** Inspect crops regularly and use Neem oil or targeted biopesticides.`;
    }
}

function getBestVoiceForLang(targetLang) {
    if (!("speechSynthesis" in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || !voices.length) return null;

    const langCode = targetLang === "hi" ? "hi" : (targetLang === "mr" ? "mr" : "en");

    let matched = voices.find(v => v.lang && v.lang.toLowerCase().replace("_", "-").startsWith(langCode));
    if (matched) return matched;

    if (targetLang === "mr") {
        matched = voices.find(v => v.lang && v.lang.toLowerCase().startsWith("hi"));
        if (matched) return matched;
    }

    matched = voices.find(v => {
        const name = (v.name || "").toLowerCase();
        return name.includes("hindi") || name.includes("marathi") || name.includes("india");
    });
    if (matched) return matched;

    return voices.find(v => v.lang && v.lang.toLowerCase().includes("in")) || null;
}

function speakText(text) {
    if (!("speechSynthesis" in window)) return;

    // Stop any ongoing speech synthesis first
    window.speechSynthesis.cancel();

    // Clean text for smooth voice reading
    let cleanText = (text || "")
        .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
        .replace(/[\*\_]/g, "")
        .replace(/https?:\/\/\S+/g, "")
        .trim();

    if (!cleanText) return;

    const lang = localStorage.getItem("language") || "en";

    // Explicit Phonetic Pronunciation Normalization for NPK & Colon Ratios in Devanagari (२०:२०:२०) & ASCII (20:20:20)
    if (lang === "mr") {
        cleanText = cleanText
            .replace(/\bNPK\b/gi, "एन. पी. के. (नत्र, स्फुरद, आणि पोटॅश)")
            .replace(/एनपीके/g, "एन. पी. के.")
            .replace(/(20:20:20|२०:२०:२०|20-20-20|२०-२०-२०)/g, "वीस, वीस, वीस")
            .replace(/(19:19:19|१९:१९:१९|19-19-19|१९-१९-१९)/g, "एकोणोवीस, एकोणोवीस, एकोणोवीस")
            .replace(/(12:32:16|१२:३२:१६|12-32-16|१२-३२-१६)/g, "बारा, बत्तीस, सोळा")
            .replace(/(10:26:26|१०:२६:२६|10-26-26|१०-२६-२६)/g, "दहा, सव्वीस, सव्वीस")
            .replace(/(10:20:10|१०:२०:१०|10-20-10|१०-२०-१०)/g, "दहा, वीस, दहा")
            .replace(/(4:2:1|४:२:१|4-2-1|४-२-१)/g, "चार, दोन, एक")
            .replace(/([0-9\u0966-\u096F]+):([0-9\u0966-\u096F]+):([0-9\u0966-\u096F]+)/g, function(m, p1, p2, p3) { return p1 + " बाय " + p2 + " बाय " + p3; })
            .replace(/([0-9\u0966-\u096F]+):([0-9\u0966-\u096F]+)/g, function(m, p1, p2) { return p1 + " बाय " + p2; });
    } else if (lang === "hi") {
        cleanText = cleanText
            .replace(/\bNPK\b/gi, "एन. पी. के. (नाइट्रोजन, फास्फोरस, पोटाश)")
            .replace(/एनपीके/g, "एन. पी. के.")
            .replace(/(20:20:20|२०:२०:२०|20-20-20|२०-२०-२०)/g, "बीस, बीस, बीस")
            .replace(/(19:19:19|१९:१९:१९|19-19-19|१९-१९-१९)/g, "उन्नीस, उन्नीस, उन्नीस")
            .replace(/(12:32:16|१२:३२:१६|12-32-16|१२-३२-१६)/g, "बारह, बत्तीस, सोलह")
            .replace(/(10:20:10|१०:२०:१०|10-20-10|१०-२०-१०)/g, "दस, बीस, दस")
            .replace(/(4:2:1|४:२:१|4-2-1|४-२-१)/g, "चार, दो, एक")
            .replace(/([0-9\u0966-\u096F]+):([0-9\u0966-\u096F]+):([0-9\u0966-\u096F]+)/g, function(m, p1, p2, p3) { return p1 + " अनुपात " + p2 + " अनुपात " + p3; })
            .replace(/([0-9\u0966-\u096F]+):([0-9\u0966-\u096F]+)/g, function(m, p1, p2) { return p1 + " अनुपात " + p2; });
    } else {
        cleanText = cleanText
            .replace(/\bNPK\b/gi, "N. P. K. (Nitrogen, Phosphorus, and Potassium)")
            .replace(/(20:20:20|20-20-20)/g, "twenty, twenty, twenty ratio")
            .replace(/(4:2:1|4-2-1)/g, "four to two to one ratio")
            .replace(/([0-9]+):([0-9]+):([0-9]+)/g, function(m, p1, p2, p3) { return p1 + " to " + p2 + " to " + p3 + " ratio"; })
            .replace(/([0-9]+):([0-9]+)/g, function(m, p1, p2) { return p1 + " to " + p2 + " ratio"; });
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const langMap = {
        en: "en-IN",
        hi: "hi-IN",
        mr: "mr-IN"
    };

    utterance.lang = langMap[lang] || "en-IN";
    utterance.rate = 0.95;

    const executeSpeak = () => {
        const selectedVoice = getBestVoiceForLang(lang);
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        utterance.onstart = () => {
            isSpeaking = true;
            if (micBtn && micBtn.parentElement) {
                micBtn.parentElement.classList.remove("listening");
                micBtn.parentElement.classList.add("speaking");
            }
            if (micIcon) micIcon.className = "fa-solid fa-volume-xmark";
            if (statusText) statusText.innerText = window.t ? window.t("speaking", "🔊 Speaking... (Tap to stop)") : "🔊 Speaking... (Tap to stop)";
            if (stopSpeechBtn) stopSpeechBtn.style.display = "inline-flex";
        };

        utterance.onend = () => {
            stopSpeaking();
        };

        utterance.onerror = (e) => {
            console.warn("Speech synthesis error:", e);
            stopSpeaking();
        };

        window.speechSynthesis.speak(utterance);
    };

    const availableVoices = window.speechSynthesis.getVoices();
    if (availableVoices && availableVoices.length > 0) {
        executeSpeak();
    } else {
        window.speechSynthesis.onvoiceschanged = () => {
            executeSpeak();
            window.speechSynthesis.onvoiceschanged = null;
        };
        executeSpeak();
    }
}

function appendMessage(text, sender) {
    if (!transcriptBox) return;
    const msgDiv = document.createElement("div");
    msgDiv.className = sender === "user" ? "user-msg" : "ai-msg";

    if (sender === "ai") {
        msgDiv.innerHTML = `<i class="fa-solid fa-robot"></i> <span>${formatMarkdown(text)}</span>`;
    } else {
        msgDiv.innerText = text;
    }

    transcriptBox.appendChild(msgDiv);
    transcriptBox.scrollTop = transcriptBox.scrollHeight;
}

function formatMarkdown(text) {
    if (!text) return "";
    return text
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/\n/g, "<br>");
}
