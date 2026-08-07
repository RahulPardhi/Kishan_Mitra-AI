// Kisan Mitra AI - Central Frontend API Configuration
const API_BASE_URL = (typeof window !== "undefined" && window.location && window.location.origin && window.location.origin.startsWith("http"))
    ? (window.location.origin.includes("onrender.com")
        ? "https://kishan-mitra-ai.onrender.com/api"
        : (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
            ? `http://${window.location.hostname}:5000/api`
            : `${window.location.origin}/api`)
    : "http://localhost:5000/api";
const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80";

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

const isDefaultAvatar = (avatar) => !avatar || avatar === DEFAULT_AVATAR;

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
                safeSetItem("user", JSON.stringify(user));
                if (user.name) safeSetItem("userName", user.name);
                if (user.email) safeSetItem("profileEmail", user.email);
                if (user.mobile !== undefined) safeSetItem("profileMobile", user.mobile);
                if (user.location !== undefined) safeSetItem("profileLocation", user.location);
                if (user.language) safeSetItem("profileLanguage", user.language);
                if (typeof user.darkMode === "boolean") KisanAPI.setTheme(user.darkMode, user);
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

    getTheme: (user) => {
        const u = user || KisanAPI.getUser();
        if (!u || (!u.email && !localStorage.getItem("profileEmail"))) return false; // Default light for unauthenticated / splash
        if (typeof u.darkMode === "boolean") return u.darkMode;
        const key = KisanAPI.getThemeKey(u);
        if (key && localStorage.getItem(key) !== null) {
            return localStorage.getItem(key) === "true";
        }
        return false;
    },

    setTheme: (isDark, user) => {
        const u = user || KisanAPI.getUser();
        if (u) u.darkMode = isDark;
        const key = KisanAPI.getThemeKey(u);
        if (key) safeSetItem(key, isDark ? "true" : "false");
        try {
            const cachedUser = JSON.parse(localStorage.getItem("user") || "null");
            if (cachedUser) {
                cachedUser.darkMode = isDark;
                safeSetItem("user", JSON.stringify(cachedUser));
            }
        } catch (e) {}
    },

    applyTheme: (user) => {
        const isDark = KisanAPI.getTheme(user);
        if (isDark) {
            document.body.classList.add("dark");
        } else {
            document.body.classList.remove("dark");
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

// Modern, accessible notifications shared by every screen that loads config.js.
// Existing alert(...) calls are redirected here so feature scripts do not need
// to duplicate UI code.
(() => {
    const style = document.createElement("style");
    style.textContent = `
        .kisan-toast-region { position: fixed; z-index: 9999; top: max(18px, env(safe-area-inset-top)); right: 18px; width: min(390px, calc(100vw - 36px)); display: grid; gap: 10px; pointer-events: none; }
        .kisan-toast { --notice-color: #2e7d32; display: grid; grid-template-columns: 38px 1fr auto; align-items: start; gap: 11px; padding: 14px 12px 14px 14px; border: 1px solid color-mix(in srgb, var(--notice-color) 20%, transparent); border-radius: 16px; background: color-mix(in srgb, var(--bg-surface, #fff) 96%, var(--notice-color)); color: var(--text-main, #202722); box-shadow: 0 16px 38px rgba(20, 45, 27, .18); backdrop-filter: blur(12px); pointer-events: auto; animation: kisan-toast-in .35s cubic-bezier(.22,1,.36,1) both; overflow: hidden; }
        .kisan-toast::after { content: ""; position: absolute; inset: auto 0 0; height: 3px; background: var(--notice-color); animation: kisan-toast-progress 4.5s linear forwards; }
        .kisan-toast.is-error { --notice-color: #dc2626; } .kisan-toast.is-info { --notice-color: #2563eb; } .kisan-toast.is-warning { --notice-color: #d97706; }
        .kisan-toast__icon { width: 38px; height: 38px; border-radius: 12px; display: grid; place-items: center; background: color-mix(in srgb, var(--notice-color) 14%, transparent); color: var(--notice-color); font-weight: 800; font-size: 18px; }
        .kisan-toast__title { display: block; margin: 1px 0 2px; color: var(--notice-color); font-size: .82rem; font-weight: 700; } .kisan-toast__message { margin: 0; font-size: .88rem; line-height: 1.45; }
        .kisan-toast__close { border: 0; background: transparent; color: var(--text-muted, #657267); font-size: 20px; line-height: 1; cursor: pointer; padding: 2px 4px; }
        .kisan-toast.is-leaving { animation: kisan-toast-out .22s ease forwards; }
        .kisan-dialog-backdrop { position: fixed; z-index: 10000; inset: 0; display: grid; place-items: center; padding: 20px; background: rgba(12, 25, 15, .48); backdrop-filter: blur(5px); animation: kisan-fade-in .2s ease both; }
        .kisan-dialog { width: min(390px, 100%); padding: 24px; border-radius: 22px; background: var(--bg-surface, #fff); color: var(--text-main, #202722); box-shadow: 0 24px 60px rgba(0,0,0,.25); animation: kisan-dialog-in .28s cubic-bezier(.22,1,.36,1) both; }
        .kisan-dialog__icon { width: 48px; height: 48px; display: grid; place-items: center; border-radius: 15px; background: #fff4e5; color: #d97706; font-size: 22px; } .kisan-dialog h3 { margin: 15px 0 7px; font-size: 1.12rem; } .kisan-dialog p { margin: 0; color: var(--text-muted, #657267); font-size: .92rem; line-height: 1.5; }
        .kisan-dialog__actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 22px; } .kisan-dialog__actions button { border: 0; border-radius: 10px; padding: 10px 16px; font: inherit; font-weight: 650; cursor: pointer; } .kisan-dialog__cancel { background: var(--border-light, #e8f5e9); color: var(--text-main, #202722); } .kisan-dialog__confirm { background: var(--primary, #2e7d32); color: #fff; box-shadow: 0 6px 14px rgba(46,125,50,.25); }
        @keyframes kisan-toast-in { from { opacity: 0; transform: translateX(24px) scale(.96); } to { opacity: 1; transform: none; } } @keyframes kisan-toast-out { to { opacity: 0; transform: translateX(18px) scale(.97); } } @keyframes kisan-toast-progress { to { transform: translateX(-100%); } } @keyframes kisan-fade-in { from { opacity: 0; } to { opacity: 1; } } @keyframes kisan-dialog-in { from { opacity: 0; transform: translateY(12px) scale(.97); } to { opacity: 1; transform: none; } }
        @media (max-width: 480px) { .kisan-toast-region { top: 12px; right: 12px; width: calc(100vw - 24px); } .kisan-dialog { padding: 21px; } }
        @media (prefers-reduced-motion: reduce) { .kisan-toast, .kisan-dialog-backdrop, .kisan-dialog { animation: none; } .kisan-toast::after { animation: none; } }
    `;
    document.head.appendChild(style);

    const region = document.createElement("div");
    region.className = "kisan-toast-region";
    region.setAttribute("aria-live", "polite");
    document.body.appendChild(region);

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
        return "info";
    };
    const icons = { success: "✓", error: "!", warning: "!", info: "i" };
    const titles = { success: "Success", error: "Action needed", warning: "Please note", info: "Kisan Mitra" };

    const notify = (message, options = {}) => {
        const cleanMsg = sanitizeMessage(message);
        const type = getType(cleanMsg, options.type);
        const toast = document.createElement("article");
        toast.className = `kisan-toast is-${type}`;
        toast.setAttribute("role", type === "error" ? "alert" : "status");
        const icon = document.createElement("span"); icon.className = "kisan-toast__icon"; icon.textContent = icons[type];
        const copy = document.createElement("div");
        const title = document.createElement("strong"); title.className = "kisan-toast__title"; title.textContent = options.title || titles[type];
        const text = document.createElement("p"); text.className = "kisan-toast__message"; text.textContent = cleanMsg;
        const close = document.createElement("button"); close.className = "kisan-toast__close"; close.type = "button"; close.setAttribute("aria-label", "Dismiss notification"); close.textContent = "×";
        copy.append(title, text); toast.append(icon, copy, close); region.appendChild(toast);
        const dismiss = () => { if (!toast.isConnected) return; toast.classList.add("is-leaving"); setTimeout(() => toast.remove(), 230); };
        close.addEventListener("click", dismiss);
        setTimeout(dismiss, options.duration ?? 4500);
        return toast;
    };

    const confirm = (message, options = {}) => new Promise((resolve) => {
        const backdrop = document.createElement("div"); backdrop.className = "kisan-dialog-backdrop";
        const dialog = document.createElement("section"); dialog.className = "kisan-dialog"; dialog.setAttribute("role", "dialog"); dialog.setAttribute("aria-modal", "true");
        const icon = document.createElement("div"); icon.className = "kisan-dialog__icon"; icon.textContent = options.icon || "↪";
        const heading = document.createElement("h3"); heading.textContent = options.title || "Please confirm";
        const text = document.createElement("p"); text.textContent = message;
        const actions = document.createElement("div"); actions.className = "kisan-dialog__actions";
        const cancel = document.createElement("button"); cancel.type = "button"; cancel.className = "kisan-dialog__cancel"; cancel.textContent = options.cancelText || "Cancel";
        const accept = document.createElement("button"); accept.type = "button"; accept.className = "kisan-dialog__confirm"; accept.textContent = options.confirmText || "Confirm";
        const close = (value) => { backdrop.remove(); document.removeEventListener("keydown", onKey); resolve(value); };
        const onKey = (event) => { if (event.key === "Escape") close(false); };
        cancel.addEventListener("click", () => close(false)); accept.addEventListener("click", () => close(true)); backdrop.addEventListener("click", (event) => { if (event.target === backdrop) close(false); });
        actions.append(cancel, accept); dialog.append(icon, heading, text, actions); backdrop.appendChild(dialog); document.body.appendChild(backdrop); document.addEventListener("keydown", onKey); accept.focus();
    });

    window.KisanNotify = { notify, confirm };
    window.alert = (message) => notify(message);
})();
