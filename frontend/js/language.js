console.log("Language JS Loaded 🌐");

// Load Saved Language
let currentLanguage = localStorage.getItem("language") || "en";

// Ensure DOM loaded before initial apply
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => applyLanguage(currentLanguage));
} else {
    applyLanguage(currentLanguage);
}

// Bind Language Select Dropdowns
document.addEventListener("DOMContentLoaded", bindLanguageDropdowns);
bindLanguageDropdowns();

function bindLanguageDropdowns() {
    const languageSelects = document.querySelectorAll("#language, .language-select");
    languageSelects.forEach(select => {
        if (select) {
            select.value = currentLanguage;
            select.removeEventListener("change", handleLanguageChange);
            select.addEventListener("change", handleLanguageChange);
        }
    });
}

function handleLanguageChange(e) {
    currentLanguage = e.target.value;
    localStorage.setItem("language", currentLanguage);
    applyLanguage(currentLanguage);
}

// Apply Language across DOM
function applyLanguage(lang) {
    currentLanguage = lang;
    if (typeof translations === "undefined" || !translations[lang]) {
        console.warn("Translations not found for language:", lang);
        return;
    }

    const langDict = translations[lang];

    // Synchronize select values if any
    document.querySelectorAll("#language, .language-select").forEach(select => {
        select.value = lang;
    });

    // Translate elements with data-key
    document.querySelectorAll("[data-key]").forEach(element => {
        const key = element.getAttribute("data-key").trim();
        if (langDict[key]) {
            if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
                element.placeholder = langDict[key];
            } else if (element.children.length === 0) {
                element.innerText = langDict[key];
            } else {
                // If element contains child icons or HTML, replace text node if possible
                let textNodeFound = false;
                element.childNodes.forEach(node => {
                    if (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim() !== "") {
                        node.nodeValue = " " + langDict[key] + " ";
                        textNodeFound = true;
                    }
                });
                if (!textNodeFound && element.querySelector("span")) {
                    element.querySelector("span").innerText = langDict[key];
                }
            }
        }
    });

    // Translate placeholders specifically marked with data-key-placeholder
    document.querySelectorAll("[data-key-placeholder]").forEach(element => {
        const key = element.getAttribute("data-key-placeholder").trim();
        if (langDict[key]) {
            element.placeholder = langDict[key];
        }
    });

    // Fire event for dynamic script updates
    window.dispatchEvent(new CustomEvent("languageChanged", { detail: { language: lang } }));
}

// Global helper for runtime string translations
window.t = function (key, fallback = "") {
    const lang = localStorage.getItem("language") || "en";
    if (translations && translations[lang] && translations[lang][key]) {
        return translations[lang][key];
    }
    return fallback || key;
};

window.applyLanguage = applyLanguage;