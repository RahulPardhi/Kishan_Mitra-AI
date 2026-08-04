// Central Agricultural Knowledge & NLP Engine for Kisan Mitra AI

const normalizeQuery = (text) => {
    return (text || "")
        .toLowerCase()
        .replace(/[^\w\s\u0900-\u097F]/gi, " ") // Keep alphanumeric, spaces, and Devanagari (Hindi/Marathi)
        .replace(/\s+/g, " ")
        .trim();
};

// Common typos normalization map
const TYPO_MAP = {
    "orgnic": "organic",
    "organik": "organic",
    "benifit": "benefit",
    "benifits": "benefits",
    "irigation": "irrigation",
    "driping": "drip",
    "fertiliizer": "fertilizer",
    "fertalizer": "fertilizer",
    "pesticid": "pesticide",
    "subsidie": "subsidy",
    "subsdy": "subsidy",
    "wether": "weather",
    "weathr": "weather"
};

const applyTypoCorrection = (q) => {
    let words = q.split(" ");
    let corrected = words.map(w => TYPO_MAP[w] || w);
    return corrected.join(" ");
};

const processAgricultureQuery = (query, lang = "en") => {
    const rawQuery = query || "";
    const cleanQ = normalizeQuery(rawQuery);
    const q = applyTypoCorrection(cleanQ);

    if (lang === "hi") {
        // Organic & Natural Farming
        if (q.includes("organic") || q.includes("जैविक") || q.includes("ऑर्गेनिक") || q.includes("गोबर") || q.includes("कंपोस्ट") || q.includes("वर्मीकंपोस्ट") || q.includes("जीवामृत") || q.includes("नीम")) {
            return "🌱 **जैविक एवं प्राकृतिक खेती (Organic Farming) मार्गदर्शिका:**\n1. **मिट्टी सुधार:** खेत में वर्मीकंपोस्ट (केंचुआ खाद) या पुरानी गोबर खाद 2-3 टन प्रति एकड़ डालें।\n2. **जीवामृत निर्माण:** 200 लीटर पानी + 10 किग्रा देसी गाय का गोबर + 10 लीटर गोमूत्र + 2 किग्रा गुड़ + 2 किग्रा बेसन मिलाकर 48 घंटे छाया में रखें। प्रति एकड़ सिंचाई के साथ दें।\n3. **जैविक उर्वरक:** एज़ोटोबैक्टर, राइज़ोबियम और पीएसबी (PSB) कल्चर का प्रयोग करें।\n4. **प्राकृतिक कीट नियंत्रण:** नीम तेल 1500 ppm (5 एमएल/लीटर) एवं पीले/नीले चिपचिपे कार्ड लगाएं।";
        }
        // Drip & Micro Irrigation
        if (q.includes("drip") || q.includes("ड्रिप") || q.includes("टपक") || q.includes("स्प्रिंकलर") || q.includes("सिंचाई") || q.includes("irrigation") || q.includes("सब्सिडी")) {
            return "💧 **ड्रिप (टपक) एवं सूक्ष्म सिंचाई प्रबंधन:**\n1. **पानी की बचत:** पारंपरिक सिंचाई की तुलना में 40% से 70% तक पानी बचता है।\n2. **उर्वरक बचत (Fertigation):** विद्राव्य उर्वरक सीधे जड़ों तक पहुँचते हैं, जिससे 50% खाद बचती है।\n3. **सब्सिडी सहायता:** पीएम-कृषि सिंचाई योजना (PMKSY) के तहत 55% से 80% तक सब्सिडी उपलब्ध है।\n4. **देखभाल:** ड्रिप लाइनों को महीने में एक बार 1% हाइड्रोक्लोरिक एसिड से फ्लश करें।";
        }
        // Sugarcane
        if (q.includes("गन्ना") || q.includes("sugarcane") || q.includes("ऊख")) {
            return "🎋 **गन्ना उत्पादन एवं प्रबंधन:**\n1. **किस्में:** Co-0238, Co-15023 या Co-86032 का चयन करें। ट्रेंच विधि (4 फीट दूरी) से बुआई करें।\n2. **जल आवश्यकता:** गन्ने को 1500-2500 मिमी जल की आवश्यकता होती है। ड्रिप सिंचन सबसे उपयुक्त है।\n3. **लाल सड़न (Red Rot) रोकथाम:** ट्राइकोडर्मा हरज़ियानम 2.5 किग्रा/एकड़ गोबर खाद में मिलाकर दें।";
        }
        // Soybean
        if (q.includes("सोयाबीन") || q.includes("soybean") || q.includes("सोया")) {
            return "🌱 **सोयाबीन फसल प्रबंधन:**\n1. **बीज उपचार:** राइज़ोबियम एवं पीएसबी कल्चर (5 ग्राम/किग्रा बीज) से उपचारित करें।\n2. **उर्वरक:** NPK 20:60:40 + सल्फर 10 किग्रा/एकड़ दें।\n3. **पीला मोज़ेक वायरस:** सफेद मक्खी नियंत्रण हेतु थायामेथॉक्सम 25% WG (0.5 ग्राम/लीटर) का छिड़काव करें।";
        }
        // Groundnut / Peanut
        if (q.includes("मूंगफली") || q.includes("groundnut") || q.includes("peanut")) {
            return "🥜 **मूंगफली प्रबंधन सलाह:**\n1. **जिप्सम प्रयोग:** सुइयां (Pegs) बनते समय 200 किग्रा/एकड़ जिप्सम डालें, जिससे फलियां मजबूत बनती हैं।\n2. **टिक्का रोग नियंत्रण:** मैनकोज़ेब 75% WP (2.5 ग्राम/लीटर) या टेबुकोनाज़ोल का छिड़काव करें।";
        }
        // Onion & Garlic
        if (q.includes("प्याज") || q.includes("प्याज") || q.includes("लहसुन") || q.includes("onion") || q.includes("garlic")) {
            return "🧅 **प्याज एवं लहसुन फसल सुरक्षा:**\n1. **बैंगनी धब्बा (Purple Blotch):** मैनकोज़ेब 2.5 ग्राम/लीटर + स्टेफनोवेट चिपकाए जाने वाले एजेंट का छिड़काव करें।\n2. **थ्रिप्स (थ्रिप्स कीट):** फिप्रोनिल 5% SC (1.5 एमएल/लीटर) या इमिडाक्लोप्रिड का प्रयोग करें।\n3. **भंडारण:** कटाई के बाद 10-15 दिन छाया में सुखाएं (Curing)।";
        }
        // Tomato & Potato
        if (q.includes("टमाटर") || q.includes("tomato") || q.includes("आलू") || q.includes("potato")) {
            return "🍅 **टमाटर एवं आलू प्रबंधन:**\n1. **अगेती व पिछेती झुलसा (Blight):** कॉपर ऑक्सीक्लोराइड 3 ग्राम/लीटर या क्लोरोथैलोनिल 2 ग्राम/लीटर का छिड़काव करें।\n2. **फल छेदक/सुंडी:** इमामेक्टिन बेंजोएट 5% SG (0.4 ग्राम/लीटर) का प्रयोग करें।";
        }
        // Maize / Corn
        if (q.includes("मक्का") || q.includes("maize") || q.includes("corn") || q.includes("भुट्टा")) {
            return "🌽 **मक्का उत्पादन एवं फॉल आर्मीवर्म नियंत्रण:**\n1. **फॉल आर्मीवर्म (FAW):** पोंगे में स्पिनेटोरम 11.7% SC (0.5 एमएल/लीटर) या इमामेक्टिन बेंजोएट का छिड़काव करें।\n2. **उर्वरक:** NPK 120:60:40 किग्रा/हेक्टेयर तीन किस्तों में दें।";
        }
        // Mustard
        if (q.includes("सरसों") || q.includes("mustard") || q.includes("राय")) {
            return "🌼 **सरसों (Mustard) फसल सुरक्षा:**\n1. **माहो/चेपा (Aphids):** इमिडाक्लोप्रिड 17.8% SL (0.5 एमएल/लीटर) या डिमेथॉएट का छिड़काव करें।\n2. **सल्फर:** तेल प्रतिशत बढ़ाने के लिए 10 किग्रा एलिमेंटल सल्फर प्रति एकड़ डालें।";
        }
        // Pulses (Gram, Moong, Arhar)
        if (q.includes("चना") || q.includes("मूंग") || q.includes("अरहर") || q.includes("तुअर") || q.includes("दाल") || q.includes("pulse")) {
            return "🫘 **दलहन (चना/मूंग/अरहर) प्रबंधन:**\n1. **बीज उपचार:** राइज़ोबियम कल्चर व ट्राइकोडर्मा (4 ग्राम/किग्रा) से उपचारित करें।\n2. **फली छेदक सुंडी:** इंडोक्साकार्ब 14.5% SC (0.5 एमएल/लीटर) या फेरोमोन ट्रैप लगाएं।\n3. **उर्वरक:** NPK 20:50:20 किग्रा/हेक्टेयर पर्याप्त है।";
        }
        // Fruits (Mango, Banana, Citrus, Papaya)
        if (q.includes("आम") || q.includes("केला") || q.includes("संतरा") || q.includes("पपीता") || q.includes("फल") || q.includes("fruit")) {
            return "🍌 **फल बागवानी प्रबंधन:**\n1. **फल मक्खी नियंत्रण:** मिथाइल यूजेनॉल फेरोमोन ट्रैप लगाएं।\n2. **ड्रिप फर्टिगेशन:** जल घुलनशील NPK 19:19:19 का प्रयोग ड्रिप द्वारा करें।\n3. **रोग नियंत्रण:** तांबा फफूंदनाशी (Copper Oxychloride) 3 ग्राम/लीटर का छिड़काव करें।";
        }
        // Weed Control
        if (q.includes("खरपतवार") || q.includes("घास") || q.includes("weed") || q.includes("निंदाई")) {
            return "🌿 **खरपतवार नियंत्रण (Weed Management):**\n1. **बुआई पूर्व (Pre-emergence):** पेंडिमेथालिन 38.7% CS (700 एमएल/एकड़) बुआई के 48 घंटे के भीतर छिड़कें।\n2. **खड़ी फसल (Post-emergence):** चौड़ी पत्ती के लिए 2,4-D एवं संकरी पत्ती के लिए क्विज़ालोफॉस-इथाइल का प्रयोग करें।";
        }
        // Leaf Blight & Disease
        if (q.includes("झुलसा") || q.includes("blight") || q.includes("रोग") || q.includes("disease") || q.includes("फफूंद") || q.includes("दवा")) {
            return "🌿 **फसल रोग (Leaf Blight/फफूंद) नियंत्रण:**\n1. **प्राथमिक छिड़काव:** मैनकोज़ेब 75% WP (2.5 ग्राम/लीटर पानी) का तुरंत प्रयोग करें।\n2. **गंभीर संक्रमण:** कॉपर ऑक्सीक्लोराइड 3 ग्राम/लीटर या हेक्साकोनाज़ोल 5% EC (1 एमएल/लीटर) छिड़कें।\n3. **सावधानी:** संक्रमित पत्तियों को हटा दें और जल निकासी सुदृढ़ करें।";
        }
        // Crops: Wheat
        if (q.includes("गेहूं") || q.includes("wheat")) {
            return "🌾 **गेहूं की खेती की सलाह:**\n1. **उन्नत किस्में:** HD-2967, DBW-187, या PBW-550 का चयन करें।\n2. **महत्वपूर्ण सिंचाई:** बुआई के 21 दिनों बाद (CRI अवस्था) पहली सिंचाई अति आवश्यक है।\n3. **उर्वरक:** 45 किग्रा यूरिया + 50 किग्रा DAP प्रति एकड़ दें।";
        }
        // Crops: Rice/Paddy
        if (q.includes("धान") || q.includes("चावल") || q.includes("rice") || q.includes("paddy")) {
            return "🌾 **धान (चावल) की खेती:**\n1. **पानी प्रबंधन:** रोपाई के समय खेत में 2-3 सेमी पानी बनाए रखें।\n2. **खैरा रोग:** जिंक की कमी से होने वाले खैरा रोग हेतु जिंक सल्फेट (21%) 10 किग्रा/एकड़ दें।\n3. **खरपतवार:** रोपाई के 3-4 दिन में प्रीटिलाक्लोर 50% EC छिड़कें।";
        }
        // Crops: Cotton
        if (q.includes("कपास") || q.includes("cotton")) {
            return "🌱 **कपास प्रबंधन:**\n1. **गुलाबी सुंडी (Pink Bollworm):** फेरोमोन ट्रैप एवं कामगंध ट्रैप लगाएं।\n2. **सफेद मक्खी:** इमिडाक्लोप्रिड 17.8% SL (0.5 एमएल/लीटर) या नीम तेल (1500 ppm) का छिड़काव करें।";
        }
        // NPK Values & Fertilizers
        if (q.includes("npk") || q.includes("n p k")) {
            return "🧪 **NPK मान एवं उर्वरक मार्गदर्शिका:**\n1. **नाइट्रोजन (N):** वानस्पतिक वृद्धि और हरी पत्तियों के विकास हेतु।\n2. **फास्फोरस (P):** जड़ों के विकास और फूलों व बीजों के निर्माण हेतु।\n3. **पोटाश (K):** रोग प्रतिरोधक क्षमता, सूखा सहनशीलता एवं दाने का वजन बढ़ाने हेतु।\n4. **आदर्श अनुपात:** अनाज फसलों हेतु 4:2:1 (N:P:K) का प्रयोग करें।";
        }
        // Soil & Fertilizer
        if (q.includes("खाद") || q.includes("उर्वरक") || q.includes("fertilizer") || q.includes("यूरिया") || q.includes("मिट्टी") || q.includes("soil") || q.includes("ph")) {
            return "🧪 **मिट्टी स्वास्थ्य एवं उर्वरक प्रबंधन:**\n1. **आदर्श पीएच (pH):** 6.5 से 7.5 होना चाहिए।\n2. **संतुलित उर्वरक:** मृदा स्वास्थ्य कार्ड (Soil Health Card) के अनुसार NPK एवं जिंक सल्फेट दें।\n3. **यूरिया प्रयोग:** यूरिया को एक साथ न देकर 2-3 किस्तों में दें।";
        }
        // Schemes & PM-KISAN & KUSUM & Insurance
        if (q.includes("योजना") || q.includes("pm kisan") || q.includes("पीएम किसान") || q.includes("बीमा") || q.includes("kusum") || q.includes("कुसुम") || q.includes("केसीसी") || q.includes("ऋण")) {
            return "🏛️ **सरकारी योजनाएं व वित्तीय सहायता:**\n1. **PM-KISAN:** पात्र किसानों को ₹6,000 प्रति वर्ष 3 किस्तों में मिलते हैं।\n2. **PM-KUSUM:** सोलर पंप स्थापना हेतु 60% से 90% तक सरकारी अनुदान।\n3. **PM फसल बीमा योजना:** रबी हेतु 1.5% एवं खरीफ हेतु 2% प्रीमियम पर फसल बीमा।\n4. **KCC:** कम ब्याज दर पर आसान कृषि ऋण।";
        }
        // Weather
        if (q.includes("मौसम") || q.includes("weather") || q.includes("बारिश") || q.includes("तापमान")) {
            return "☁️ **मौसम सलाह:** किसान मित्र AI के Weather सेक्शन में लाइव तापमान और बारिश का पूर्वानुमान देखें। वर्षा से पूर्व कीटनाशक छिड़काव रोक दें।";
        }
        // Mandi & Storage
        if (q.includes("मंडी") || q.includes("भाव") || q.includes("मूल्य") || q.includes("बाजार") || q.includes("भंडारण") || q.includes("storage")) {
            return "🏬 **मंडी भाव एवं अनाज भंडारण:**\n1. **नमी मात्रा:** अनाज भंडारण से पूर्व नमी की मात्रा 12% से कम रखें।\n2. **e-NAM पोर्टल:** e-NAM पोर्टल या ऐप से नजदीकी मंडियों के ताजा भाव जांचें।";
        }
        // Greetings
        if (q.includes("हेलो") || q.includes("नमस्ते") || q.includes("hi") || q.includes("hello")) {
            return "👋 **नमस्ते! मैं किसान मित्र AI हूँ।**\nआप मुझसे फसल, ड्रिप सिंचाई, जैविक खेती, बीमारी का इलाज, बीज, उर्वरक, मौसम या सरकारी योजनाओं के बारे में पूछ सकते हैं।";
        }

        // Dynamic Contextual Intent Synthesizer for Hindi
        let topicFocus = "कृषि सलाह";
        let detailPoints = [
            "**मृदा परीक्षण:** मिट्टी की पीएच (pH) और पोषक तत्वों की जांच अवश्य करवाएं।",
            "**संतुलित पोषण:** जैविक खाद (गोबर/वर्मीकंपोस्ट) के साथ आवश्यकतानुसार NPK उर्वरक का प्रयोग करें।",
            "**जल प्रबंधन:** ड्रिप या स्प्रिंकलर प्रणाली अपनाकर जल की बचत करें।",
            "**पौध सुरक्षा:** रोगों एवं कीटों के शुरुआती लक्षण दिखते ही नीम तेल या अनुशंसित दवा का प्रयोग करें।"
        ];

        if (q.includes("पानी") || q.includes("सिंचाई") || q.includes("जल")) {
            topicFocus = "सिंचाई एवं जल प्रबंधन";
            detailPoints[2] = "**ड्रिप प्रणाली:** ड्रिप सिंचाई से 50% पानी की बचत होती है और खाद सीधे जड़ों में पहुंचती है।";
        } else if (q.includes("कीट") || q.includes("कीड़ा") || q.includes("इल्ली") || q.includes("मक्खी")) {
            topicFocus = "कीट एवं सुंडी नियंत्रण";
            detailPoints[3] = "**कीट रोकथाम:** नीम तेल (1500 ppm @ 5ml/L) का छिड़काव करें या फेरोमोन ट्रैप लगाएं।";
        } else if (q.includes("खाद") || q.includes("उर्वरक") || q.includes("एनपीके")) {
            topicFocus = "उर्वरक एवं पोषण प्रबंधन";
            detailPoints[1] = "**संतुलित खुराक:** 4:2:1 (N:P:K) अनुपात में उर्वरक दें और यूरिया को 2-3 किस्तों में विभाजित करें।";
        } else if (q.includes("बीमारी") || q.includes("रोग") || q.includes("धब्बा") || q.includes("पत्ती")) {
            topicFocus = "फसल बीमारी एवं उपचार";
            detailPoints[3] = "**फफूंदनाशी:** मैनकोज़ेब 75% WP (2.5 ग्राम/लीटर) या कॉपर ऑक्सीक्लोराइड का छिड़काव करें।";
        }

        return `🤖 **किसान मित्र ${topicFocus} ("${rawQuery}"):**\n\n1. ${detailPoints[0]}\n2. ${detailPoints[1]}\n3. ${detailPoints[2]}\n4. ${detailPoints[3]}`;

    } else if (lang === "mr") {
        // Organic & Natural Farming
        if (q.includes("organic") || q.includes("सेंद्रिय") || q.includes("ऑर्गेनिक") || q.includes("शेणखत") || q.includes("गांडूळ") || q.includes("जीवामृत") || q.includes("लिंबोळी")) {
            return "🌱 **सेंद्रिय व नैसर्गिक शेती (Organic Farming) मार्गदर्शक:**\n१. **माती सुधारणा:** रासायनिक खतांऐवजी गांडूळ खत (Vermicompost) किंवा चांगले कुजलेले शेणखत २-३ टन प्रति एकरी वापरा.\n२. **जीवामृत तयार करणे:** २०० लीटर पाणी + १० किलो देशी गाईचे शेण + १० लीटर गोमूत्र + २ किलो गूळ + २ किलो बेसन मिसळून ४८ तास सावलीत ठेवा. सिंचनासोबत द्या.\n३. **जैविक खते:** अॅझोटोबॅक्टर, रायझोबियम व पीएसबी (PSB) जिवाणू संवर्धक वापरा.\n४. **कीड नियंत्रण:** निंबोळी अर्क १५०० ppm (५ मिली/लीटर) व पिवळे चिकट सापळे वापरा.";
        }
        // Drip Irrigation
        if (q.includes("drip") || q.includes("ड्रिप") || q.includes("ठिबक") || q.includes("तुषार") || q.includes("सिंचन") || q.includes("irrigation") || q.includes("अनुदान")) {
            return "💧 **ठिबक सिंचनाचे (Drip Irrigation) मुख्य फायदे:**\n१. **पाण्याची बचत:** पारंपारिक पद्धतीपेक्षा ४०% ते ७०% पाण्याची बचत होते.\n२. **उत्पादनात वाढ:** पिकांच्या मुळांना सतत योग्य ओलावा मिळाल्यामुळे २०% ते ३०% जास्त उत्पादन मिळते.\n३. **खतांची बचत (Fertigation):** विद्राव्य खते थेट मुळांपर्यंत पोहोचल्याने ५०% खतांची बचत होते.\n४. **शासकीय अनुदान:** मुख्यमंत्री/प्रधानमंत्री कृषी सिंचन योजनेअंतर्गत ५५% ते ८०% अनुदान उपलब्ध आहे.";
        }
        // Sugarcane
        if (q.includes("ऊस") || q.includes("sugarcane") || q.includes("उसाची")) {
            return "नात **ऊस पीक व्यवस्थापन सल्ला:**\n१. **वाण:** Co-86032 किंवा Co-0238 वाण निवडा. पट्ट्या पद्धतीने (४ ते ५ फूट अंतर) लागवड करा.\n२. **पाणी व्यवस्थापन:** उसाला १५००-२५०० मिमी पाण्याची गरज असते. ठिबक सिंचन अत्यंत फायदेशीर ठरते.\n३. **तांबेरा व करपा नियंत्रण:** ट्रायकोडेर्मा २.५ किलो/एकरी शेणखतात मिसळून द्या.";
        }
        // Soybean
        if (q.includes("सोयाबीन") || q.includes("soybean")) {
            return "🌱 **सोयाबीन पीक व्यवस्थापन:**\n१. **बियाणे प्रक्रिया:** रायझोबियम व पीएसबी जिवाणू संवर्धक (५ ग्रॅम/किलो बियाणे) लावा.\n२. **खत मात्रा:** NPK २०:६०:४० + १० किलो सल्फर प्रति एकरी द्या.\n३. **येलो मोझॅक नियंत्रण:** पांढऱ्या माशीसाठी थायामेथॉक्सम २५% WG (०.५ ग्रॅम/लीटर) फवारा.";
        }
        // Groundnut
        if (q.includes("भुईमूग") || q.includes("मूंगफली") || q.includes("groundnut")) {
            return "🥜 **भुईमूग पीक सल्ला:**\n१. **जिप्सम वापर:** आऱ्या सुटताना (Pegging) प्रति एकरी २०० किलो जिप्सम टाका.\n२. **टिक्का रोग:** मँकोझेब ७५% WP (२.५ ग्रॅम/लीटर) किंवा टेबुकोनाझोल फवारा.";
        }
        // Onion & Garlic
        if (q.includes("कांदा") || q.includes("लसूण") || q.includes("onion") || q.includes("garlic")) {
            return "🧅 **कांदा व लसूण पीक संरक्षण:**\n१. **पानावरील करपा (Purple Blotch):** मँकोझेब २.५ ग्रॅम/लीटर + स्टिकर फवारा.\n२. **फुलकिडे (Thrips):** फिप्रोनिल ५% SC (१.५ मिली/लीटर) किंवा इमिडाक्लोप्रिड वापरा.\n३. **साठवणूक:** काढणीनंतर १०-१५ दिवस कांदा सावलीत वाळवा.";
        }
        // Tomato & Potato
        if (q.includes("टोमॅटो") || q.includes("बटाटा") || q.includes("tomato") || q.includes("potato")) {
            return "🍅 **टोमॅटो व बटाटा पीक रक्षण:**\n१. **करपा रोग (Blight):** कॉपर ऑक्सिक्लोराइड ३ ग्रॅम/लीटर किंवा क्लोरोथॅलोनिल २ ग्रॅम/लीटर फवारा.\n२. **फळ पोखरणारी अळी:** इमॅमेक्टिन बेंझोएट ५% SG (०.४ ग्रॅम/लीटर) वापरा.";
        }
        // Cotton
        if (q.includes("कापूस") || q.includes("cotton")) {
            return "🌱 **कापूस पीक व्यवस्थापन:**\n१. **गुलाबी बोंड अळी:** कामगंध सापळे लावा.\n२. **पांढरी माशी:** इमिडाक्लोप्रिड १७.८% SL (०.५ मिली/लीटर) किंवा निंबोळी अर्क (१५०० ppm) फवारा.";
        }
        // Wheat
        if (q.includes("गहू") || q.includes("wheat")) {
            return "🌾 **गहू लागवड सल्ला:**\n१. **सुधारित वाण:** HD-2967 किंवा DBW-187 वापरा.\n२. **पहिली ओलिताची पाळी:** पेरणीनंतर २१ दिवसांनी (मुकुटमुळे फुटण्याच्या वेळी) देणे अत्यंत गरजेचे आहे.\n३. **खत मात्रा:** प्रति एकरी ४५ किलो युरिया + ५० किलो DAP द्या.";
        }
        // Rice/Paddy
        if (q.includes("भात") || q.includes("तांदूळ") || q.includes("rice") || q.includes("धान")) {
            return "🌾 **भात (धान) पीक सल्ला:**\n१. **पाणी ओलावा:** पुनर्लागवडीच्या वेळी शेतात २-३ सेंमी पाणी कायम ठेवा.\n२. **खैरा रोग:** झिंक सल्फेट (२१%) १० किलो/एकरी टाका.\n३. **तण नियंत्रण:** प्रीटिलाक्लोर ५०% EC वापरा.";
        }
        // Schemes & Insurance
        if (q.includes("योजना") || q.includes("पीएम किसान") || q.includes("सबसिडी") || q.includes("अनुदान") || q.includes("विमा") || q.includes("कर्ज")) {
            return "🏛️ **शासकीय योजना व आर्थिक मदत:**\n१. **PM-KISAN:** पात्र शेतकऱ्यांना वर्षाला ६,००० रुपये ३ हप्त्यांमध्ये मिळतात.\n२. **PM-KUSUM:** सोलर पंप बसवण्यासाठी ६०% ते ९०% पर्यंत शासकीय अनुदान.\n३. **पीक विमा (PMFBY):** रब्बीसाठी १.५% व खरीपासाठी २% हप्त्यावर पीक विमा संरक्षण.\n४. **KCC:** सवलतीच्या दरात पीक कर्ज.";
        }
        // Weather
        if (q.includes("हवामान") || q.includes("weather") || q.includes("पाऊस")) {
            return "☁️ **हवामान अंदाज:** अॅपमधील Weather विभागात थेट हवामान अंदाज पहा. पावसाची शक्यता असल्यास कीटकनाशक फवारणी पुढे ढकला.";
        }
        // Mandi
        if (q.includes("बाजार") || q.includes("भाव") || q.includes("साठवणूक") || q.includes("mandi")) {
            return "🏬 **बाजारभाव व धान्य साठवणूक:**\n१. धान्य साठवण्यापूर्वी त्यात १२% पेक्षा कमी ओलावा असावा.\n२. e-NAM पोर्टलद्वारे जवळच्या बाजार समितीचे दर तपासा.";
        }
        // Greetings
        if (q.includes("नमस्कार") || q.includes("हॅलो") || q.includes("hi") || q.includes("hello")) {
            return "👋 **नमस्कार! मी किसान मित्र AI आहे.**\nपिके, ठिबक सिंचन, सेंद्रिय शेती, खते, हवामान किंवा रोगांबद्दल मला विचारू शकता.";
        }

        // Dynamic Contextual Intent Synthesizer for Marathi
        let topicFocus = "शेती सल्ला";
        let detailPoints = [
            "**माती परीक्षण:** मातीचा सामू (pH) आणि सुपीकता तपासून घ्या.",
            "**संतुलित खत मात्रा:** सेंद्रिय खतांसोबत (शेणखत/गांडूळ खत) माती चाचणीनुसार NPK द्या.",
            "**पाणी बचत:** ठिबक किंवा तुषार सिंचन पद्धतीचा वापर करा.",
            "**पीक संरक्षण:** कीड किंवा रोगाची लक्षणे दिसताच निंबोळी अर्क किंवा योग्य औषध फवारा."
        ];

        if (q.includes("पाणी") || q.includes("सिंचन") || q.includes("ओलावा")) {
            topicFocus = "सिंचन व पाणी व्यवस्थापन";
            detailPoints[2] = "**ठिबक सिंचन:** ठिबक पद्धतीमुळे ५०% पाण्याची बचत होते व खते थेट मुळांपर्यंत पोहोचतात.";
        } else if (q.includes("कीड") || q.includes("अळी") || q.includes("माशी") || q.includes("मावा")) {
            topicFocus = "कीड व अळी नियंत्रण";
            detailPoints[3] = "**कीड नियंत्रण:** निंबोळी अर्क (१५०० ppm @ ५ मिली/लीटर) फवारा किंवा कामगंध सापळे लावा.";
        } else if (q.includes("खत") || q.includes("युरिया") || q.includes("एनपीके")) {
            topicFocus = "खत व पोषण व्यवस्थापन";
            detailPoints[1] = "**समतोल खते:** ४:२:१ (N:P:K) प्रमाणात खते द्या आणि युरिया टप्प्याटप्प्याने द्या.";
        }

        return `🤖 **किसान मित्र ${topicFocus} ("${rawQuery}"):**\n\n१. ${detailPoints[0]}\n२. ${detailPoints[1]}\n३. ${detailPoints[2]}\n४. ${detailPoints[3]}`;

    } else {
        // English
        // Greetings & Assistant Identity
        if (/\b(hello|hi|hey|namaste|greetings|who are you|what can you do|help)\b/i.test(q) || q.includes("options") || q.includes("kisan mitra")) {
            return "👋 **Hello! I am your Kisan Mitra AI Assistant.**\nI can help you with:\n1. **Crop Cultivation:** Wheat, Rice, Sugarcane, Soybean, Cotton, Groundnut, Pulses, Vegetables & Fruits.\n2. **Soil & Fertilizers:** Soil pH, NPK dosage ratios, Organic FYM/Vermicompost, Urea splitting & Zinc.\n3. **Pest & Disease Control:** Organic Neem oil, Fungicides (Mancozeb/Copper Oxychloride), and Insecticides.\n4. **Irrigation & Water:** Drip/Sprinkler micro-irrigation systems & PMKSY government subsidies.\n5. **Government Schemes:** PM-KISAN (₹6000/yr), PM-KUSUM Solar Pumps, PMFBY Crop Insurance & KCC Loans.";
        }
        // Specific Crops (Wheat, Rice, Sugarcane, Soybean, Cotton, Groundnut, Onion, Tomato/Potato, Maize, Mustard, Pulses, Fruits)
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
        // Organic & Natural Farming
        if (q.includes("organic") || q.includes("compost") || q.includes("vermicompost") || q.includes("cow dung") || q.includes("neem cake") || q.includes("biofertilizer") || q.includes("bio fertilizer") || q.includes("jeevamrut")) {
            return "🌱 **Organic & Natural Farming Guide:**\n1. **Soil Health:** Enrich soil with Vermicompost or well-decomposed FYM @ 2-3 tonnes/acre.\n2. **Jeevamrut Formulation:** Mix 200L water + 10kg cow dung + 10L cow urine + 2kg jaggery + 2kg pulse flour. Ferment for 48 hrs and apply via irrigation.\n3. **Bio-fertilizers:** Apply Azotobacter, Rhizobium, and PSB (Phosphate Solubilizing Bacteria) cultures.\n4. **Pest Management:** Spray Neem Oil (1500 ppm @ 5ml/L) and install yellow/blue sticky traps.";
        }
        // Seed & Crop Water Consumption
        if (q.includes("most water") || q.includes("high water") || q.includes("water use") || q.includes("water usage") || q.includes("water consumption") || q.includes("water requirement") || (q.includes("seed") && q.includes("water"))) {
            return "💧 **Seed & Crop Water Consumption Guide:**\n1. **High Water Consuming Crops:**\n   - **Sugarcane:** 1,500 – 2,500 mm per crop cycle.\n   - **Paddy / Rice:** 1,200 – 1,500 mm (Requires continuous standing water).\n   - **Banana:** 1,200 – 2,200 mm.\n   - **Cotton:** 700 – 1,300 mm.\n2. **Moderate Water Crops:** Wheat (450–650 mm), Maize (500–800 mm), Potato (500–700 mm).\n3. **Low Water / Drought Tolerant Crops:** Bajra (250–350 mm), Chickpea/Gram (250–350 mm), Mustard (300–400 mm).\n4. **Water Saving Tip:** Use Drip or Sprinkler systems to cut water consumption by up to 50%.";
        }
        // Drip & Micro Irrigation
        if (q.includes("drip") || q.includes("sprinkler") || q.includes("fertigation") || q.includes("micro irrigation") || (q.includes("irrigation") && (q.includes("benefit") || q.includes("subsidy") || q.includes("type")))) {
            return "💧 **Key Benefits of Drip Irrigation:**\n1. **Water Savings:** Saves 40% to 70% water compared to flood irrigation by delivering water directly to root zones.\n2. **Increased Yield:** Boosts crop yields by 20% to 30% due to uniform root moisture.\n3. **Fertigation Efficiency:** Soluble fertilizers are applied directly through water lines, reducing nutrient wastage by 50%.\n4. **Government Subsidy:** Eligible for 55% to 80% subsidy under PM Krishi Sinchayee Yojana (PMKSY).";
        }
        // Weed Control
        if (q.includes("weed") || q.includes("herbicide")) {
            return "🌿 **Weed Control Strategy:**\n1. **Pre-Emergence:** Apply Pendimethalin 38.7% CS @ 700ml/acre within 48 hours of sowing.\n2. **Post-Emergence:** Use Quizalofop-p-ethyl for grassy weeds or 2,4-D for broadleaf weeds.";
        }
        // Leaf Blight & Disease
        if (q.includes("blight") || q.includes("disease") || q.includes("cure") || q.includes("treatment") || q.includes("fungicide") || q.includes("spray") || q.includes("fungus") || q.includes("mildew")) {
            return "🌿 **Crop Disease & Leaf Blight Management:**\n1. **Fungicide Spray:** Apply Mancozeb 75% WP @ 2.5g/L water or Copper Oxychloride @ 3g/L for immediate leaf spot/blight control.\n2. **Powdery Mildew:** Spray Hexaconazole 5% EC (1ml/L) or Wettable Sulphur (3g/L).\n3. **Cultural Practices:** Remove heavily infected foliage, avoid overhead sprinkler watering, and maintain clean field drainage.";
        }
        // NPK Values & Fertilizers
        if (q.includes("npk") || q.includes("n p k")) {
            return "🧪 **NPK Values & Fertilizer Advisory:**\n1. **Nitrogen (N):** Drives vegetative shoot growth, stem strength, and green foliage development.\n2. **Phosphorus (P):** Stimulates early root establishment, flower formation, and seed development.\n3. **Potassium (K):** Enhances disease resistance, drought tolerance, grain weight, and overall crop quality.\n4. **Recommended Ratio:** Standard cereal crops thrive on a **4:2:1 (N:P:K)** ratio. Always base precise fertilizer doses on Soil Health Card tests.";
        }
        // Soil & Fertilizers
        if (q.includes("soil") || q.includes("ph") || q.includes("fertilizer") || q.includes("fertiliser") || q.includes("urea") || q.includes("dap") || q.includes("potash") || q.includes("zinc") || q.includes("testing")) {
            return "🧪 **Soil Health & Nutrient Management:**\n1. **Ideal Soil pH:** 6.5 to 7.5 is optimal for most crops.\n2. **Balanced NPK:** Base applications on Soil Health Card tests. Use NPK 20:20:20 alongside FYM.\n3. **Micronutrients:** Apply Zinc Sulfate (21%) @ 10kg/acre to correct yellowing and stunted growth.\n4. **Nitrogen Splitting:** Split Urea applications into 2-3 split doses instead of a single heavy dose.";
        }
        // Government Schemes & Solar Pumps
        if (q.includes("scheme") || q.includes("subsidy") || q.includes("subsidies") || q.includes("pm kisan") || q.includes("kusum") || q.includes("kcc") || q.includes("loan") || q.includes("insurance") || q.includes("pmfby")) {
            return "🏛️ **Government Schemes & Subsidies:**\n1. **PM-KISAN:** ₹6,000 annual income support in 3 equal installments for eligible farmers.\n2. **PM-KUSUM:** 60% to 90% subsidy for off-grid and grid-connected solar agricultural pumps.\n3. **PMFBY:** Crop insurance covering yield losses at low premiums (1.5% Rabi, 2% Kharif).\n4. **KCC (Kisan Credit Card):** Concessional crop loans at subsidized interest rates.";
        }
        // Weather
        if (q.includes("weather") || q.includes("rain") || q.includes("monsoon") || q.includes("temperature") || q.includes("forecast")) {
            return "☁️ **Weather & Climate Advisory:**\nCheck the live Weather tab in Kisan Mitra AI. Avoid spraying pesticides or applying top-dress fertilizers right before heavy rains to prevent runoff.";
        }
        // Mandi & Storage
        if (q.includes("mandi") || q.includes("price") || q.includes("market") || q.includes("storage") || q.includes("warehouse")) {
            return "🏬 **Mandi Prices & Grain Storage:**\n1. Ensure grain moisture is below 12% before storage to prevent mold and insect infestation.\n2. Check real-time Mandi prices via the e-NAM portal to secure optimum sales prices.";
        }

        // Dynamic Contextual Intent Synthesizer for English
        let topicFocus = "Farming Advisory";
        let detailPoints = [
            "**Soil Testing:** Perform a soil health test to evaluate pH level and nutrient deficiencies.",
            "**Nutrient Management:** Combine organic FYM/vermicompost with balanced NPK fertilizers.",
            "**Water Conservation:** Adopt Drip or Sprinkler systems to optimize water use efficiency.",
            "**Integrated Pest Management:** Inspect crops regularly and apply Neem Oil or recommended treatments."
        ];

        if (q.includes("water") || q.includes("irrigation") || q.includes("drainage")) {
            topicFocus = "Irrigation & Water Advisory";
            detailPoints[2] = "**Drip System:** Drip irrigation reduces water consumption by up to 50% while delivering nutrients directly to root zones.";
        } else if (q.includes("pest") || q.includes("insect") || q.includes("worm") || q.includes("bug") || q.includes("fly")) {
            topicFocus = "Pest & Insect Management";
            detailPoints[3] = "**Pest Control:** Install yellow sticky cards, pheromone traps, or spray Neem Oil (1500 ppm @ 5ml/L).";
        } else if (q.includes("fertilizer") || q.includes("manure") || q.includes("urea") || q.includes("npk")) {
            topicFocus = "Nutrient & Fertilizer Advisory";
            detailPoints[1] = "**Balanced Dosage:** Follow a 4:2:1 (N:P:K) ratio for cereal crops and split Urea doses into 2-3 top dressings.";
        } else if (q.includes("disease") || q.includes("blight") || q.includes("spot") || q.includes("leaf") || q.includes("fungus")) {
            topicFocus = "Crop Health & Disease Advisory";
            detailPoints[3] = "**Fungicide Treatment:** Spray Mancozeb 75% WP @ 2.5g/L or Copper Oxychloride @ 3g/L for immediate foliage protection.";
        } else if (q.includes("price") || q.includes("mandi") || q.includes("market") || q.includes("sell")) {
            topicFocus = "Market & Mandi Price Advisory";
            detailPoints[0] = "**Market Rates:** Check nearby mandi rates on the e-NAM portal and dry grains to < 12% moisture before storage.";
        }

        return `🤖 **Kisan Mitra ${topicFocus} for "${rawQuery}":**\n\n1. ${detailPoints[0]}\n2. ${detailPoints[1]}\n3. ${detailPoints[2]}\n4. ${detailPoints[3]}`;
    }
};

const { generateGeminiText } = require("../config/geminiService");

const callGeminiAPI = async (prompt, lang = "en") => {
    try {
        const sysInstruction = `You are Kisan Mitra AI, a highly knowledgeable agricultural expert helping Indian farmers. Answer the farmer's question clearly with practical bullet points. Language requested: '${lang}'.`;
        return await generateGeminiText(prompt, sysInstruction);
    } catch (err) {
        console.warn("Gemini API call failed, using internal knowledge engine:", err.message);
    }
    return null;
};

const handleChatQuery = async (req, res) => {
    try {
        const { query, language } = req.body;
        if (!query || !query.trim()) {
            return res.status(400).json({
                success: false,
                message: "Query parameter is required",
            });
        }

        const userLang = language || req.body.lang || "en";
        
        // Try Gemini API if key is present
        let reply = await callGeminiAPI(query, userLang);
        
        // Fallback to internal Agricultural Knowledge Engine
        if (!reply) {
            reply = processAgricultureQuery(query, userLang);
        }

        res.json({
            success: true,
            query,
            language: userLang,
            reply,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const handleVoiceQuery = async (req, res) => {
    try {
        const { query, language } = req.body;
        if (!query || !query.trim()) {
            return res.status(400).json({
                success: false,
                message: "Voice query text is required",
            });
        }

        const userLang = language || "en";
        
        let reply = await callGeminiAPI(query);
        if (!reply) {
            reply = processAgricultureQuery(query, userLang);
        }

        res.json({
            success: true,
            query,
            language: userLang,
            reply,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    handleChatQuery,
    handleVoiceQuery,
    processAgricultureQuery,
};

