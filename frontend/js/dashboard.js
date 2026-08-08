// Apply Dark Mode on Page Load
if (window.KisanAPI) {
    window.KisanAPI.applyTheme();
}

// Quick Theme Toggle in Header
const themeToggleBtn = document.getElementById("themeToggleBtn");
const themeToggleIcon = document.getElementById("themeToggleIcon");

function updateThemeToggleIcon() {
    if (!themeToggleIcon || !window.KisanAPI) return;
    const isDark = window.KisanAPI.getTheme();
    if (isDark) {
        themeToggleIcon.classList.remove("fa-moon");
        themeToggleIcon.classList.add("fa-sun");
    } else {
        themeToggleIcon.classList.remove("fa-sun");
        themeToggleIcon.classList.add("fa-moon");
    }
}

if (themeToggleBtn) {
    updateThemeToggleIcon();
    themeToggleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (window.KisanAPI) {
            const currentDark = window.KisanAPI.getTheme();
            const nextDark = !currentDark;
            window.KisanAPI.setTheme(nextDark);
            window.KisanAPI.applyTheme();
            updateThemeToggleIcon();
            if (window.KisanAPI.getToken()) {
                window.KisanAPI.request("/auth/profile", {
                    method: "PUT",
                    body: JSON.stringify({ darkMode: nextDark }),
                }).catch((err) => console.warn("Theme toggle sync warning:", err));
            }
        }
    });
}

console.log("Dashboard Loaded Successfully 🚀");

// ================================
// Feature Cards Navigation
// ================================

const cards = {
    diseaseCard: "disease.html",
    chatCard: "chatbot.html",
    soilCard: "soil.html",
    weatherCard: "weather.html",
    voiceCard: "voice.html",
    languageCard: "setting.html",
};

Object.keys(cards).forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener("click", () => {
            window.location.href = cards[id];
        });
    }
});

// ================================
// Bottom Navigation Active Effect
// ================================

const navItems = document.querySelectorAll(".nav-item");
navItems.forEach((item) => {
    item.addEventListener("click", () => {
        navItems.forEach((nav) => nav.classList.remove("active"));
        item.classList.add("active");
    });
});

// ================================
// Notification Bell Animation & Click
// ================================

const bell = document.querySelector(".notification");
if (bell) {
    bell.addEventListener("mouseenter", () => {
        bell.style.transform = "rotate(15deg)";
    });
    bell.addEventListener("mouseleave", () => {
        bell.style.transform = "rotate(0deg)";
    });
    bell.addEventListener("click", () => {
        alert("🔔 Notifications: All agricultural systems operating normally. Weather alerts and soil reports active!");
    });
}

// Dynamic Greeting & User Name
function updateHeadingName(name) {
    const nameHeading = document.getElementById("userNameHeading");
    if (nameHeading && name) {
        nameHeading.innerText = name;
    }
}

// Immediately display stored user name synchronously on load
(() => {
    const cachedUser = window.KisanAPI ? window.KisanAPI.getUser() : null;
    const initialName = cachedUser?.name || localStorage.getItem("userName") || "";
    if (initialName) {
        updateHeadingName(initialName);
    }
})();

async function loadUserData() {
    const cachedUser = window.KisanAPI ? window.KisanAPI.getUser() : null;
    let name = cachedUser?.name || localStorage.getItem("userName") || "";
    if (name) {
        updateHeadingName(name);
    }

    if (window.KisanAPI && window.KisanAPI.getToken()) {
        try {
            const res = await window.KisanAPI.request("/auth/profile");
            if (res.success && res.user) {
                window.KisanAPI.setUser(res.user);
                window.KisanAPI.applyTheme();
                if (res.user.name) {
                    updateHeadingName(res.user.name);
                }
            }
        } catch (e) {
            console.warn("Could not fetch profile, using cached user name.");
        }
    }
}

// Weather snippet update on dashboard
async function loadLiveWeatherSnippet() {
    const tempEl = document.getElementById("dashTemp");
    const cityEl = document.getElementById("dashCity");
    const condEl = document.getElementById("dashCondition");

    const renderSnippet = (data) => {
        if (tempEl) tempEl.textContent = data.temperature;
        if (cityEl) cityEl.textContent = data.city;
        if (condEl) condEl.textContent = data.condition;
        if (data.city && data.city !== "Your Location") {
            localStorage.setItem("profileLocation", data.city);
        }
    };

    const fetchByEndpoint = async (endpoint) => {
        try {
            if (window.KisanAPI) {
                const res = await window.KisanAPI.request(endpoint);
                if (res && res.success && res.data) {
                    renderSnippet(res.data);
                    return true;
                }
            }
        } catch (e) {
            console.warn("Live weather snippet warning:", e.message);
        }
        return false;
    };

    const savedCity = localStorage.getItem("profileLocation") || "";

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;
                const success = await fetchByEndpoint(`/weather?lat=${lat}&lon=${lon}`);
                if (!success && savedCity) {
                    await fetchByEndpoint(`/weather?city=${encodeURIComponent(savedCity)}`);
                }
            },
            async () => {
                if (savedCity) {
                    await fetchByEndpoint(`/weather?city=${encodeURIComponent(savedCity)}`);
                } else {
                    await fetchByEndpoint(`/weather`);
                }
            },
            { timeout: 8000, enableHighAccuracy: true }
        );
    } else if (savedCity) {
        await fetchByEndpoint(`/weather?city=${encodeURIComponent(savedCity)}`);
    } else {
        await fetchByEndpoint(`/weather`);
    }
}

// Search bar functionality
const searchInput = document.querySelector(".input-field");
if (searchInput) {
    searchInput.addEventListener("keyup", (e) => {
        const val = e.target.value.toLowerCase().trim();

        if (e.key === "Enter" && val) {
            window.location.href = `chatbot.html?q=${encodeURIComponent(val)}`;
            return;
        }

        const featureCards = document.querySelectorAll(".feature-card");
        featureCards.forEach((card) => {
            const text = card.innerText.toLowerCase();
            if (text.includes(val) || val === "") {
                card.style.display = "flex";
            } else {
                card.style.display = "none";
            }
        });
    });
}

function updateGreeting() {
    const hour = new Date().getHours();
    const greeting = document.querySelector(".welcome-card h3");
    if (!greeting) return;

    let key = "goodMorning";
    let icon = "🌞";
    let fallback = "Good Morning";

    if (hour >= 0 && hour < 5) {
        key = "goodNight";
        icon = "🌙";
        fallback = "Good Night";
    } else if (hour >= 5 && hour < 12) {
        key = "goodMorning";
        icon = "🌞";
        fallback = "Good Morning";
    } else if (hour >= 12 && hour < 17) {
        key = "goodAfternoon";
        icon = "☀️";
        fallback = "Good Afternoon";
    } else if (hour >= 17 && hour < 21) {
        key = "goodEvening";
        icon = "🌇";
        fallback = "Good Evening";
    } else {
        key = "goodNight";
        icon = "🌙";
        fallback = "Good Night";
    }

    const translatedText = window.t ? window.t(key, fallback) : fallback;
    greeting.innerHTML = `${icon} ${translatedText}`;
}

loadUserData();
loadLiveWeatherSnippet();
updateGreeting();
window.addEventListener("languageChanged", updateGreeting);