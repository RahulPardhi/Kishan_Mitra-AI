// Apply Dark Mode on Page Load
if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
}

console.log("Weather Page Loaded 🌤️");

async function fetchWeather() {
    const cityEl = document.getElementById("city");
    const tempEl = document.getElementById("temperature");
    const humidityEl = document.getElementById("humidity");
    const windEl = document.getElementById("wind");
    const feelsEl = document.getElementById("feels");
    const rainEl = document.getElementById("rain");
    const conditionEl = document.getElementById("condition");
    const adviceEl = document.getElementById("advice");

    const renderData = (data) => {
        const lang = localStorage.getItem("language") || "en";
        if (cityEl) cityEl.textContent = data.city;
        if (tempEl) tempEl.textContent = data.temperature;
        if (humidityEl) humidityEl.textContent = data.humidity;
        if (windEl) windEl.textContent = data.wind;
        if (feelsEl) feelsEl.textContent = data.feelsLike;
        if (rainEl) rainEl.textContent = data.rain;
        if (conditionEl) conditionEl.textContent = data.condition;
        if (adviceEl && data.advice) {
            adviceEl.innerHTML = data.advice[lang] || data.advice.en;
        }
        if (data.city) {
            localStorage.setItem("profileLocation", data.city);
        }
    };

    const fetchByEndpoint = async (endpoint) => {
        try {
            if (window.KisanAPI) {
                const res = await window.KisanAPI.request(endpoint);
                if (res && res.success && res.data) {
                    renderData(res.data);
                    return true;
                }
            }
        } catch (e) {
            console.warn(`Weather fetch error [${endpoint}]:`, e.message);
        }
        return false;
    };

    const defaultCity = localStorage.getItem("profileLocation") || "Nagpur";

    // Request device current location via browser Geolocation API
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;
                const success = await fetchByEndpoint(`/weather?lat=${lat}&lon=${lon}`);
                if (!success) {
                    await fetchByEndpoint(`/weather?city=${encodeURIComponent(defaultCity)}`);
                }
            },
            async (err) => {
                console.warn("Geolocation positioning error / permission denied, using saved city:", err.message);
                await fetchByEndpoint(`/weather?city=${encodeURIComponent(defaultCity)}`);
            },
            { timeout: 10000, enableHighAccuracy: true }
        );
    } else {
        await fetchByEndpoint(`/weather?city=${encodeURIComponent(defaultCity)}`);
    }
}

fetchWeather();
window.addEventListener("languageChanged", fetchWeather);

// Weather Icon Animation
const icon = document.querySelector(".weather-icon");
if (icon) {
    icon.addEventListener("mouseenter", () => {
        icon.style.transform = "scale(1.2) rotate(10deg)";
    });
    icon.addEventListener("mouseleave", () => {
        icon.style.transform = "scale(1) rotate(0deg)";
    });
}