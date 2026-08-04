// Apply Dark Mode on Page Load
if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
}

// ================================
// Kisan Mitra AI Chatbot
// ================================

const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

let activeUtterance = null;

// Check query param from URL search bar
window.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get("q");
    if (query && userInput) {
        userInput.value = query;
        sendMessage();
    }
});

// Send Message Listeners
if (sendBtn) sendBtn.addEventListener("click", sendMessage);
if (userInput) {
    userInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            sendMessage();
        }
    });
}

function formatMarkdown(text) {
    if (!text) return "";
    return text
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/\n/g, "<br>");
}

window.stopSpeaking = function() {
    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
    }
    document.querySelectorAll(".msg-stop-btn").forEach(btn => btn.style.display = "none");
    document.querySelectorAll(".msg-speak-btn").forEach(btn => btn.style.display = "inline-flex");
};

window.speakMessageText = function(btnElement, text) {
    if (!("speechSynthesis" in window)) return;
    window.stopSpeaking();

    let cleanText = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "").replace(/[\*\_]/g, "").trim();
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
    const langMap = { en: "en-IN", hi: "hi-IN", mr: "mr-IN" };
    utterance.lang = langMap[lang] || "en-IN";
    utterance.rate = 0.95;

    const parent = btnElement.parentElement;
    const stopBtn = parent ? parent.querySelector(".msg-stop-btn") : null;

    utterance.onstart = () => {
        btnElement.style.display = "none";
        if (stopBtn) stopBtn.style.display = "inline-flex";
    };

    utterance.onend = () => {
        btnElement.style.display = "inline-flex";
        if (stopBtn) stopBtn.style.display = "none";
    };

    utterance.onerror = () => {
        btnElement.style.display = "inline-flex";
        if (stopBtn) stopBtn.style.display = "none";
    };

    window.speechSynthesis.speak(utterance);
};

function appendBotMessage(replyText) {
    const botDiv = document.createElement("div");
    botDiv.className = "bot-message";
    
    const formattedHtml = formatMarkdown(replyText);
    botDiv.innerHTML = `
        <div class="msg-content">${formattedHtml}</div>
        <div class="msg-actions">
            <button class="msg-speak-btn" onclick="speakMessageText(this, ${JSON.stringify(replyText)})" title="Read Aloud"><i class="fa-solid fa-volume-high"></i> Listen</button>
            <button class="msg-stop-btn" onclick="stopSpeaking()" style="display:none;" title="Stop Voice"><i class="fa-solid fa-circle-stop"></i> Stop</button>
        </div>
    `;
    chatBox.appendChild(botDiv);
    scrollBottom();
}

function scrollBottom() {
    if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
    if (!userInput) return;
    const message = userInput.value.trim();
    if (message === "") return;

    // User Message
    const userDiv = document.createElement("div");
    userDiv.className = "user-message";
    userDiv.innerText = message;
    chatBox.appendChild(userDiv);

    userInput.value = "";
    scrollBottom();

    // Loading Message
    const loading = document.createElement("div");
    loading.className = "bot-message";
    loading.innerHTML = "🤖 Kisan Mitra AI is typing...";
    chatBox.appendChild(loading);
    scrollBottom();

    const lang = localStorage.getItem("language") || "en";

    try {
        if (window.KisanAPI) {
            const res = await window.KisanAPI.request("/chat/query", {
                method: "POST",
                body: JSON.stringify({ query: message, language: lang }),
            });

            if (loading.parentElement) loading.remove();

            if (res && res.success && res.reply) {
                appendBotMessage(res.reply);
                return;
            }
        }
    } catch (e) {
        console.warn("Chatbot API fetch error, fallback active:", e);
    }

    // Fallback response generator
    setTimeout(() => {
        if (loading.parentElement) loading.remove();
        appendBotMessage(getBotReplyFallback(message, lang));
    }, 400);
}

function getBotReplyFallback(message, lang = "en") {
    const rawQuery = message || "";
    const cleanQ = rawQuery.toLowerCase().replace(/[^\w\s\u0900-\u097F]/gi, " ").replace(/\s+/g, " ").trim();
    
    // Typo corrections
    const typoMap = {
        "orgnic": "organic", "organik": "organic", "benifit": "benefit", "benifits": "benefits",
        "irigation": "irrigation", "driping": "drip", "fertiliizer": "fertilizer", "fertalizer": "fertilizer",
        "pesticid": "pesticide", "subsidie": "subsidy", "wether": "weather"
    };
    
    let words = cleanQ.split(" ");
    let q = words.map(w => typoMap[w] || w).join(" ");
    const currentLang = lang || localStorage.getItem("language") || "en";

    if (currentLang === "hi") {
        if (q.includes("organic") || q.includes("जैविक") || q.includes("ऑर्गेनिक") || q.includes("गोबर") || q.includes("वर्मीकंपोस्ट") || q.includes("जीवामृत")) {
            return "🌱 **जैविक एवं प्राकृतिक खेती मार्गदर्शिका:**\n1. **मिट्टी सुधार:** खेत में वर्मीकंपोस्ट या गोबर खाद 2-3 टन/एकड़ डालें।\n2. **जीवामृत:** 200L पानी + 10kg गोबर + 10L गोमूत्र + 2kg गुड़ + 2kg बेसन 48 घंटे फर्मेंट करें।\n3. **जैविक उर्वरक:** एज़ोटोबैक्टर व राइज़ोबियम का प्रयोग करें।\n4. **कीट नियंत्रण:** नीम तेल 1500 ppm (5 एमएल/लीटर) और पीले चिपचिपे कार्ड लगाएं।";
        }
        if (q.includes("drip") || q.includes("ड्रिप") || q.includes("टपक") || q.includes("स्प्रिंकलर") || q.includes("सिंचाई")) {
            return "💧 **ड्रिप (टपक) सिंचाई के लाभ:**\n1. 40% से 70% तक पानी की बचत होती है।\n2. फसल उपज में 20% से 30% तक वृद्धि होती है।\n3. विद्राव्य खाद सीधे जड़ों तक पहुँचती है। 55%-80% सरकारी सब्सिडी (PMKSY) उपलब्ध है।";
        }
        if (q.includes("गन्ना") || q.includes("sugarcane")) {
            return "🎋 **गन्ना उत्पादन सलाह:**\n1. Co-0238 या Co-86032 किस्म ट्रेंच विधि (4 फीट) से बोएं।\n2. जल आवश्यकता 1500-2500 मिमी है। ड्रिप फर्टिगेशन अपनाएं।\n3. लाल सड़न हेतु ट्राइकोडर्मा 2.5 किग्रा/एकड़ गोबर खाद में दें।";
        }
        if (q.includes("सोयाबीन") || q.includes("soybean")) {
            return "🌱 **सोयाबीन फसल सलाह:**\n1. राइज़ोबियम एवं पीएसबी कल्चर (5 ग्राम/किग्रा) से बीज उपचारित करें।\n2. NPK 20:60:40 + सल्फर 10 किग्रा/एकड़ दें।\n3. पीला मोज़ेक वायरस नियंत्रण हेतु थायामेथॉक्सम 25% WG का छिड़काव करें।";
        }
        if (q.includes("मूंगफली") || q.includes("groundnut")) {
            return "🥜 **मूंगफली फसल सलाह:**\n1. सुइयां बनते समय 200 किग्रा/एकड़ जिप्सम डालें।\n2. टिक्का रोग हेतु मैनकोज़ेब 75% WP (2.5 ग्राम/लीटर) का छिड़काव करें।";
        }
        if (q.includes("प्याज") || q.includes("लहसुन") || q.includes("onion") || q.includes("garlic")) {
            return "🧅 **प्याज एवं लहसुन सुरक्षा:**\n1. बैंगनी धब्बा हेतु मैनकोज़ेब 2.5 ग्राम/लीटर छिड़कें।\n2. थ्रिप्स हेतु फिप्रोनिल 5% SC (1.5 एमएल/लीटर) का प्रयोग करें।";
        }
        if (q.includes("टमाटर") || q.includes("आलू") || q.includes("tomato") || q.includes("potato")) {
            return "🍅 **टमाटर एवं आलू प्रबंधन:**\n1. झुलसा रोग हेतु कॉपर ऑक्सीक्लोराइड 3 ग्राम/लीटर का छिड़काव करें।\n2. फल छेदक हेतु इमामेक्टिन बेंजोएट का प्रयोग करें।";
        }
        if (q.includes("मक्का") || q.includes("maize") || q.includes("corn")) {
            return "🌽 **मक्का एवं फॉल आर्मीवर्म प्रबंधन:**\n1. फॉल आर्मीवर्म हेतु स्पिनेटोरम 11.7% SC (0.5 एमएल/लीटर) पोंगे में छिड़कें।\n2. NPK 120:60:40 किग्रा/हेक्टेयर दें।";
        }
        if (q.includes("सरसों") || q.includes("mustard")) {
            return "🌼 **सरसों फसल सलाह:**\n1. चेपा/माहो नियंत्रण हेतु इमिडाक्लोप्रिड 17.8% SL छिड़कें।\n2. तेल प्रतिशत हेतु 10 किग्रा सल्फर प्रति एकड़ डालें।";
        }
        if (q.includes("चना") || q.includes("मूंग") || q.includes("अरहर") || q.includes("दाल")) {
            return "🫘 **दलहन फसल प्रबंधन:**\n1. राइज़ोबियम व ट्राइकोडर्मा से बीज उपचारित करें।\n2. फली छेदक सुंडी हेतु इंडोक्साकार्ब 14.5% SC छिड़कें।";
        }
        if (q.includes("गेहूं") || q.includes("wheat")) {
            return "🌾 **गेहूं की खेती:**\n1. किस्म: HD-2967 या DBW-187।\n2. बुआई के 21 दिन पर पहली (CRI) सिंचाई अति आवश्यक।\n3. 45 किग्रा यूरिया + 50 किग्रा DAP/एकड़ दें।";
        }
        if (q.includes("धान") || q.includes("चावल") || q.includes("rice")) {
            return "🌾 **धान प्रबंधन:**\n1. रोपाई पर 2-3 सेमी पानी रखें।\n2. खैरा रोग हेतु जिंक सल्फेट 10 किग्रा/एकड़ दें।\n3. खरपतवार हेतु प्रीटिलाक्लोर छिड़कें।";
        }
        if (q.includes("कपास") || q.includes("cotton")) {
            return "🌱 **कपास सुरक्षा:**\n1. गुलाबी सुंडी हेतु फेरोमोन ट्रैप लगाएं।\n2. सफेद मक्खी हेतु इमिडाक्लोप्रिड या नीम तेल 1500 ppm छिड़कें।";
        }
        if (q.includes("योजना") || q.includes("pm kisan") || q.includes("बीमा") || q.includes("kusum") || q.includes("ऋण")) {
            return "🏛️ **सरकारी योजनाएं:**\n1. PM-KISAN: ₹6,000/वर्ष (3 किस्तें)।\n2. PM-KUSUM: सोलर पंप पर 60%-90% सब्सिडी।\n3. PMFBY: 1.5%-2% प्रीमियम पर फसल बीमा।";
        }
        if (q.includes("मौसम") || q.includes("weather")) {
            return "☁️ **मौसम सलाह:** किसान मित्र AI के Weather सेक्शन में लाइव तापमान और बारिश का पूर्वानुमान देखें।";
        }
        if (q.includes("मंडी") || q.includes("भाव") || q.includes("storage")) {
            return "🏬 **मंडी भाव एवं भंडारण:**\n1. नमी 12% से कम रखें।\n2. e-NAM पोर्टल पर ताजा भाव चेक करें।";
        }
        if (q.includes("हेलो") || q.includes("नमस्ते") || q.includes("hi") || q.includes("hello")) {
            return "👋 **नमस्ते! मैं किसान मित्र AI हूँ।**\nआप मुझसे फसल, ड्रिप सिंचाई, जैविक खेती, बीमारी का इलाज, बीज, उर्वरक, मौसम या सरकारी योजनाओं के बारे में पूछ सकते हैं।";
        }

        let topicFocus = "कृषि सलाह";
        let detailPoints = [
            "**मृदा परीक्षण:** मिट्टी की पीएच (pH) और पोषक तत्वों की जांच करवाएं।",
            "**संतुलित पोषण:** जैविक खाद के साथ NPK उर्वरक का प्रयोग करें।",
            "**जल प्रबंधन:** ड्रिप/टपक सिंचाई अपनाकर जल बचाएं।",
            "**पौध सुरक्षा:** नीम तेल या अनुशंसित कीटनाशक का छिड़काव करें।"
        ];
        if (q.includes("पानी") || q.includes("सिंचाई")) {
            topicFocus = "सिंचाई प्रबंधन";
            detailPoints[2] = "**ड्रिप प्रणाली:** ड्रिप सिंचाई से 50% जल बचत और सीधे जड़ों तक खाद पहुँचती है।";
        } else if (q.includes("कीट") || q.includes("इल्ली") || q.includes("कीड़ा")) {
            topicFocus = "कीट नियंत्रण";
            detailPoints[3] = "**कीट नियंत्रण:** नीम तेल (1500 ppm @ 5ml/L) या फेरोमोन ट्रैप लगाएं।";
        } else if (q.includes("खाद") || q.includes("उर्वरक") || q.includes("यूरिया")) {
            topicFocus = "उर्वरक प्रबंधन";
            detailPoints[1] = "**संतुलित खुराक:** 4:2:1 (N:P:K) अनुपात में उर्वरक दें और यूरिया 2-3 किस्तों में बांटें।";
        } else if (q.includes("रोग") || q.includes("बीमारी") || q.includes("धब्बा")) {
            topicFocus = "रोग उपचार";
            detailPoints[3] = "**फफूंदनाशी:** मैनकोज़ेब 75% WP (2.5g/L) का तुरंत छिड़काव करें।";
        }
        return `🤖 **किसान मित्र ${topicFocus} ("${rawQuery}"):**\n\n1. ${detailPoints[0]}\n2. ${detailPoints[1]}\n3. ${detailPoints[2]}\n4. ${detailPoints[3]}`;

    } else if (currentLang === "mr") {
        if (q.includes("organic") || q.includes("सेंद्रिय") || q.includes("शेणखत") || q.includes("गांडूळ") || q.includes("जीवामृत")) {
            return "🌱 **सेंद्रिय व नैसर्गिक शेती मार्गदर्शक:**\n१. गांडूळ खत किंवा शेणखत २-३ टन/एकरी वापरा.\n२. जीवामृत (२००L पाणी + १०kg शेण + १०L गोमूत्र + २kg गूळ + २kg बेसन) सिंचनासोबत द्या.\n३. कीड नियंत्रणासाठी निंबोळी अर्क १५०० ppm फवारा.";
        }
        if (q.includes("drip") || q.includes("ड्रिप") || q.includes("ठिबक") || q.includes("तुषार")) {
            return "💧 **ठिबक सिंचनाचे फायदे:**\n१. ४०% ते ७०% पाण्याची बचत.\n२. २०% ते ३०% जास्त उत्पादन व ५०% खतांची बचत.\n३. ५५% ते ८०% शासकीय सबसिडी.";
        }
        if (q.includes("ऊस") || q.includes("sugarcane")) {
            return "🎋 **ऊस पीक सल्ला:**\n१. Co-86032 वाण पट्ट्या पद्धतीने (४-५ फूट) लावा.\n२. ठिबक सिंचनाचा वापर करा.\n३. तांबेरा रोगासाठी ट्रायकोडेर्मा शेणखतात मिसळून द्या.";
        }
        if (q.includes("सोयाबीन") || q.includes("soybean")) {
            return "🌱 **सोयाबीन पीक सल्ला:**\n१. रायझोबियम व पीएसबी जिवाणू संवर्धक (५ ग्रॅम/किलो) लावा.\n२. NPK २०:६०:४० + १० किलो सल्फर द्या.\n३. पांढऱ्या माशीसाठी थायामेथॉक्सम २५% WG फवारा.";
        }
        if (q.includes("भुईमूग") || q.includes("groundnut")) {
            return "🥜 **भुईमूग पीक सल्ला:**\n१. आऱ्या सुटताना प्रति एकरी २०० किलो जिप्सम टाका.\n२. टिक्का रोगासाठी मँकोझेब ७५% WP (२.५ ग्रॅम/लीटर) फवारा.";
        }
        if (q.includes("कांदा") || q.includes("लसूण") || q.includes("onion") || q.includes("garlic")) {
            return "🧅 **कांदा व लसूण पीक रक्षण:**\n१. करपा रोगासाठी मँकोझेब २.५ ग्रॅम/लीटर + स्टिकर फवारा.\n२. थ्रिप्ससाठी फिप्रोनिल ५% SC (१.५ मिली/लीटर) फवारा.";
        }
        if (q.includes("टोमॅटो") || q.includes("बटाटा") || q.includes("tomato") || q.includes("potato")) {
            return "🍅 **टोमॅटो व बटाटा रक्षण:**\n१. करपा रोगासाठी कॉपर ऑक्सिक्लोराइड ३ ग्रॅम/लीटर फवारा.\n२. अळीसाठी इमॅमेक्टिन बेंझोएट वापरा.";
        }
        if (q.includes("कापूस") || q.includes("cotton")) {
            return "🌱 **कापूस पीक सल्ला:**\n१. गुलाबी बोंड अळीसाठी कामगंध सापळे लावा.\n२. पांढऱ्या माशीसाठी इमिडाक्लोप्रिड किंवा निंबोळी अर्क फवारा.";
        }
        if (q.includes("गहू") || q.includes("wheat")) {
            return "🌾 **गहू लागवड सल्ला:**\n१. HD-2967 किंवा DBW-187 वाण वापरा.\n२. पेरणीनंतर २१ दिवसांनी पहिली ओलिताची पाळी अत्यंत महत्त्वाची.\n३. प्रति एकरी ४५ किलो युरिया + ५० किलो DAP द्या.";
        }
        if (q.includes("भात") || q.includes("तांदूळ") || q.includes("rice")) {
            return "🌾 **भात पीक सल्ला:**\n१. २-३ सेंमी पाणी कायम ठेवा.\n२. खैरा रोगासाठी झिंक सल्फेट १० किलो/एकरी टाका.\n३. प्रीटिलाक्लोर फवारा.";
        }
        if (q.includes("योजना") || q.includes("पीएम किसान") || q.includes("अनुदान") || q.includes("विमा")) {
            return "🏛️ **शासकीय योजना:**\n१. PM-KISAN: ६,००० रु/वर्ष (३ हप्ते).\n२. PM-KUSUM: सोलर पंप ६०%-९०% अनुदान.\n३. पीक विमा (PMFBY): १.५%-२% हप्त्यावर विमा.";
        }
        if (q.includes("हवामान") || q.includes("weather")) {
            return "☁️ **हवामान अंदाज:** आजच्या थेट अंदाजासाठी अॅपमधील Weather विभाग पहा.";
        }
        if (q.includes("बाजार") || q.includes("भाव") || q.includes("mandi")) {
            return "🏬 **बाजारभाव व साठवणूक:**\n१. ओलावा १२% पेक्षा कमी ठेवा.\n२. e-NAM द्वारे बाजार समितीचे दर तपासा.";
        }
        if (q.includes("नमस्कार") || q.includes("हॅलो") || q.includes("hi") || q.includes("hello")) {
            return "👋 **नमस्कार! मी किसान मित्र AI आहे.**\nपिके, ठिबक सिंचन, सेंद्रिय शेती, खते, हवामान किंवा रोगांबद्दल मला विचारू शकता.";
        }

        let topicFocus = "शेती सल्ला";
        let detailPoints = [
            "**माती परीक्षण:** मातीचा सामू (pH) व सुपीकता तपासा.",
            "**संतुलित खत मात्रा:** सेंद्रिय खतांसोबत NPK खते द्या.",
            "**पाणी बचत:** ठिबक किंवा तुषार सिंचन पद्धती वापरा.",
            "**पीक संरक्षण:** निंबोळी अर्क किंवा योग्य औषध फवारा."
        ];
        if (q.includes("पाणी") || q.includes("सिंचन")) {
            topicFocus = "सिंचन व्यवस्थापन";
            detailPoints[2] = "**ठिबक सिंचन:** ठिबक सिंचनाने ५०% पाण्याची बचत होते व खते थेट मुळांपर्यंत पोहोचतात.";
        } else if (q.includes("कीड") || q.includes("अळी")) {
            topicFocus = "कीड नियंत्रण";
            detailPoints[3] = "**कीड नियंत्रण:** निंबोळी अर्क (१५०० ppm @ ५ मिली/लीटर) फवारा किंवा सापळे लावा.";
        } else if (q.includes("खत") || q.includes("युरिया")) {
            topicFocus = "खत व्यवस्थापन";
            detailPoints[1] = "**समतोल खते:** ४:२:१ (N:P:K) प्रमाणात खते द्या आणि युरिया टप्प्याटप्प्याने द्या.";
        }
        return `🤖 **किसान मित्र ${topicFocus} ("${rawQuery}"):**\n\n१. ${detailPoints[0]}\n२. ${detailPoints[1]}\n३. ${detailPoints[2]}\n४. ${detailPoints[3]}`;

    } else {
        if (/\b(hello|hi|hey|namaste|greetings|who are you|what can you do|help)\b/i.test(q) || q.includes("options") || q.includes("kisan mitra")) {
            return "👋 **Hello! I am your Kisan Mitra AI Assistant.**\nI can help you with:\n1. **Crop Cultivation:** Wheat, Rice, Sugarcane, Soybean, Cotton, Groundnut, Pulses, Vegetables & Fruits.\n2. **Soil & Fertilizers:** Soil pH, NPK dosage ratios, Organic FYM/Vermicompost, Urea splitting & Zinc.\n3. **Pest & Disease Control:** Organic Neem oil, Fungicides (Mancozeb/Copper Oxychloride), and Insecticides.\n4. **Irrigation & Water:** Drip/Sprinkler micro-irrigation systems & PMKSY government subsidies.\n5. **Government Schemes:** PM-KISAN (₹6000/yr), PM-KUSUM Solar Pumps, PMFBY Crop Insurance & KCC Loans.";
        }
        if (q.includes("wheat")) {
            return "🌾 **Wheat Cultivation & Fertilizer Advisory:**\n1. **Recommended Varieties:** Use certified seeds like HD-2967, DBW-187, or PBW-550.\n2. **Critical Irrigation:** First irrigation at Crown Root Initiation (CRI) stage (21 days post-sowing) is essential.\n3. **Fertilizer Dose:** Apply 45kg Urea + 50kg DAP per acre at sowing and first watering.";
        }
        if (q.includes("rice") || q.includes("paddy")) {
            return "🌾 **Paddy / Rice Cultivation Advisory:**\n1. **Transplanting:** Maintain 2-3 cm standing water during initial seedling establishment.\n2. **Khaira Disease Prevention:** Prevent zinc deficiency by applying Zinc Sulfate (21%) @ 10kg/acre.\n3. **Weed Control:** Apply Pretilachlor 50% EC within 3-4 days post-transplanting.";
        }
        if (q.includes("sugarcane") || q.includes("cane")) {
            return "🎋 **Sugarcane Cultivation & Management:**\n1. **Varieties:** Select high-yielding varieties like Co-0238, Co-15023, or Co-86032. Plant using trench method (4 ft spacing).\n2. **Water Requirement:** Requires 1500–2500 mm water. Drip fertigation increases cane girth and brix content.\n3. **Red Rot Control:** Soil apply Trichoderma harzianum @ 2.5kg/acre mixed with FYM.";
        }
        if (q.includes("soybean") || q.includes("soya")) {
            return "🌱 **Soybean Crop Advisory:**\n1. **Seed Treatment:** Treat seeds with Rhizobium and PSB cultures (5g/kg seed).\n2. **Fertilizer Dose:** Apply NPK 20:60:40 + 10kg Elemental Sulfur per acre.\n3. **Yellow Mosaic Virus:** Control whitefly vectors by spraying Thiamethoxam 25% WG @ 0.5g/L.";
        }
        if (q.includes("groundnut") || q.includes("peanut")) {
            return "🥜 **Groundnut Farming Advisory:**\n1. **Gypsum Application:** Apply Gypsum @ 200kg/acre at pegging stage to ensure pod filling and oil synthesis.\n2. **Tikka Disease:** Spray Mancozeb 75% WP @ 2.5g/L or Tebuconazole @ 1ml/L.";
        }
        if (q.includes("cotton")) {
            return "🌱 **Cotton Crop Protection:**\n1. **Pest Control:** Install pheromone traps for Pink Bollworm. Spray Imidacloprid 17.8% SL (0.5ml/L) or 5% Neem Seed Extract for whiteflies.\n2. **Potash Dose:** Ensure adequate potash application during boll development stage.";
        }
        if (q.includes("onion") || q.includes("garlic")) {
            return "🧅 **Onion & Garlic Protection:**\n1. **Purple Blotch:** Spray Mancozeb @ 2.5g/L + sticker adjuvant.\n2. **Thrips Control:** Spray Fipronil 5% SC @ 1.5ml/L or Imidacloprid 17.8% SL @ 0.5ml/L.\n3. **Curing:** Shade cure harvested bulbs for 10-15 days prior to storage.";
        }
        if (q.includes("tomato") || q.includes("potato")) {
            return "🍅 **Tomato & Potato Management:**\n1. **Blight Protection:** Spray Chlorothalonil or Copper Oxychloride @ 2.5g/L every 12-15 days.\n2. **Fruit Borer:** Apply Emamectin Benzoate 5% SG @ 0.4g/L.\n3. **Blossom End Rot:** Ensure steady soil moisture and spray Calcium Nitrate (5g/L).";
        }
        if (q.includes("maize") || q.includes("corn")) {
            return "🌽 **Maize Cultivation & Fall Armyworm (FAW) Control:**\n1. **FAW Management:** Spray Spinetoram 11.7% SC @ 0.5ml/L or Emamectin Benzoate directly into plant whorls.\n2. **Nutrient Dose:** NPK 120:60:40 kg/ha split into 3 applications.";
        }
        if (q.includes("mustard") || q.includes("rapeseed")) {
            return "🌼 **Mustard Crop Management:**\n1. **Aphid Control:** Spray Imidacloprid 17.8% SL @ 0.5ml/L or Dimethoate 30% EC.\n2. **Sulfur:** Apply 10kg Elemental Sulfur per acre at sowing to increase oil percentage.";
        }
        if (q.includes("gram") || q.includes("chickpea") || q.includes("moong") || q.includes("urad") || q.includes("arhar") || q.includes("pigeon pea") || q.includes("pulse")) {
            return "🫘 **Pulses Cultivation Advisory:**\n1. **Seed Treatment:** Treat seeds with Rhizobium culture and Trichoderma (4g/kg seed).\n2. **Pod Borer Control:** Install pheromone traps and spray Indoxacarb 14.5% SC @ 0.5ml/L.\n3. **Nutrient Requirement:** Low N requirement; apply NPK 20:50:20 kg/ha.";
        }
        if (q.includes("mango") || q.includes("banana") || q.includes("citrus") || q.includes("papaya") || q.includes("fruit")) {
            return "🍌 **Horticulture & Fruit Crops Advisory:**\n1. **Fruit Fly Control:** Install Methyl Eugenol pheromone traps.\n2. **Drip Fertigation:** Apply water-soluble NPK 19:19:19 through drip for flower and fruit development.\n3. **Fungal Control:** Spray Copper Hydroxide or Copper Oxychloride @ 3g/L.";
        }
        if (q.includes("npk") || q.includes("n p k")) {
            return "🧪 **NPK Values & Fertilizer Advisory:**\n1. **Nitrogen (N):** Drives vegetative shoot growth, stem strength, and green foliage development.\n2. **Phosphorus (P):** Stimulates early root establishment, flower formation, and seed development.\n3. **Potassium (K):** Enhances disease resistance, drought tolerance, grain weight, and overall crop quality.\n4. **Recommended Ratio:** Standard cereal crops thrive on a **4:2:1 (N:P:K)** ratio. Always base precise fertilizer doses on Soil Health Card tests.";
        }
        if (q.includes("organic") || q.includes("compost") || q.includes("vermicompost") || q.includes("cow dung") || q.includes("neem cake") || q.includes("biofertilizer") || q.includes("bio fertilizer")) {
            return "🌱 **Organic Farming Guide:**\n1. **Soil Health:** Enrich soil with Vermicompost (earthworm manure) or FYM @ 2-3 tonnes/acre.\n2. **Bio-fertilizers:** Apply Azotobacter, Rhizobium, and PSB cultures.\n3. **Natural Pest Control:** Spray Neem Oil (1500 ppm @ 5ml/L) and install yellow sticky traps.\n4. **Certification:** Register under Jaivik Bharat / NPOP for organic crop certification and premium market pricing.";
        }
        if (q.includes("most water") || q.includes("high water") || q.includes("water use") || q.includes("water usage") || q.includes("water consumption") || q.includes("water requirement") || (q.includes("seed") && q.includes("water"))) {
            return "💧 **Seed & Crop Water Consumption Guide:**\n1. **Crops/Seeds Requiring Highest Water:**\n   - **Sugarcane:** 1,500 – 2,500 mm (Highest water consumer per crop cycle).\n   - **Paddy / Rice:** 1,200 – 1,500 mm (Requires continuous standing water).\n   - **Banana:** 1,200 – 2,200 mm.\n   - **Cotton:** 700 – 1,300 mm.\n2. **Moderate Water Crops:**\n   - **Wheat:** 450 – 650 mm.\n   - **Maize:** 500 – 800 mm.\n   - **Potato:** 500 – 700 mm.\n3. **Low Water / Drought Tolerant Crops:**\n   - **Bajra (Pearl Millet):** 250 – 350 mm.\n   - **Chickpea / Gram:** 250 – 350 mm.\n   - **Mustard & Moong:** 300 – 400 mm.\n4. **Water Saving Tip:** Use Drip or Sprinkler systems to cut water consumption by up to 50%.";
        }
        if (q.includes("drip") || q.includes("sprinkler") || q.includes("fertigation") || q.includes("micro irrigation") || (q.includes("irrigation") && (q.includes("benefit") || q.includes("subsidy") || q.includes("type")))) {
            return "💧 **Key Benefits of Drip Irrigation:**\n1. **Water Savings:** Saves 40% to 70% water compared to flood irrigation by delivering water directly to root zones.\n2. **Increased Yield:** Boosts crop yields by 20% to 30% due to uniform root moisture.\n3. **Fertigation Efficiency:** Soluble fertilizers are applied directly through water lines, reducing nutrient wastage by 50%.\n4. **Weed Reduction:** Suppresses weed growth between plant rows as uncultivated soil stays dry.\n5. **Government Subsidy:** Eligible for 55% to 80% subsidy under PM Krishi Sinchayee Yojana (PMKSY).";
        }
        if (q.includes("blight") || q.includes("disease") || q.includes("cure") || q.includes("treatment") || q.includes("fungicide") || q.includes("leaf") || q.includes("spray")) {
            return "🌿 **Crop Disease & Leaf Blight Management:**\n1. **Fungicide Spray:** Apply Mancozeb 75% WP @ 2.5g/L water or Copper Oxychloride @ 3g/L for immediate leaf spot/blight control.\n2. **Cultural Practices:** Remove heavily infected leaves, avoid overhead sprinkler watering, and ensure good drainage.";
        }
        return `🤖 **Kisan Mitra Farming Advisory for "${rawQuery}":**\nFor optimal agricultural outcomes, we recommend:\n1. **Soil Testing:** Verify soil pH and NPK nutrient levels.\n2. **Nutrient Management:** Use balanced organic manures and recommended NPK doses.\n3. **Modern Irrigation:** Implement Drip/Sprinkler systems for water conservation.\n4. **Pest Control:** Inspect crops regularly and use Neem oil or targeted biopesticides.`;
    }
}