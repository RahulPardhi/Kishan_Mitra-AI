// Kisan Mitra AI - Central Frontend API Configuration
const API_BASE_URL = "https://kishan-mitra-ai.onrender.com/api";
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
                if (user.mobile) safeSetItem("profileMobile", user.mobile);
                if (user.location) safeSetItem("profileLocation", user.location);
                if (user.language) safeSetItem("profileLanguage", user.language);
            } catch (err) {
                console.warn("setUser encountered non-fatal storage warning:", err.message);
            }
        }
    },
    
    clearAuth: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("userName");
    },

    getAvatar: (user) => (user && !isDefaultAvatar(user.avatar) ? user.avatar : getSavedAvatar(user)),
    setAvatar: (avatar, user) => saveAvatar(avatar, user || KisanAPI.getUser()),
    
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
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || `Request failed with status ${response.status}`);
            }
            return data;
        } catch (error) {
            console.warn(`API Error [${endpoint}]:`, error.message);
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

    const getType = (message, requestedType) => {
        if (requestedType) return requestedType;
        if (/fail|error|invalid|unable|please select|please enter|please fill/i.test(message)) return "error";
        if (/success|updated|welcome|saved|login successful/i.test(message)) return "success";
        return "info";
    };
    const icons = { success: "✓", error: "!", warning: "!", info: "i" };
    const titles = { success: "Success", error: "Action needed", warning: "Please note", info: "Kisan Mitra" };

    const notify = (message, options = {}) => {
        const type = getType(String(message || ""), options.type);
        const toast = document.createElement("article");
        toast.className = `kisan-toast is-${type}`;
        toast.setAttribute("role", type === "error" ? "alert" : "status");
        const icon = document.createElement("span"); icon.className = "kisan-toast__icon"; icon.textContent = icons[type];
        const copy = document.createElement("div");
        const title = document.createElement("strong"); title.className = "kisan-toast__title"; title.textContent = options.title || titles[type];
        const text = document.createElement("p"); text.className = "kisan-toast__message"; text.textContent = String(message || "");
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
