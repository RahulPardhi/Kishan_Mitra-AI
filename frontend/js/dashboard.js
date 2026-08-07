// Apply Dark Mode on Page Load
if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
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
async function loadUserData() {
    const nameHeading = document.getElementById("userNameHeading");
    let name = localStorage.getItem("userName");

    if (window.KisanAPI && window.KisanAPI.getToken()) {
        try {
            const res = await window.KisanAPI.request("/auth/profile");
            if (res.success && res.user) {
                window.KisanAPI.setUser(res.user);
                name = res.user.name;
            }
        } catch (e) {
            console.warn("Could not fetch profile, using cached user name.");
        }
    }

    if (nameHeading && name) {
        nameHeading.innerText = name;
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

    if (hour >= 12 && hour < 17) {
        key = "goodAfternoon";
        icon = "☀️";
        fallback = "Good Afternoon";
    } else if (hour >= 17) {
        key = "goodEvening";
        icon = "🌙";
        fallback = "Good Evening";
    }

    const translatedText = window.t ? window.t(key, fallback) : fallback;
    greeting.innerHTML = `${icon} ${translatedText}`;
}

loadUserData();
loadLiveWeatherSnippet();
updateGreeting();
window.addEventListener("languageChanged", updateGreeting);