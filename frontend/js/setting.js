// Elements
const darkModeToggle = document.getElementById("darkMode");
const languageSelect = document.getElementById("language");
const notificationsToggle = document.getElementById("notifications");
const logoutBtn = document.getElementById("logoutBtn");

// Load saved settings
const isUserDark = window.KisanAPI ? window.KisanAPI.applyTheme() : false;
if (darkModeToggle) {
    darkModeToggle.checked = isUserDark;
}

const savedLanguage = localStorage.getItem("language");
if (savedLanguage && languageSelect) {
    languageSelect.value = savedLanguage;
}

if (notificationsToggle) {
    const user = window.KisanAPI ? window.KisanAPI.getUser() : null;
    notificationsToggle.checked = user ? user.notificationsEnabled !== false : true;
    notificationsToggle.addEventListener("change", () => {
        const isEnabled = notificationsToggle.checked;
        if (window.KisanAPI && window.KisanAPI.getToken()) {
            window.KisanAPI.request("/auth/profile", {
                method: "PUT",
                body: JSON.stringify({ notificationsEnabled: isEnabled }),
            }).catch((err) => console.warn("Notification setting sync error:", err));
        }
    });
}

// User-Specific Dark Mode Toggle
if (darkModeToggle) {
    darkModeToggle.addEventListener("change", () => {
        const isDark = darkModeToggle.checked;
        if (window.KisanAPI) {
            window.KisanAPI.setTheme(isDark);
            window.KisanAPI.applyTheme();
            if (window.KisanAPI.getToken()) {
                window.KisanAPI.request("/auth/profile", {
                    method: "PUT",
                    body: JSON.stringify({ darkMode: isDark }),
                }).catch((err) => console.warn("Dark mode profile sync error:", err));
            }
        } else {
            document.body.classList.toggle("dark", isDark);
        }
    });
}

// Logout
if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        const shouldLogout = window.KisanNotify
            ? await window.KisanNotify.confirm("Are you sure you want to logout from Kisan Mitra AI?", {
                title: "Log out of your account?",
                confirmText: "Log out",
            })
            : confirm("Are you sure you want to logout from Kisan Mitra AI?");

        if (shouldLogout) {
            if (window.KisanAPI) window.KisanAPI.clearAuth();
            localStorage.removeItem("profileEmail");
            localStorage.removeItem("userName");
            window.location.replace("login.html");
        }
    });
}
