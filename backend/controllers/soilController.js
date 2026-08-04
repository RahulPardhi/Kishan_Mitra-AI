const { generateGeminiText } = require("../config/geminiService");

const BENCHMARK_SOIL_DATA = [
    // --- MAHARASHTRA BENCHMARKS ---
    {
        locations: ["nagpur"],
        soilTypeMatch: ["black"],
        health: { en: "Fertile Soil", hi: "उर्वर मिट्टी", mr: "सुपीक माती" },
        recommendedCrop: { en: "Cotton, Soybean, Wheat (🌱)", hi: "कपास, सोयाबीन, गेहूं (🌱)", mr: "कापूस, सोयाबीन, गहू (🌱)" },
        suggestedFertilizer: { en: "Organic Manure + NPK 20:10:10", hi: "जैविक खाद + NPK 20:10:10", mr: "सेंद्रिय खत + NPK 20:10:10" },
        advice: {
            en: "Soil is fertile. Suitable for Cotton, Soybean, Wheat. Add organic manure and maintain irrigation.",
            hi: "मिट्टी उर्वर है। कपास, सोयाबीन, गेहूं के लिए उपयुक्त। जैविक खाद डालें और सिंचाई बनाए रखें।",
            mr: "माती सुपीक आहे. कापूस, सोयाबीन, गव्हासाठी योग्य. सेंद्रिय खत घाला आणि सिंचन ठेवा."
        }
    },
    {
        locations: ["nashik"],
        soilTypeMatch: ["loamy", "loam"],
        health: { en: "Excellent Soil", hi: "उत्कृष्ट मिट्टी", mr: "उत्कृष्ट माती" },
        recommendedCrop: { en: "Grapes, Onion, Tomato, Vegetables (🍇)", hi: "अंगूर, प्याज, टमाटर, सब्जियां (🍇)", mr: "द्राक्षे, कांदा, टोमॅटो, भाजीपाला (🍇)" },
        suggestedFertilizer: { en: "Balanced NPK 20:20:20 + Micronutrients", hi: "संतुलित NPK 20:20:20 + सूक्ष्म पोषक तत्व", mr: "संतुलित NPK 20:20:20 + सूक्ष्म अन्नद्रव्ये" },
        advice: {
            en: "Excellent soil. Suitable for Grapes, Onion, Tomato, Vegetables. Continue balanced fertilization.",
            hi: "उत्कृष्ट मिट्टी। अंगूर, प्याज, टमाटर, सब्जियों के लिए उपयुक्त। संतुलित उर्वरक जारी रखें।",
            mr: "उत्कृष्ट माती. द्राक्षे, कांदा, टोमॅटो, भाजीपाल्यासाठी उत्तम. संतुलित खत वापर सुरू ठेवा."
        }
    },
    {
        locations: ["pune"],
        soilTypeMatch: ["red"],
        health: { en: "Medium Fertility", hi: "मध्यम उर्वरता", mr: "मध्यम सुपीकता" },
        recommendedCrop: { en: "Groundnut, Millets, Pulses (🥜)", hi: "मूंगफली, बाजरा/ज्वार, दलहन (🥜)", mr: "भुईमूग, बाजरी, कडधान्ये (🥜)" },
        suggestedFertilizer: { en: "Compost + Single Super Phosphate (SSP) / DAP", hi: "कंपोस्ट + फास्फोरस उर्वरक (SSP/DAP)", mr: "कंपोस्ट + स्फुरद खत (SSP/DAP)" },
        advice: {
            en: "Medium fertility. Suitable for Groundnut, Millets, Pulses. Add compost and phosphorus fertilizer.",
            hi: "मध्यम उर्वरता। मूंगफली, मोटे अनाज, दलहन के लिए उपयुक्त। कंपोस्ट और फास्फोरस खाद डालें।",
            mr: "मध्यम सुपीकता. भुईमूग, बाजरी, कडधान्यांसाठी योग्य. कंपोस्ट आणि स्फुरद खत मिसळा."
        }
    },
    {
        locations: ["kolhapur"],
        soilTypeMatch: ["alluvial"],
        health: { en: "Highly Productive", hi: "अत्यधिक उत्पादक", mr: "अत्यंत उत्पादनक्षम" },
        recommendedCrop: { en: "Sugarcane, Rice, Wheat (🌾)", hi: "गन्ना, धान, गेहूं (🌾)", mr: "ऊस, भात, गहू (🌾)" },
        suggestedFertilizer: { en: "Balanced NPK (12:32:16) + Vermicompost", hi: "संतुलित NPK (12:32:16) + वर्मीकंपोस्ट", mr: "संतुलित NPK (12:32:16) + गांडूळ खत" },
        advice: {
            en: "Highly productive. Suitable for Sugarcane, Rice, Wheat. Maintain balanced NPK.",
            hi: "अत्यधिक उत्पादक मिट्टी। गन्ना, धान, गेहूं के लिए उपयुक्त। संतुलित NPK बनाए रखें।",
            mr: "अत्यंत उत्पादनक्षम माती. ऊस, भात, गव्हासाठी योग्य. संतुलित NPK ठेवा."
        }
    },
    {
        locations: ["aurangabad", "chhatrapati sambhajinagar", "sambhajinagar"],
        soilTypeMatch: ["sandy"],
        health: { en: "Low Water Retention", hi: "कम जल धारण क्षमता", mr: "कमी पाणी धरून ठेवण्याची क्षमता" },
        recommendedCrop: { en: "Groundnut, Watermelon, Pulses (🍉)", hi: "मूंगफली, तरबूज, दलहन (🍉)", mr: "भुईमूग, टरबूज, कडधान्ये (🍉)" },
        suggestedFertilizer: { en: "Organic Compost + NPK 15:15:15 + Drip Irrigation", hi: "जैविक कंपोस्ट + NPK 15:15:15 + ड्रिप सिंचाई", mr: "सेंद्रिय कंपोस्ट + NPK 15:15:15 + ठिबक सिंचन" },
        advice: {
            en: "Low water retention. Suitable for Groundnut, Watermelon. Irrigate frequently and add organic matter.",
            hi: "जल धारण क्षमता कम है। मूंगफली, तरबूज के लिए उपयुक्त। बार-बार सिंचाई करें और जैविक खाद डालें।",
            mr: "पाणी धरून ठेवण्याची क्षमता कमी. भुईमूग, टरबूजसाठी योग्य. वारंवार पाणी द्या व सेंद्रिय खत घाला."
        }
    },
    {
        locations: ["solapur"],
        soilTypeMatch: ["clay"],
        health: { en: "Good Moisture Retention", hi: "उत्तम नमी धारण क्षमता", mr: "उत्तम ओलावा धरून ठेवण्याची क्षमता" },
        recommendedCrop: { en: "Rice, Cotton, Sorghum (🌱)", hi: "धान, कपास, ज्वार (🌱)", mr: "भात, कापूस, ज्वारी (🌱)" },
        suggestedFertilizer: { en: "Potash-enriched NPK (10:10:20) + Organic Manure", hi: "पोटाश युक्त NPK (10:10:20) + गोबर खाद", mr: "पोटॅशयुक्त NPK (10:10:20) + शेणखत" },
        advice: {
            en: "Good moisture retention. Suitable for Rice, Cotton. Avoid overwatering.",
            hi: "नमी धारण क्षमता अच्छी है। धान, कपास के लिए उपयुक्त। अधिक पानी देने से बचें।",
            mr: "ओलावा धरून ठेवण्याची क्षमता चांगली. भात, कापसासाठी योग्य. जास्त पाणी देणे टाळा."
        }
    },
    {
        locations: ["chandrapur"],
        soilTypeMatch: ["red"],
        health: { en: "Slightly Acidic", hi: "हल्की अम्लीय", mr: "किंचित आम्लधर्मी" },
        recommendedCrop: { en: "Pulses and Millets (🌾)", hi: "दलहन एवं मोटे अनाज (🌾)", mr: "कडधान्ये व बाजरी/ज्वारी (🌾)" },
        suggestedFertilizer: { en: "Agricultural Lime (if needed) + SSP + Organic Compost", hi: "कृषि चूना (आवश्यकतानुसार) + एसएसपी + कंपोस्ट", mr: "कृषी चुना (गरजेनुसार) + SSP + सेंद्रिय कंपोस्ट" },
        advice: {
            en: "Slightly acidic. Suitable for Pulses and Millets. Apply lime if needed.",
            hi: "हल्की अम्लीय मिट्टी। दलहन और मोटे अनाज के लिए उपयुक्त। आवश्यकतानुसार चूना मिलाएं।",
            mr: "किंचित आम्लधर्मी माती. कडधान्ये व बाजरीसाठी योग्य. गरजेनुसार चुना वापरा."
        }
    },
    {
        locations: ["latur"],
        soilTypeMatch: ["laterite"],
        health: { en: "Low Fertility", hi: "कम उर्वरता", mr: "कमी सुपीकता" },
        recommendedCrop: { en: "Cashew, Tea, Coffee, Pulses (☕)", hi: "काजू, चाय, कॉफी, दलहन (☕)", mr: "काजू, चहा, कॉफी, कडधान्ये (☕)" },
        suggestedFertilizer: { en: "Organic Compost + Agricultural Lime + Rock Phosphate", hi: "जैविक कंपोस्ट + कृषि चूना + रॉक फास्फेट", mr: "सेंद्रिय कंपोस्ट + कृषी चुना + रॉक फॉस्फेट" },
        advice: {
            en: "Low fertility. Suitable for Cashew, Tea, Coffee. Add compost and lime to improve soil health.",
            hi: "कम उर्वरता। काजू, चाय, कॉफी के लिए उपयुक्त। मिट्टी के स्वास्थ्य में सुधार के लिए कंपोस्ट और चूना डालें।",
            mr: "कमी सुपीकता. काजू, चहा, कॉफीसाठी योग्य. मातीचे आरोग्य सुधारण्यासाठी कंपोस्ट व चुना घाला."
        }
    },
    {
        locations: ["jalgaon"],
        soilTypeMatch: ["black"],
        health: { en: "Fertile Soil", hi: "उर्वर मिट्टी", mr: "सुपीक माती" },
        recommendedCrop: { en: "Banana, Cotton, Sorghum (🍌)", hi: "केला, कपास, ज्वार (🍌)", mr: "केळी, कापूस, ज्वारी (🍌)" },
        suggestedFertilizer: { en: "Organic Manure + Balanced NPK 20:10:10 + Potash", hi: "गोबर खाद + संतुलित NPK 20:10:10 + पोटाश", mr: "शेणखत + संतुलित NPK 20:10:10 + पोटॅश" },
        advice: {
            en: "Fertile soil. Suitable for Banana, Cotton, Sorghum. Maintain balanced nutrients.",
            hi: "उर्वर मिट्टी। केला, कपास, ज्वार के लिए उपयुक्त। संतुलित पोषक तत्व बनाए रखें।",
            mr: "सुपीक माती. केळी, कापूस, ज्वारीसाठी उत्तम. संतुलित पोषक द्रव्ये ठेवा."
        }
    },
    {
        locations: ["amravati"],
        soilTypeMatch: ["black"],
        health: { en: "Good Soil Quality", hi: "अच्छी मिट्टी गुणवत्ता", mr: "चांगली मातीची गुणवत्ता" },
        recommendedCrop: { en: "Cotton, Soybean, Wheat (🌱)", hi: "कपास, सोयाबीन, गेहूं (🌱)", mr: "कापूस, सोयाबीन, गहू (🌱)" },
        suggestedFertilizer: { en: "Organic Manure + NPK 20:10:10 + Drip Irrigation", hi: "जैविक खाद + NPK 20:10:10 + ड्रिप सिंचाई", mr: "सेंद्रिय खत + NPK 20:10:10 + ठिबक सिंचन" },
        advice: {
            en: "Good soil quality. Suitable for Cotton, Soybean, Wheat. Use organic manure and proper irrigation.",
            hi: "अच्छी मिट्टी गुणवत्ता। कपास, सोयाबीन, गेहूं के लिए उपयुक्त। जैविक खाद और उचित सिंचाई का उपयोग करें।",
            mr: "चांगली मातीची गुणवत्ता. कापूस, सोयाबीन, गव्हासाठी योग्य. सेंद्रिय खत व योग्य पाणी द्या."
        }
    },

    // --- ALL OTHER INDIAN STATES & REGIONS ---
    {
        locations: ["punjab", "haryana", "ludhiana", "amritsar", "karnal", "hisar"],
        soilTypeMatch: ["alluvial", "loamy", "loam"],
        health: { en: "Highly Fertile Alluvial Soil", hi: "अत्यंत उर्वर जलोढ़ मिट्टी", mr: "अत्यंत सुपीक गाळाची माती" },
        recommendedCrop: { en: "Wheat, Paddy/Rice, Mustard, Sugarcane, Cotton (🌾)", hi: "गेहूं, धान, सरसों, गन्ना, कपास (🌾)", mr: "गहू, भात, मोहरी, ऊस, कापूस (🌾)" },
        suggestedFertilizer: { en: "NPK 20:10:10 + Urea + Zinc Sulfate", hi: "NPK 20:10:10 + यूरिया + जिंक सल्फेट", mr: "NPK 20:10:10 + युरिया + झिंक सल्फेट" },
        advice: {
            en: "Deep fertile alluvial soil. High yield potential for Wheat and Paddy. Apply split nitrogen and zinc.",
            hi: "गहरी उपजाऊ जलोढ़ मिट्टी। गेहूं व धान के लिए उच्च उपज। नाइट्रोजन व जिंक की संतुलित मात्रा दें।",
            mr: "खोल सुपीक गाळाची माती. गहू व भातासाठी उत्तम. नत्र आणि झिंकचा समतोल ठेवा."
        }
    },
    {
        locations: ["uttar pradesh", "up", "bihar", "lucknow", "kanpur", "varanasi", "patna", "dehradun"],
        soilTypeMatch: ["alluvial", "loamy", "clay"],
        health: { en: "Deep Rich Alluvial Soil", hi: "गहरी समृद्ध जलोढ़ मिट्टी", mr: "समृद्ध गाळाची माती" },
        recommendedCrop: { en: "Sugarcane, Wheat, Paddy, Potato, Mustard, Maize (🌾)", hi: "गन्ना, गेहूं, धान, आलू, सरसों, मक्का (🌾)", mr: "ऊस, गहू, भात, बटाटा, मोहरी, मका (🌾)" },
        suggestedFertilizer: { en: "NPK 12:32:16 + Vermicompost + Urea", hi: "NPK 12:32:16 + वर्मीकंपोस्ट + यूरिया", mr: "NPK 12:32:16 + गांडूळ खत + युरिया" },
        advice: {
            en: "Highly productive plains. Ideal for Sugarcane, Wheat, and Vegetables. Maintain balanced fertilization.",
            hi: "अत्यधिक उत्पादक मैदान। गन्ना, गेहूं और सब्जियों के लिए आदर्श। संतुलित उर्वरक प्रयोग करें।",
            mr: "अत्यंत सुपीक प्रदेश. ऊस, गहू व भाजीपाल्यासाठी उत्तम. संतुलित खते वापरा."
        }
    },
    {
        locations: ["west bengal", "bengal", "kolkata", "assam", "guwahati", "tripura", "sikkim", "meghalaya", "north east"],
        soilTypeMatch: ["alluvial", "clay", "laterite", "acidic"],
        health: { en: "High Moisture Alluvial & Acidic Soil", hi: "उच्च नमीयुक्त उपजाऊ मिट्टी", mr: "योग्य ओलावा असलेली सुपीक माती" },
        recommendedCrop: { en: "Rice/Paddy, Jute, Tea, Potato, Vegetables (🌾)", hi: "धान/चावल, जूट, चाय, आलू, सब्जियां (🌾)", mr: "भात, ताग, चहा, बटाटा, भाजीपाला (🌾)" },
        suggestedFertilizer: { en: "NPK 10:20:20 + Organic Compost + Agricultural Lime", hi: "NPK 10:20:20 + जैविक कंपोस्ट + चूना", mr: "NPK 10:20:20 + सेंद्रिय कंपोस्ट + चुना" },
        advice: {
            en: "High rainfall region. Excellent for Rice, Jute, and Tea. Ensure good field drainage.",
            hi: "अधिक वर्षा वाला क्षेत्र। धान, जूट और चाय के लिए उत्कृष्ट। जल निकासी सुगम रखें।",
            mr: "जास्त पावसाचा प्रदेश. भात, ताग व चहासाठी उत्तम. पाणी साचू देऊ नका."
        }
    },
    {
        locations: ["gujarat", "ahmedabad", "surat", "rajkot", "vadodara", "gandhinagar", "amreli"],
        soilTypeMatch: ["black", "sandy", "loamy"],
        health: { en: "High Moisture Black & Sandy Loam Soil", hi: "उच्च नमीयुक्त काली व बलुई दोमट मिट्टी", mr: "ओलावा धरून ठेवणारी काळी व गाळाची माती" },
        recommendedCrop: { en: "Cotton, Groundnut, Castor, Cumin, Mustard (🌱)", hi: "कपास, मूंगफली, अरंडी, जीरा, सरसों (🌱)", mr: "कापूस, भुईमूग, एरंडी, जिरे, मोहरी (🌱)" },
        suggestedFertilizer: { en: "NPK 20:10:10 + Gypsum + Farmyard Manure", hi: "NPK 20:10:10 + जिप्सम + गोबर खाद", mr: "NPK 20:10:10 + जिप्सम + शेणखत" },
        advice: {
            en: "Excellent for Cash Crops & Oilseeds. Implement Drip Irrigation for Groundnut and Cotton.",
            hi: "नगदी फसलों और तिलहन के लिए उत्कृष्ट। कपास और मूंगफली में ड्रिप सिंचाई अपनाएं।",
            mr: "रोख पिके व गळित धान्यासाठी उत्तम. कापूस व भुईमुगासाठी ठिबक सिंचन वापरा."
        }
    },
    {
        locations: ["rajasthan", "jaipur", "jodhpur", "bikaner", "udaipur", "kota"],
        soilTypeMatch: ["sandy", "arid"],
        health: { en: "Low Water Retention Arid Soil", hi: "कम जल धारण क्षमता वाली शुष्क मिट्टी", mr: "कमी पाणी धरणारी वाळवंटी माती" },
        recommendedCrop: { en: "Bajra (Pearl Millet), Mustard, Guar, Cumin, Pulses (🌾)", hi: "बाजरा, सरसों, ग्वार, जीरा, दलहन (🌾)", mr: "बाजरी, मोहरी, गवार, जिरे, कडधान्ये (🌾)" },
        suggestedFertilizer: { en: "Organic Compost + NPK 15:15:15 + Bio-fertilizers", hi: "जैविक कंपोस्ट + NPK 15:15:15 + जैव उर्वरक", mr: "सेंद्रिय कंपोस्ट + NPK 15:15:15 + जिवाणू खते" },
        advice: {
            en: "Arid soil with low moisture capacity. Use Drip/Sprinkler irrigation and organic mulching.",
            hi: "कम नमी वाली शुष्क मिट्टी। ड्रिप/स्प्रिंकलर सिंचाई और मल्चिंग का प्रयोग करें।",
            mr: "कमी ओलावा असलेली माती. ठिबक/तुषार सिंचन व मल्चिंगचा वापर करा."
        }
    },
    {
        locations: ["madhya pradesh", "mp", "bhopal", "indore", "gwalior", "jabalpur", "chhattisgarh", "raipur"],
        soilTypeMatch: ["black", "red"],
        health: { en: "Rich Deep Black & Red Mineral Soil", hi: "समृद्ध गहरी काली व लाल खनिज मिट्टी", mr: "समृद्ध काळी व लाल माती" },
        recommendedCrop: { en: "Soybean, Wheat, Gram (Chickpea), Garlic, Mustard (🌱)", hi: "सोयाबीन, गेहूं, चना, लहसुन, सरसों (🌱)", mr: "सोयाबीन, गहू, हरभरा, लसूण, मोहरी (🌱)" },
        suggestedFertilizer: { en: "Single Super Phosphate (SSP) + NPK 20:20:0 + Organic FYM", hi: "एसएसपी (SSP) + NPK 20:20:0 + गोबर खाद", mr: "SSP + NPK 20:20:0 + शेणखत" },
        advice: {
            en: "Soybean & Pulse Bowl of India. Ensure Adequate Sulfur and Phosphorus application.",
            hi: "सोयाबीन और दलहन का प्रमुख क्षेत्र। सल्फर और फास्फोरस की उचित मात्रा दें।",
            mr: "सोयाबीन व हरभऱ्याचे कोठार. गंधक (Sulfur) व स्फुरदचा (Phosphorus) योग्य वापर करा."
        }
    },
    {
        locations: ["andhra pradesh", "ap", "telangana", "hyderabad", "vijayawada", "visakhapatnam", "guntur", "warangal"],
        soilTypeMatch: ["red", "black", "alluvial"],
        health: { en: "Productive Red & Black Mineral Soil", hi: "उत्पादक लाल व काली खनिज मिट्टी", mr: "उत्पादक लाल व काळी माती" },
        recommendedCrop: { en: "Paddy/Rice, Cotton, Chilli, Maize, Tobacco, Groundnut (🌶️)", hi: "धान, कपास, मिर्च, मक्का, तंबाकू, मूंगफली (🌶️)", mr: "भात, कापूस, मिरची, मका, तंबाखू, भुईमूग (🌶️)" },
        suggestedFertilizer: { en: "NPK 20:20:0 + MOP + Neem Cake + Micronutrients", hi: "NPK 20:20:0 + पोटाश + नीम खली + सूक्ष्म पोषक", mr: "NPK 20:20:0 + पोटॅश + निंबोळी पेंड" },
        advice: {
            en: "Highly responsive soil. Apply Zinc and Boron micronutrients for Chilli and Cotton.",
            hi: "उर्वरक उत्तरदायी मिट्टी। मिर्च और कपास में जिंक व बोरॉन का प्रयोग करें।",
            mr: "खतांना चांगला प्रतिसाद देणारी माती. मिरची व कापसासाठी झिंक व बोरॉन वापरा."
        }
    },
    {
        locations: ["karnataka", "bengaluru", "bangalore", "mysuru", "hubballi", "belagavi", "mangalore"],
        soilTypeMatch: ["red", "black", "loamy", "laterite"],
        health: { en: "Well-Drained Red Loamy & Black Soil", hi: "उत्तम जल निकास युक्त लाल दोमट मिट्टी", mr: "उत्तम निचरा होणारी तांबडी माती" },
        recommendedCrop: { en: "Ragi (Finger Millet), Coffee, Arecanut, Sugarcane, Sunflower (☕)", hi: "रागी, कॉफी, सुपारी, गन्ना, सूरजमुखी (☕)", mr: "नाचणी/रागी, कॉफी, सुपारी, ऊस, सूर्यफूल (☕)" },
        suggestedFertilizer: { en: "Organic Vermicompost + NPK 15:15:15 + Single Super Phosphate", hi: "वर्मीकंपोस्ट + NPK 15:15:15 + एसएसपी", mr: "गांडूळ खत + NPK 15:15:15 + SSP" },
        advice: {
            en: "Ideal for Millets, Plantation, and Oilseed crops. Maintain organic carbon with compost.",
            hi: "मोटे अनाज, बागवानी और तिलहन के लिए आदर्श। कंपोस्ट द्वारा जैविक कार्बन बनाए रखें।",
            mr: "तृणधान्ये, बागायती व गळित पिकांसाठी उत्तम. कंपोस्ट वापरून सेंद्रिय कर्ब वाढवा."
        }
    },
    {
        locations: ["tamil nadu", "tn", "chennai", "coimbatore", "madurai", "trichy", "salem"],
        soilTypeMatch: ["red", "black", "alluvial"],
        health: { en: "Responsive Red Sandy Loam Soil", hi: "उर्वरक उत्तरदायी लाल बलुई दोमट मिट्टी", mr: "चांगला प्रतिसादात्मक तांबडी माती" },
        recommendedCrop: { en: "Paddy/Rice, Sugarcane, Groundnut, Coconut, Pulses (🌴)", hi: "धान, गन्ना, मूंगफली, नारियल, दलहन (🌴)", mr: "भात, ऊस, भुईमूग, नारळ, कडधान्ये (🌴)" },
        suggestedFertilizer: { en: "NPK 20:10:10 + Vermicompost + Bio-fertilizers (Azospirillum)", hi: "NPK 20:10:10 + वर्मीकंपोस्ट + एजोस्पिरिलम", mr: "NPK 20:10:10 + गांडूळ खत + अझोस्पिरिलम" },
        advice: {
            en: "Suitable for multi-crop Rice and Sugarcane. Apply Bio-fertilizers and Drip Fertigation.",
            hi: "धान की बहु-फसली खेती व गन्ने के लिए उपयुक्त। जैव उर्वरक व ड्रिप फर्टिगेशन अपनाएं।",
            mr: "बहुपीक भात व उसासाठी उत्तम. जिवाणू खते व ठिबकद्वारे खत द्या."
        }
    },
    {
        locations: ["kerala", "thiruvananthapuram", "kochi", "kozhikode", "kottayam", "wayanad"],
        soilTypeMatch: ["laterite", "acidic", "alluvial"],
        health: { en: "Acidic Laterite Plantation Soil (pH 4.8 - 5.8)", hi: "अम्लीय लैटेराइट बागवानी मिट्टी (pH 4.8 - 5.8)", mr: "आम्लधर्मी लॅटेराइट माती (pH 4.8 - 5.8)" },
        recommendedCrop: { en: "Coconut, Rubber, Spices (Pepper, Cardamom), Tea, Coffee (🌴)", hi: "नारियल, रबड़, मसाले (काली मिर्च, इलायची), चाय, कॉफी (🌴)", mr: "नारळ, रबर, मसाले (मीरी, वेलची), चहा, कॉफी (🌴)" },
        suggestedFertilizer: { en: "Agricultural Lime / Dolomite + Organic Manure + Rock Phosphate", hi: "कृषि चूना / डोलोमाइट + गोबर खाद + रॉक फास्फेट", mr: "कृषी चुना / डोलोमाईट + शेणखत + रॉक फॉस्फेट" },
        advice: {
            en: "Acidic Laterite Soil. Apply Agricultural Lime/Dolomite annually to regulate soil pH.",
            hi: "अम्लीय लैटेराइट मिट्टी। मिट्टी का pH सुधारने के लिए वार्षिक रूप से कृषि चूना/डोलोमाइट डालें।",
            mr: "आम्लधर्मी लॅटेराइट माती. सामू (pH) नियंत्रणासाठी दरवर्षी कृषी चुना/डोलोमाईट वापरा."
        }
    },
    {
        locations: ["himachal pradesh", "himachal", "shimla", "manali", "jammu", "kashmir", "srinagar", "uttarakhand"],
        soilTypeMatch: ["forest", "hill", "loamy"],
        health: { en: "Organic-Rich Himalayan Hill Soil", hi: "जैविक-समृद्ध पहाड़ी मिट्टी", mr: "सेंद्रिय घटकांनी समृद्ध पर्वतीय माती" },
        recommendedCrop: { en: "Apple, Saffron, Potato, Walnut, Peach, Maize (🍎)", hi: "सेब, केसर, आलू, अखरोट, आडू, मक्का (🍎)", mr: "सफरचंद, केशर, बटाटा, अक्रोड, मका (🍎)" },
        suggestedFertilizer: { en: "Farmyard Manure (FYM) + NPK 15:15:15 + Calcium Nitrate", hi: "गोबर खाद + NPK 15:15:15 + कैल्शियम नाइट्रेट", mr: "शेणखत + NPK 15:15:15 + कॅल्शियम नायट्रेट" },
        advice: {
            en: "Ideal for Temperate Horticulture & Apples. Use Contour Planting & Organic Mulching.",
            hi: "शीतोष्ण बागवानी व सेब के लिए आदर्श। सीढ़ीदार खेती और जैविक मल्चिंग अपनाएं।",
            mr: "सफरचंद व बागायतीसाठी उत्तम. पायऱ्यांची शेती व सेंद्रिय मल्चिंगचा वापर करा."
        }
    },
    {
        locations: ["odisha", "orissa", "bhubaneswar", "cuttack", "jharkhand", "ranchi", "jamshedpur"],
        soilTypeMatch: ["red", "alluvial", "laterite"],
        health: { en: "Medium Fertility Red & Alluvial Mineral Soil", hi: "मध्यम उर्वर लाल व जलोढ़ खनिज मिट्टी", mr: "मध्यम सुपीक तांबडी व गाळाची माती" },
        recommendedCrop: { en: "Paddy/Rice, Pulses, Oilseeds, Maize, Vegetables (🌾)", hi: "धान, दलहन, तिलहन, मक्का, सब्जियां (🌾)", mr: "भात, कडधान्ये, गळित धान्य, मका, भाजीपाला (🌾)" },
        suggestedFertilizer: { en: "DAP + Urea + Vermicompost + Zinc Sulfate", hi: "डीएपी (DAP) + यूरिया + वर्मीकंपोस्ट + जिंक सल्फेट", mr: "DAP + युरिया + गांडूळ खत + झिंक सल्फेट" },
        advice: {
            en: "Major Rice belt. Split Nitrogen doses and incorporate green manure crops.",
            hi: "धान का प्रमुख क्षेत्र। नाइट्रोजन को किस्तों में दें और हरी खाद का प्रयोग करें।",
            mr: "भाताचा मुख्य प्रदेश. नत्र टप्प्याटप्प्याने द्या व हिरवळीची खते वापरा."
        }
    },
    {
        locations: ["goa", "panaji", "margao"],
        soilTypeMatch: ["laterite", "acidic"],
        health: { en: "Coastal Acidic Laterite Soil", hi: "तटीय अम्लीय लैटेराइट मिट्टी", mr: "किनापट्टीवरील लॅटेराइट माती" },
        recommendedCrop: { en: "Cashew, Coconut, Paddy, Arecanut, Mango (🥥)", hi: "काजू, नारियल, धान, सुपारी, आम (🥥)", mr: "काजू, नारळ, भात, सुपारी, आंबा (🥥)" },
        suggestedFertilizer: { en: "Organic Compost + Agricultural Lime + Balanced NPK", hi: "जैविक कंपोस्ट + कृषि चूना + संतुलित NPK", mr: "सेंद्रिय कंपोस्ट + कृषी चुना + संतुलित NPK" },
        advice: {
            en: "High rainfall coastal soil. Add compost and agricultural lime to balance soil acidity.",
            hi: "अधिक वर्षा वाली तटीय मिट्टी। अम्लता दूर करने के लिए कंपोस्ट व चूना मिलाएं।",
            mr: "जास्त पावसाची किनारपट्टीची माती. आम्लता कमी करण्यासाठी कंपोस्ट व चुना घाला."
        }
    }
];

const analyzeSoil = async (req, res) => {
    try {
        const { soilType, location, nitrogen, phosphorus, potassium, phValue } = req.body;

        if (!soilType || !location || nitrogen === undefined || phosphorus === undefined || potassium === undefined || phValue === undefined) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required soil fields (soilType, location, nitrogen, phosphorus, potassium, phValue)",
            });
        }

        const N = parseFloat(nitrogen);
        const P = parseFloat(phosphorus);
        const K = parseFloat(potassium);
        const ph = parseFloat(phValue);
        const locLower = (location || "").toLowerCase().trim();
        const typeLower = (soilType || "").toLowerCase().trim();

        let reportMatch = null;

        // 1. Check Exact Location & Soil Type Matches across Indian States & Cities
        for (const item of BENCHMARK_SOIL_DATA) {
            const locHit = item.locations.some(l => locLower.includes(l));
            const typeHit = item.soilTypeMatch.some(t => typeLower.includes(t));

            if (locHit && typeHit) {
                reportMatch = item;
                break;
            }
        }

        // 2. Check Location Match alone if location is specific (e.g. State or City)
        if (!reportMatch) {
            for (const item of BENCHMARK_SOIL_DATA) {
                const locHit = item.locations.some(l => locLower.includes(l));
                if (locHit) {
                    reportMatch = item;
                    break;
                }
            }
        }

        // 3. Fallback to Soil Type match alone
        if (!reportMatch) {
            for (const item of BENCHMARK_SOIL_DATA) {
                const typeHit = item.soilTypeMatch.some(t => typeLower.includes(t));
                if (typeHit) {
                    reportMatch = item;
                    break;
                }
            }
        }

        let healthEn, healthHi, healthMr;
        let cropEn, cropHi, cropMr;
        let fertEn, fertHi, fertMr;
        let advEn, advHi, advMr;

        if (reportMatch) {
            healthEn = reportMatch.health.en;
            healthHi = reportMatch.health.hi;
            healthMr = reportMatch.health.mr;

            cropEn = reportMatch.recommendedCrop.en;
            cropHi = reportMatch.recommendedCrop.hi;
            cropMr = reportMatch.recommendedCrop.mr;

            fertEn = reportMatch.suggestedFertilizer.en;
            fertHi = reportMatch.suggestedFertilizer.hi;
            fertMr = reportMatch.suggestedFertilizer.mr;

            advEn = reportMatch.advice.en;
            advHi = reportMatch.advice.hi;
            advMr = reportMatch.advice.mr;
        } else {
            // Dynamic Agronomy Classifier based on Soil Type, NPK, and pH
            if (ph < 6.0) {
                healthEn = "Acidic Soil (low pH)";
                healthHi = "अम्लीय मिट्टी (कम pH)";
                healthMr = "आम्धर्मी माती (कमी pH)";

                cropEn = "Rice, Tea, Potato, Pulses (🌾)";
                cropHi = "धान, चाय, आलू, दलहन (🌾)";
                cropMr = "भात, चहा, बटाटा, कडधान्ये (🌾)";

                fertEn = "Agricultural Lime + Organic Compost + SSP";
                fertHi = "कृषि चूना + जैविक कंपोस्ट + एसएसपी";
                fertMr = "कृषी चुना + सेंद्रिय कंपोस्ट + SSP";

                advEn = "Acidic soil detected. Apply agricultural lime @ 200kg/acre and add organic compost.";
                advHi = "अम्लीय मिट्टी। प्रति एकड़ 200 किग्रा चूना मिलाएं और जैविक खाद डालें।";
                advMr = "आम्लधर्मी माती. दर एकरी २०० किलो कृषी चुना व सेंद्रिय खत वापरा.";
            } else if (ph > 7.5) {
                healthEn = "Alkaline Soil (high pH)";
                healthHi = "क्षारीय मिट्टी (उच्च pH)";
                healthMr = "अल्कधर्मी माती (जास्त pH)";

                cropEn = "Cotton, Mustard, Barley, Sorghum (🌱)";
                cropHi = "कपास, सरसों, जौ, ज्वार (🌱)";
                cropMr = "कापूस, मोहरी, जाऊ, ज्वारी (🌱)";

                fertEn = "Gypsum + Organic Compost + Sulfur";
                fertHi = "जिप्सम + जैविक कम्पोस्ट + सल्फर";
                fertMr = "जिप्सम + सेंद्रिय कंपोस्ट + सल्फर";

                advEn = "Alkaline soil detected. Apply Gypsum @ 400kg/acre and use drip irrigation.";
                advHi = "क्षारीय मिट्टी। प्रति एकड़ 400 किग्रा जिप्सम का प्रयोग करें।";
                advMr = "अल्कधर्मी माती. दर एकरी ४०० किलो जिप्सम वापरा व ठिबक सिंचन करा.";
            } else {
                healthEn = "Fertile Soil";
                healthHi = "उर्वर मिट्टी";
                healthMr = "सुपीक माती";

                if (typeLower.includes("red")) {
                    cropEn = "Groundnut, Millets, Pulses (🥜)";
                    cropHi = "मूंगफली, बाजरा, दलहन (🥜)";
                    cropMr = "भुईमूग, बाजरी, कडधान्ये (🥜)";
                    fertEn = "Organic Compost + Single Super Phosphate (SSP)";
                    fertHi = "जैविक कंपोस्ट + सिंगल सुपर फास्फेट";
                    fertMr = "सेंद्रिय कंपोस्ट + सिंगल सुपर फॉस्फेट";
                    advEn = "Medium fertility red soil. Suitable for Groundnut, Millets, Pulses. Add compost and phosphorus fertilizer.";
                    advHi = "लाल मिट्टी। मूंगफली, बाजरा, दलहन के लिए उपयुक्त। कंपोस्ट और फास्फोरस खाद डालें।";
                    advMr = "लाल माती. भुईमूग, बाजरी, कडधान्यांसाठी योग्य. कंपोस्ट व स्फुरद खत घाला.";
                } else if (typeLower.includes("sandy")) {
                    healthEn = "Low Water Retention";
                    healthHi = "कम जल धारण क्षमता";
                    healthMr = "कमी पाणी धरून ठेवण्याची क्षमता";
                    cropEn = "Groundnut, Watermelon, Pulses (🍉)";
                    cropHi = "मूंगफली, तरबूज, दलहन (🍉)";
                    cropMr = "भुईमूग, टरबूज, कडधान्ये (🍉)";
                    fertEn = "Organic Compost + NPK 15:15:15 + Drip Irrigation";
                    fertHi = "जैविक कंपोस्ट + NPK 15:15:15 + ड्रिप सिंचाई";
                    fertMr = "सेंद्रिय कंपोस्ट + NPK 15:15:15 + ठिबक सिंचन";
                    advEn = "Low water retention. Suitable for Groundnut, Watermelon. Irrigate frequently and add organic matter.";
                    advHi = "बलुई मिट्टी। बार-बार सिंचाई करें और जैविक खाद डालें।";
                    advMr = "वाळूमय माती. वारंवार पाणी द्या व सेंद्रिय खत वापरा.";
                } else if (typeLower.includes("loam")) {
                    healthEn = "Excellent Soil";
                    healthHi = "उत्कृष्ट मिट्टी";
                    healthMr = "उत्कृष्ट माती";
                    cropEn = "Grapes, Onion, Tomato, Vegetables (🍇)";
                    cropHi = "अंगूर, प्याज, टमाटर, सब्जियां (🍇)";
                    cropMr = "द्राक्षे, कांदा, टोमॅटो, भाजीपाला (🍇)";
                    fertEn = "Balanced NPK 20:20:20 + Micronutrients";
                    fertHi = "संतुलित NPK 20:20:20 + सूक्ष्म पोषक";
                    fertMr = "संतुलित NPK 20:20:20 + सूक्ष्म अन्नद्रव्ये";
                    advEn = "Excellent loamy soil. Suitable for Grapes, Vegetables, Tomato. Continue balanced fertilization.";
                    advHi = "उत्कृष्ट दोमट मिट्टी। सब्जियों व फलों के लिए उत्तम।";
                    advMr = "उत्कृष्ट गाळाची माती. भाजीपाला व फळांसाठी उत्तम.";
                } else {
                    cropEn = "Cotton, Soybean, Wheat (🌱)";
                    cropHi = "कपास, सोयाबीन, गेहूं (🌱)";
                    cropMr = "कापूस, सोयाबीन, गहू (🌱)";
                    fertEn = "Organic Manure + Balanced NPK";
                    fertHi = "गोबर खाद + संतुलित NPK";
                    fertMr = "शेणखत + संतुलित NPK";
                    advEn = "Fertile soil. Suitable for Cotton, Soybean, Wheat. Maintain balanced nutrients and organic matter.";
                    advHi = "उपजाऊ मिट्टी। कपास, सोयाबीन, गेहूं के लिए उपयुक्त।";
                    advMr = "सुपीक माती. कापूस, सोयाबीन, गव्हासाठी उत्तम.";
                }
            }
        }

        // Call Gemini AI for enriched soil health advisory
        let geminiAiAdvice = null;
        try {
            const prompt = `Act as an expert agronomist for Kisan Mitra AI. A farmer submitted soil testing parameters:
Location: ${location}
Soil Type: ${soilType}
Nitrogen (N): ${N} kg/ha
Phosphorus (P): ${P} kg/ha
Potassium (K): ${K} kg/ha
Soil pH: ${ph}

Expected Benchmark context for this state/area: Health: ${healthEn}, Crops: ${cropEn}, Fertilizer: ${fertEn}.
Provide a clear, 3-bullet expert soil advisory tailored to this specific Indian state/region, soil type, NPK, and pH value.`;
            geminiAiAdvice = await generateGeminiText(prompt);
        } catch (e) {
            console.warn("Gemini soil analysis skipped:", e.message);
        }

        res.json({
            success: true,
            report: {
                location,
                soilType,
                nitrogen: N,
                phosphorus: P,
                potassium: K,
                phValue: ph,
                health: {
                    en: healthEn,
                    hi: healthHi,
                    mr: healthMr,
                },
                recommendedCrop: {
                    en: cropEn,
                    hi: cropHi,
                    mr: cropMr,
                },
                suggestedFertilizer: {
                    en: fertEn,
                    hi: fertHi,
                    mr: fertMr,
                },
                advice: {
                    en: advEn,
                    hi: advHi,
                    mr: advMr,
                },
                geminiAdvice: geminiAiAdvice,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = { analyzeSoil };
