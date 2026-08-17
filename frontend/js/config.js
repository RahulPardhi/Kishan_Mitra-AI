// Kisan Mitra AI - Central Frontend API Configuration
const API_BASE_URL = (typeof window !== "undefined" && window.location && window.location.origin && window.location.origin.startsWith("http"))
    ? (window.location.origin.includes("onrender.com")
        ? `${window.location.origin}/api`
        : (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
            ? `http://${window.location.hostname}:5000/api`
            : `${window.location.origin}/api`)
    : "http://localhost:5000/api";
const OLD_UNSPLASH_AVATAR = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80";
const DEFAULT_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23E8F5E9"/><circle cx="50" cy="38" r="20" fill="%232E7D32"/><path d="M50 62 c-25 0 -35 15 -35 28 h70 c0 -13 -10 -28 -35 -28 z" fill="%232E7D32"/></svg>`;

const safeSetItem = (key, value) => {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch (e) {
        console.warn(`LocalStorage setItem failed for key "${key}":`, e.message);
        if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || e.code === 22 || e.code === 1014) {
            try {
                // Clear heavy temporary items to free quota space
                localStorage.removeItem("cropPreviewImage");
                // Remove older legacy avatar entries if needed
                for (let i = 0; i < localStorage.length; i++) {
                    const k = localStorage.key(i);
                    if (k && (k.startsWith("profileImage:") || k === "profileImage") && k !== key) {
                        localStorage.removeItem(k);
                    }
                }
                localStorage.setItem(key, value);
                return true;
            } catch (retryErr) {
                console.warn(`LocalStorage retry failed for key "${key}":`, retryErr.message);
                return false;
            }
        }
        return false;
    }
};

const getAvatarKey = (user) => {
    const email = (user?.email || localStorage.getItem("profileEmail") || "").trim().toLowerCase();
    return email ? `profileImage:${email}` : "";
};

const getSavedAvatar = (user) => {
    const key = getAvatarKey(user);
    if (key && localStorage.getItem(key)) return localStorage.getItem(key);

    // Migrate the previous single-user cache the first time this version runs.
    const owner = localStorage.getItem("profileImageOwner");
    const legacyAvatar = localStorage.getItem("profileImage");
    if (legacyAvatar && (!owner || owner === (user?.email || "").trim().toLowerCase())) {
        return legacyAvatar;
    }
    return "";
};

const saveAvatar = (avatar, user) => {
    if (!avatar) return;
    const key = getAvatarKey(user);
    if (key) safeSetItem(key, avatar);
    safeSetItem("profileImage", avatar); // Maintains compatibility with existing screens.
    if (user?.email) safeSetItem("profileImageOwner", user.email.trim().toLowerCase());
};

const isDefaultAvatar = (avatar) => !avatar || avatar === DEFAULT_AVATAR || avatar === OLD_UNSPLASH_AVATAR;

const KisanAPI = {
    getToken: () => localStorage.getItem("token") || "",
    setToken: (token) => safeSetItem("token", token),

    getRegisteredUsers: () => [],

    findRegisteredUser: () => null,

    registerLocalUser: (userObj) => {
        if (!userObj || !userObj.email) return;
        const users = KisanAPI.getRegisteredUsers();
        const normalized = userObj.email.trim().toLowerCase();
        const existingIdx = users.findIndex(u => u.email && u.email.trim().toLowerCase() === normalized);
        const newUser = {
            _id: userObj._id || "local_" + Date.now(),
            name: userObj.name || userObj.email.split("@")[0],
            email: normalized,
            password: userObj.password || "",
            mobile: userObj.mobile || "",
            location: userObj.location || "",
            language: userObj.language || "en",
            avatar: userObj.avatar || DEFAULT_AVATAR,
            notificationsEnabled: userObj.notificationsEnabled !== false,
            darkMode: userObj.darkMode === true
        };
        if (existingIdx >= 0) {
            users[existingIdx] = { ...users[existingIdx], ...newUser };
        } else {
            users.push(newUser);
        }
        safeSetItem("registeredUsers", JSON.stringify(users));
        return newUser;
    },
    
    getUser: () => {
        try {
            const u = JSON.parse(localStorage.getItem("user")) || null;
            const savedAvatar = getSavedAvatar(u);
            if (u && isDefaultAvatar(u.avatar) && savedAvatar) {
                u.avatar = savedAvatar;
            }
            return u;
        } catch (e) {
            return null;
        }
    },
    setUser: (user) => {
        if (user) {
            try {
                const savedAvatar = getSavedAvatar(user);
                // A real photo takes priority. A default/empty avatar returned by
                // offline login must never overwrite the user's uploaded photo.
                if (isDefaultAvatar(user.avatar) && savedAvatar) user.avatar = savedAvatar;
                if (user.avatar) saveAvatar(user.avatar, user);

                // Preserve user dark mode choice if set
                const key = KisanAPI.getThemeKey(user);
                const savedTheme = (key && localStorage.getItem(key) !== null)
                    ? (localStorage.getItem(key) === "true")
                    : (localStorage.getItem("userDarkMode") !== null
                        ? (localStorage.getItem("userDarkMode") === "true")
                        : (user.darkMode === true));

                user.darkMode = savedTheme;
                safeSetItem("user", JSON.stringify(user));
                if (user.name) safeSetItem("userName", user.name);
                if (user.email) safeSetItem("profileEmail", user.email);
                if (user.mobile !== undefined) safeSetItem("profileMobile", user.mobile);
                if (user.location !== undefined) safeSetItem("profileLocation", user.location);
                if (user.language) safeSetItem("profileLanguage", user.language);

                KisanAPI.setTheme(savedTheme, user);
            } catch (err) {
                console.warn("setUser encountered non-fatal storage warning:", err.message);
            }
        }
    },

    getThemeKey: (user) => {
        const u = user || KisanAPI.getUser();
        const email = (u?.email || localStorage.getItem("profileEmail") || "").trim().toLowerCase();
        return email ? `darkMode:${email}` : "";
    },

    isAuthenticated: () => {
        try {
            const token = KisanAPI.getToken();
            const user = KisanAPI.getUser();
            return Boolean(token || user);
        } catch (e) {
            return false;
        }
    },

    isAuthPage: () => {
        if (typeof window === "undefined" || !window.location) return false;
        const path = (window.location.pathname || "").toLowerCase();
        const file = path.split("/").pop() || "";
        const isAuthUrl = file === "login.html" || file === "register.html" || file === "login" || file === "register";
        const isAuthClass = (document.body && document.body.classList && document.body.classList.contains("auth-page")) ||
                            (document.documentElement && document.documentElement.classList && document.documentElement.classList.contains("auth-page"));
        return isAuthUrl || isAuthClass;
    },

    isSplashPage: () => {
        if (typeof window === "undefined" || !window.location) return false;
        const path = (window.location.pathname || "").toLowerCase();
        const file = path.split("/").pop() || "";
        const isSplashUrl = file === "index.html" || file === "index" || file === "";
        const isSplashClass = (document.body && document.body.classList && document.body.classList.contains("splash-page")) ||
                              (document.documentElement && document.documentElement.classList && document.documentElement.classList.contains("splash-page"));
        return isSplashUrl || isSplashClass;
    },

    checkAuthGuard: () => {
        if (typeof window === "undefined" || !window.location) return;

        // Splash screen (index.html) must always show first when opening the application.
        if (KisanAPI.isSplashPage()) {
            return;
        }

        const authenticated = KisanAPI.isAuthenticated();
        const authPage = KisanAPI.isAuthPage();

        if (authenticated && authPage) {
            window.location.replace("dashboard.html");
        } else if (!authenticated && !authPage) {
            window.location.replace("login.html");
        }
    },

    getTheme: (user) => {
        if (KisanAPI.isAuthPage()) {
            return false;
        }
        const u = user || KisanAPI.getUser();
        const key = KisanAPI.getThemeKey(u);
        if (key && localStorage.getItem(key) !== null) {
            return localStorage.getItem(key) === "true";
        }
        if (localStorage.getItem("userDarkMode") !== null) {
            return localStorage.getItem("userDarkMode") === "true";
        }
        if (typeof u?.darkMode === "boolean") {
            return u.darkMode;
        }
        return false;
    },

    setTheme: (isDark, user) => {
        const isDarkBool = isDark === true;
        const u = user || KisanAPI.getUser();
        if (u) u.darkMode = isDarkBool;
        const key = KisanAPI.getThemeKey(u);
        if (key) safeSetItem(key, isDarkBool ? "true" : "false");
        safeSetItem("userDarkMode", isDarkBool ? "true" : "false");
        localStorage.removeItem("darkMode"); // Remove legacy un-scoped theme key
        try {
            const cachedUser = JSON.parse(localStorage.getItem("user") || "null");
            if (cachedUser) {
                cachedUser.darkMode = isDarkBool;
                safeSetItem("user", JSON.stringify(cachedUser));
            }
        } catch (e) {}
    },

    applyTheme: (user) => {
        if (KisanAPI.isAuthPage()) {
            if (document.body) document.body.classList.remove("dark");
            if (document.documentElement) document.documentElement.classList.remove("dark");
            return false;
        }
        const isDark = KisanAPI.getTheme(user);
        if (isDark) {
            if (document.body) document.body.classList.add("dark");
            if (document.documentElement) document.documentElement.classList.add("dark");
        } else {
            if (document.body) document.body.classList.remove("dark");
            if (document.documentElement) document.documentElement.classList.remove("dark");
        }
        return isDark;
    },
    
    clearAuth: () => {
        document.body.classList.remove("dark");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("userName");
        localStorage.removeItem("profileEmail");
        localStorage.removeItem("profileMobile");
        localStorage.removeItem("profileLocation");
        localStorage.removeItem("profileLanguage");
        localStorage.removeItem("cropPreviewImage");
        localStorage.removeItem("profileImage");
        localStorage.removeItem("profileImageOwner");
        localStorage.removeItem("darkMode");
        localStorage.removeItem("userDarkMode");
    },

    getAvatar: (user) => (user && !isDefaultAvatar(user.avatar) ? user.avatar : getSavedAvatar(user)),
    setAvatar: (avatar, user) => saveAvatar(avatar, user || KisanAPI.getUser()),
    
    isBackendUnreachable: (error) => {
        if (!error) return false;
        if (error.isNetworkOrParseError) return true;
        const msg = String(error.message || "").toLowerCase();
        return msg.includes("failed to fetch") ||
               msg.includes("networkerror") ||
               msg.includes("unexpected token") ||
               msg.includes("not valid json") ||
               msg.includes("failed to communicate") ||
               msg.includes("non-json response") ||
               msg.includes("service endpoint not found") ||
               msg.includes("backend service error");
    },
    
    request: async (endpoint, options = {}) => {
        const url = `${API_BASE_URL}${endpoint}`;
        const headers = options.headers || {};
        
        const token = KisanAPI.getToken();
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
        
        if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
            headers["Content-Type"] = "application/json";
        }
        
        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            const contentType = response.headers.get("content-type") || "";
            let data = null;

            if (contentType.includes("application/json")) {
                try {
                    data = await response.json();
                } catch (jsonErr) {
                    console.warn(`API JSON parse error [${endpoint}]:`, jsonErr.message);
                    data = null;
                }
            } else {
                const rawText = await response.text();
                try {
                    data = JSON.parse(rawText);
                } catch (e) {
                    data = null;
                }
            }

            if (!response.ok) {
                const errMsg = (data && data.message)
                    ? data.message
                    : `Backend service error (${response.status})`;
                const err = new Error(errMsg);
                err.status = response.status;
                if (response.status === 404 || response.status >= 500) {
                    err.isNetworkOrParseError = true;
                }
                throw err;
            }

            if (!data) {
                const err = new Error(`Failed to communicate with API service (${response.status})`);
                err.isNetworkOrParseError = true;
                throw err;
            }

            return data;
        } catch (error) {
            console.warn(`API Error [${endpoint}]:`, error.message);
            if (error.name === "SyntaxError" || error.message.includes("is not valid JSON") || error.message.includes("Unexpected token")) {
                const normalizedErr = new Error("Failed to communicate with API backend service.");
                normalizedErr.isNetworkOrParseError = true;
                throw normalizedErr;
            }
            if (error.message.toLowerCase().includes("failed to fetch") || error.message.toLowerCase().includes("networkerror")) {
                error.isNetworkOrParseError = true;
            }
            throw error;
        }
    }
};

window.KisanAPI = KisanAPI;

// Modern, accessible notifications & styled alerts shared by every screen.
(() => {
    const styleId = "kisan-toast-styles";
    if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = `
            .kisan-toast-region {
                position: fixed;
                z-index: 100000;
                top: max(16px, env(safe-area-inset-top));
                right: 16px;
                width: min(400px, calc(100vw - 32px));
                display: flex;
                flex-direction: column;
                gap: 12px;
                pointer-events: none;
            }
            .kisan-toast {
                --toast-color: #2e7d32;
                --toast-bg: rgba(255, 255, 255, 0.94);
                --toast-text: #1b261d;
                --toast-border: rgba(46, 125, 50, 0.25);
                position: relative;
                display: grid;
                grid-template-columns: 42px 1fr auto;
                align-items: center;
                gap: 12px;
                padding: 14px 16px;
                border: 1.5px solid var(--toast-border);
                border-radius: 18px;
                background: var(--toast-bg);
                color: var(--toast-text);
                box-shadow: 0 12px 35px rgba(0, 0, 0, 0.16), 0 4px 12px rgba(0, 0, 0, 0.08);
                backdrop-filter: blur(16px);
                -webkit-backdrop-filter: blur(16px);
                pointer-events: auto;
                animation: kisan-toast-in 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
                overflow: hidden;
            }
            body.dark .kisan-toast {
                --toast-bg: rgba(23, 34, 25, 0.94);
                --toast-text: #f0f4f1;
                --toast-border: rgba(255, 255, 255, 0.15);
                box-shadow: 0 14px 40px rgba(0, 0, 0, 0.45);
            }
            .kisan-toast::after {
                content: "";
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: var(--toast-color);
                animation: kisan-toast-progress 4.5s linear forwards;
            }
            .kisan-toast.is-error { --toast-color: #e53935; --toast-border: rgba(229, 57, 53, 0.3); }
            .kisan-toast.is-info { --toast-color: #1e88e5; --toast-border: rgba(30, 136, 229, 0.3); }
            .kisan-toast.is-warning { --toast-color: #ff8f00; --toast-border: rgba(255, 143, 0, 0.3); }
            .kisan-toast.is-success { --toast-color: #2e7d32; --toast-border: rgba(46, 125, 50, 0.3); }

            .kisan-toast__icon {
                width: 42px;
                height: 42px;
                border-radius: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(46, 125, 50, 0.12);
                color: var(--toast-color);
                font-size: 20px;
                font-weight: 700;
                flex-shrink: 0;
            }
            .kisan-toast.is-error .kisan-toast__icon { background: rgba(229, 57, 53, 0.12); }
            .kisan-toast.is-info .kisan-toast__icon { background: rgba(30, 136, 229, 0.12); }
            .kisan-toast.is-warning .kisan-toast__icon { background: rgba(255, 143, 0, 0.12); }

            .kisan-toast__content {
                display: flex;
                flex-direction: column;
                gap: 2px;
            }
            .kisan-toast__title {
                font-size: 0.88rem;
                font-weight: 700;
                color: var(--toast-color);
                line-height: 1.2;
            }
            .kisan-toast__message {
                margin: 0;
                font-size: 0.88rem;
                line-height: 1.4;
                color: var(--toast-text);
                font-weight: 400;
            }
            .kisan-toast__close {
                border: none;
                background: rgba(0, 0, 0, 0.05);
                color: var(--toast-text);
                width: 28px;
                height: 28px;
                border-radius: 50%;
                font-size: 16px;
                line-height: 1;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.2s;
                opacity: 0.7;
            }
            body.dark .kisan-toast__close {
                background: rgba(255, 255, 255, 0.1);
            }
            .kisan-toast__close:hover {
                opacity: 1;
                background: rgba(0, 0, 0, 0.12);
            }
            .kisan-toast.is-leaving {
                animation: kisan-toast-out 0.25s ease forwards;
            }

            /* Custom Dialog Overlay */
            .kisan-dialog-backdrop {
                position: fixed;
                z-index: 100001;
                inset: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                background: rgba(10, 25, 14, 0.55);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                animation: kisan-fade-in 0.2s ease both;
            }
            .kisan-dialog {
                width: min(400px, 100%);
                padding: 28px 24px 24px;
                border-radius: 24px;
                background: #ffffff;
                color: #1b261d;
                border: 1px solid rgba(255, 255, 255, 0.3);
                box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);
                text-align: center;
                animation: kisan-dialog-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
            }
            body.dark .kisan-dialog {
                background: #1b261d;
                color: #f0f4f1;
                border-color: rgba(255, 255, 255, 0.1);
            }
            .kisan-dialog__icon {
                width: 56px;
                height: 56px;
                margin: 0 auto 16px;
                border-radius: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(46, 125, 50, 0.12);
                color: #2e7d32;
                font-size: 26px;
            }
            .kisan-dialog h3 {
                margin: 0 0 8px;
                font-size: 1.2rem;
                font-weight: 700;
            }
            .kisan-dialog p {
                margin: 0 0 22px;
                font-size: 0.95rem;
                line-height: 1.5;
                opacity: 0.85;
            }
            .kisan-dialog__actions {
                display: flex;
                gap: 10px;
                justify-content: center;
            }
            .kisan-dialog__btn {
                flex: 1;
                border: none;
                border-radius: 14px;
                padding: 12px 20px;
                font-family: inherit;
                font-size: 0.95rem;
                font-weight: 650;
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
            }
            .kisan-dialog__cancel {
                background: rgba(0, 0, 0, 0.07);
                color: inherit;
            }
            body.dark .kisan-dialog__cancel {
                background: rgba(255, 255, 255, 0.1);
            }
            .kisan-dialog__confirm {
                background: linear-gradient(135deg, #2e7d32, #1b5e20);
                color: #ffffff;
                box-shadow: 0 6px 18px rgba(46, 125, 50, 0.35);
            }
            .kisan-dialog__confirm:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 22px rgba(46, 125, 50, 0.45);
            }

            @keyframes kisan-toast-in {
                from { opacity: 0; transform: translateY(-16px) scale(0.94); }
                to { opacity: 1; transform: none; }
            }
            @keyframes kisan-toast-out {
                to { opacity: 0; transform: translateY(-12px) scale(0.96); }
            }
            @keyframes kisan-toast-progress {
                to { transform: scaleX(0); }
            }
            @keyframes kisan-fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes kisan-dialog-in {
                from { opacity: 0; transform: scale(0.9); }
                to { opacity: 1; transform: scale(1); }
            }
            @media (max-width: 480px) {
                .kisan-toast-region {
                    top: 12px;
                    left: 12px;
                    right: 12px;
                    width: calc(100vw - 24px);
                }
            }
        `;
        (document.head || document.documentElement).appendChild(style);
    }

    const getRegion = () => {
        let region = document.querySelector(".kisan-toast-region");
        if (!region) {
            region = document.createElement("div");
            region.className = "kisan-toast-region";
            region.setAttribute("aria-live", "polite");
            (document.body || document.documentElement).appendChild(region);
        }
        return region;
    };

    const sanitizeMessage = (msg) => {
        const text = String(msg || "");
        if (text.includes("is not valid JSON") || text.includes("Unexpected token") || text.includes("SyntaxError")) {
            return "Unable to connect to the backend server. Operating in local mode.";
        }
        return text;
    };

    const getType = (message, requestedType) => {
        if (requestedType) return requestedType;
        if (/fail|error|invalid|unable|please select|please enter|please fill/i.test(message)) return "error";
        if (/success|updated|welcome|saved|login successful/i.test(message)) return "success";
        if (/notifications|weather|alert|warning/i.test(message)) return "info";
        return "info";
    };

    const icons = { success: "✓", error: "✕", warning: "⚠", info: "🔔" };
    const titles = { success: "Success", error: "Notification", warning: "Alert", info: "Kisan Mitra AI" };

    const notify = (message, options = {}) => {
        const cleanMsg = sanitizeMessage(message);
        const type = getType(cleanMsg, options.type);
        const region = getRegion();

        const toast = document.createElement("article");
        toast.className = `kisan-toast is-${type}`;
        toast.setAttribute("role", type === "error" ? "alert" : "status");

        const icon = document.createElement("span");
        icon.className = "kisan-toast__icon";
        icon.textContent = options.icon || icons[type];

        const copy = document.createElement("div");
        copy.className = "kisan-toast__content";

        const title = document.createElement("strong");
        title.className = "kisan-toast__title";
        title.textContent = options.title || titles[type];

        const text = document.createElement("p");
        text.className = "kisan-toast__message";
        text.textContent = cleanMsg;

        const close = document.createElement("button");
        close.className = "kisan-toast__close";
        close.type = "button";
        close.setAttribute("aria-label", "Dismiss notification");
        close.textContent = "✕";

        copy.append(title, text);
        toast.append(icon, copy, close);
        region.appendChild(toast);

        const dismiss = () => {
            if (!toast.isConnected) return;
            toast.classList.add("is-leaving");
            setTimeout(() => toast.remove(), 250);
        };

        close.addEventListener("click", dismiss);
        setTimeout(dismiss, options.duration ?? 4500);
        return toast;
    };

    const confirm = (message, options = {}) => new Promise((resolve) => {
        const backdrop = document.createElement("div");
        backdrop.className = "kisan-dialog-backdrop";

        const dialog = document.createElement("section");
        dialog.className = "kisan-dialog";
        dialog.setAttribute("role", "dialog");
        dialog.setAttribute("aria-modal", "true");

        const icon = document.createElement("div");
        icon.className = "kisan-dialog__icon";
        icon.textContent = options.icon || "🔔";

        const heading = document.createElement("h3");
        heading.textContent = options.title || "Kisan Mitra AI";

        const text = document.createElement("p");
        text.textContent = sanitizeMessage(message);

        const actions = document.createElement("div");
        actions.className = "kisan-dialog__actions";

        const accept = document.createElement("button");
        accept.type = "button";
        accept.className = "kisan-dialog__btn kisan-dialog__confirm";
        accept.textContent = options.confirmText || "OK";

        const close = (value) => {
            backdrop.remove();
            document.removeEventListener("keydown", onKey);
            resolve(value);
        };

        const onKey = (event) => { if (event.key === "Escape") close(false); };

        if (options.showCancel) {
            const cancel = document.createElement("button");
            cancel.type = "button";
            cancel.className = "kisan-dialog__btn kisan-dialog__cancel";
            cancel.textContent = options.cancelText || "Cancel";
            cancel.addEventListener("click", () => close(false));
            actions.append(cancel);
        }

        accept.addEventListener("click", () => close(true));
        backdrop.addEventListener("click", (event) => { if (event.target === backdrop) close(false); });

        actions.append(accept);
        dialog.append(icon, heading, text, actions);
        backdrop.appendChild(dialog);

        const parent = document.body || document.documentElement;
        parent.appendChild(backdrop);
        document.addEventListener("keydown", onKey);
        accept.focus();
    });

    window.KisanNotify = { notify, confirm };
    window.alert = (message) => notify(message);
})();

// Auto-apply theme and enforce central auth guard immediately when config.js loads
if (typeof window !== "undefined") {
    if (window.KisanAPI) {
        window.KisanAPI.checkAuthGuard();
    }
    if (typeof document !== "undefined") {
        if (document.body) {
            if (window.KisanAPI) window.KisanAPI.applyTheme();
        } else {
            document.addEventListener("DOMContentLoaded", () => {
                if (window.KisanAPI) {
                    window.KisanAPI.applyTheme();
                    window.KisanAPI.checkAuthGuard();
                }
            });
        }
    }
    window.addEventListener("pageshow", () => {
        if (window.KisanAPI) {
            window.KisanAPI.checkAuthGuard();
        }
    });
}
