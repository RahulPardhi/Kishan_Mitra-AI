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

    const userCity = localStorage.getItem("profileLocation") || "Nagpur";

    try {
        if (window.KisanAPI) {
            const res = await window.KisanAPI.request(`/weather?city=${encodeURIComponent(userCity)}`);
            if (res.success && res.data) {
                const data = res.data;
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
                return;
            }
        }
    } catch (e) {
        console.warn("Weather API fetch error, applying fallback:", e);
    }

    // Default Fallback values
    if (cityEl) cityEl.textContent = userCity;
    if (tempEl) tempEl.textContent = "30°C";
    if (humidityEl) humidityEl.textContent = "65%";
    if (windEl) windEl.textContent = "12 km/h";
    if (feelsEl) feelsEl.textContent = "32°C";
    if (rainEl) rainEl.textContent = "20%";
    if (conditionEl) conditionEl.textContent = "Partly Cloudy";
    if (adviceEl) adviceEl.innerHTML = "🌾 Today's weather is suitable for irrigation and crop monitoring.";
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