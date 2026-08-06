// Apply Dark Mode on Page Load
if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
}

// ======================================
// Kisan Mitra AI - Profile Management
// ======================================

const editBtn = document.getElementById("editBtn");
const saveBtn = document.getElementById("saveBtn");

const userNameEl = document.getElementById("userName");
const emailInput = document.getElementById("email");
const mobileInput = document.getElementById("mobile");
const locationInput = document.getElementById("location");
const languageSelect = document.getElementById("language");

const profilePhoto = document.getElementById("profilePhoto");
const photoInput = document.getElementById("photoInput");

// Load Profile Data from Backend API or localStorage
async function loadProfile() {
    let user = window.KisanAPI ? window.KisanAPI.getUser() : null;
    const cachedAvatar = window.KisanAPI
        ? (window.KisanAPI.getAvatar(user) || (user && user.avatar))
        : (localStorage.getItem("profileImage") || (user && user.avatar));

    // Set avatar immediately on page load to prevent image disappearance on refresh
    if (profilePhoto && cachedAvatar) {
        profilePhoto.src = cachedAvatar;
    }

    if (user) {
        if (userNameEl) userNameEl.innerText = user.name || "Kisan Mitra User";
        if (emailInput) emailInput.value = user.email || "";
        if (mobileInput) mobileInput.value = user.mobile || "";
        if (locationInput) locationInput.value = user.location || "";
        if (languageSelect) languageSelect.value = user.language || "en";
    } else {
        const storedName = localStorage.getItem("userName");
        const storedEmail = localStorage.getItem("profileEmail");
        const storedMobile = localStorage.getItem("profileMobile");
        const storedLocation = localStorage.getItem("profileLocation");
        const storedLang = localStorage.getItem("profileLanguage");

        if (userNameEl) userNameEl.innerText = storedName || "Kisan Mitra User";
        if (emailInput) emailInput.value = storedEmail || "";
        if (mobileInput) mobileInput.value = storedMobile || "";
        if (locationInput) locationInput.value = storedLocation || "";
        if (languageSelect) languageSelect.value = storedLang || "en";
    }

    // Fetch latest remote profile if user has an active token
    if (window.KisanAPI && window.KisanAPI.getToken()) {
        try {
            const res = await window.KisanAPI.request("/auth/profile");
            if (res && res.success && res.user) {
                const remoteUser = res.user;

                // Preserve local avatar if remote avatar is empty
                if (!remoteUser.avatar && cachedAvatar) {
                    remoteUser.avatar = cachedAvatar;
                }

                window.KisanAPI.setUser(remoteUser);

                if (userNameEl) userNameEl.innerText = remoteUser.name || "Kisan Mitra User";
                if (emailInput) emailInput.value = remoteUser.email || "";
                if (mobileInput) mobileInput.value = remoteUser.mobile || "";
                if (locationInput) locationInput.value = remoteUser.location || "";
                if (languageSelect) languageSelect.value = remoteUser.language || "en";

                const activeAvatar = remoteUser.avatar || cachedAvatar;
                if (profilePhoto && activeAvatar) {
                    profilePhoto.src = activeAvatar;
                    if (window.KisanAPI) window.KisanAPI.setAvatar(activeAvatar, remoteUser);
                }
            }
        } catch (e) {
            console.warn("Could not fetch remote profile, keeping local values:", e);
        }
    }
}

window.addEventListener("DOMContentLoaded", loadProfile);

// Edit Profile
if (editBtn && saveBtn) {
    editBtn.addEventListener("click", () => {
        if (emailInput) emailInput.removeAttribute("readonly");
        if (mobileInput) mobileInput.removeAttribute("readonly");
        if (locationInput) locationInput.removeAttribute("readonly");
        if (languageSelect) languageSelect.disabled = false;

        editBtn.style.display = "none";
        saveBtn.style.display = "block";
    });

    // Save Profile
    saveBtn.addEventListener("click", async () => {
        saveBtn.disabled = true;
        saveBtn.innerText = "Saving...";

        const currentAvatar = (profilePhoto && profilePhoto.src) ? profilePhoto.src : (localStorage.getItem("profileImage") || "");

        const payload = {
            email: emailInput ? emailInput.value : "",
            mobile: mobileInput ? mobileInput.value : "",
            location: locationInput ? locationInput.value : "",
            language: languageSelect ? languageSelect.value : "en",
            avatar: currentAvatar,
        };

        localStorage.setItem("profileEmail", payload.email);
        localStorage.setItem("profileMobile", payload.mobile);
        localStorage.setItem("profileLocation", payload.location);
        localStorage.setItem("profileLanguage", payload.language);
        if (payload.avatar && window.KisanAPI) window.KisanAPI.setAvatar(payload.avatar, window.KisanAPI.getUser());

        try {
            if (window.KisanAPI && window.KisanAPI.getToken()) {
                const res = await window.KisanAPI.request("/auth/profile", {
                    method: "PUT",
                    body: JSON.stringify(payload),
                });

                if (res && res.success && res.user) {
                    window.KisanAPI.setUser(res.user);
                }
            } else {
                let currentUser = (window.KisanAPI && window.KisanAPI.getUser()) || {};
                currentUser = { ...currentUser, ...payload };
                if (window.KisanAPI) window.KisanAPI.setUser(currentUser);
            }

            if (payload.language) {
                localStorage.setItem("language", payload.language);
                if (window.applyLanguage) window.applyLanguage(payload.language);
            }

            if (emailInput) emailInput.setAttribute("readonly", true);
            if (mobileInput) mobileInput.setAttribute("readonly", true);
            if (locationInput) locationInput.setAttribute("readonly", true);
            if (languageSelect) languageSelect.disabled = true;

            saveBtn.style.display = "none";
            editBtn.style.display = "block";

            alert("✅ Profile Updated Successfully!");
        } catch (err) {
            if (window.KisanAPI && window.KisanAPI.isBackendUnreachable(err)) {
                alert("✅ Profile Updated Successfully! (Saved locally)");
            } else {
                alert(err.message || "Failed to update profile.");
            }
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Save Changes`;
        }
    });
}

function resizeProfileImage(file) {
    const maxDimension = 600;

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("Could not read the selected image."));
        reader.onload = () => {
            const image = new Image();
            image.onerror = () => reject(new Error("The selected file is not a valid image."));
            image.onload = () => {
                const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
                const canvas = document.createElement("canvas");
                canvas.width = Math.max(1, Math.round(image.width * scale));
                canvas.height = Math.max(1, Math.round(image.height * scale));
                canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL("image/jpeg", 0.85));
            };
            image.src = reader.result;
        };
        reader.readAsDataURL(file);
    });
}

// Profile Image Upload Listener
if (photoInput && profilePhoto) {
    photoInput.addEventListener("change", async function () {
        const file = this.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            alert("Please select an image file.");
            this.value = "";
            return;
        }

        const previousAvatar = profilePhoto.src;

        try {
            const avatar = await resizeProfileImage(file);
            
            // 1. Immediately update image element src
            profilePhoto.src = avatar;

            // 2. Permanently save to localStorage
            if (window.KisanAPI) window.KisanAPI.setAvatar(avatar, window.KisanAPI.getUser());

            // 3. Update cached user object in localStorage
            let currentUser = (window.KisanAPI && window.KisanAPI.getUser()) || {};
            currentUser.avatar = avatar;
            if (window.KisanAPI) {
                window.KisanAPI.setUser(currentUser);
            }

            // 4. Sync with Backend API if token exists
            if (window.KisanAPI && window.KisanAPI.getToken()) {
                try {
                    const res = await window.KisanAPI.request("/auth/profile", {
                        method: "PUT",
                        body: JSON.stringify({ avatar }),
                    });

                    if (res && res.success && res.user) {
                        window.KisanAPI.setUser(res.user);
                    }
                } catch (apiErr) {
                    console.warn("Backend profile image sync warning (image stored locally):", apiErr.message);
                }
            }

            alert("📸 Profile picture updated and saved permanently!");
        } catch (err) {
            profilePhoto.src = previousAvatar;
            alert(err.message || "Failed to save the profile photo.");
        } finally {
            this.value = "";
        }
    });
}
