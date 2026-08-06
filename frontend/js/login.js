// Apply Dark Mode on Page Load
if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
}

// ===========================
// Password Show / Hide
// ===========================

const password = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");

if (togglePassword && password) {
    togglePassword.addEventListener("click", () => {
        if (password.type === "password") {
            password.type = "text";
            togglePassword.classList.remove("fa-eye");
            togglePassword.classList.add("fa-eye-slash");
        } else {
            password.type = "password";
            togglePassword.classList.remove("fa-eye-slash");
            togglePassword.classList.add("fa-eye");
        }
    });
}

// ===========================
// Login Button Animation
// ===========================

const loginBtn = document.querySelector(".login-btn");

if (loginBtn) {
    loginBtn.addEventListener("mouseenter", () => {
        loginBtn.style.transform = "translateY(-3px)";
    });

    loginBtn.addEventListener("mouseleave", () => {
        loginBtn.style.transform = "translateY(0)";
    });
}

// ===========================
// Google Button Animation
// ===========================

const googleBtn = document.querySelector(".google-btn");

if (googleBtn) {
    googleBtn.classList.add("is-disabled");
    googleBtn.setAttribute("disabled", "true");
    googleBtn.setAttribute("aria-disabled", "true");
    googleBtn.title = "Google Sign-In is temporarily disabled";

    googleBtn.addEventListener("click", (e) => {
        e.preventDefault();
        alert("Google Sign-In is currently disabled. Please sign in with your email and password.");
    });
}

// ===========================
// Login Form Submission
// ===========================

if (loginBtn) {
    loginBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        const emailInput = document.querySelector("input[type='email']");
        const email = emailInput ? emailInput.value.trim() : "";
        const pass = password ? password.value.trim() : "";

        if (email === "" || pass === "") {
            alert("Please enter Email and Password.");
            return;
        }

        loginBtn.disabled = true;
        const originalText = loginBtn.innerText;
        loginBtn.innerText = "Logging in...";

        try {
            if (window.KisanAPI) {
                try {
                    const res = await window.KisanAPI.request("/auth/login", {
                        method: "POST",
                        body: JSON.stringify({ email, password: pass }),
                    });

                    if (res && res.success) {
                        window.KisanAPI.registerLocalUser({ email, password: pass, ...res.user });
                        window.KisanAPI.setToken(res.token);
                        window.KisanAPI.setUser(res.user);
                        alert("Login Successful! 🚀");
                        window.location.href = "dashboard.html";
                        return;
                    }
                } catch (apiErr) {
                    console.warn("Backend API attempt note:", apiErr.message);
                    // If it's a valid API server response (e.g. 401 Invalid credentials), display error and stop
                    if (window.KisanAPI && !window.KisanAPI.isBackendUnreachable(apiErr)) {
                        alert(apiErr.message || "Invalid email or password.");
                        return;
                    }
                }
            }
            
            // Offline / Local auth check
            const registeredUser = window.KisanAPI ? window.KisanAPI.findRegisteredUser(email) : null;
            if (!registeredUser || registeredUser.password !== pass) {
                alert("Invalid email or password. Please check your credentials or register first.");
                return;
            }

            try {
                if (window.KisanAPI) {
                    window.KisanAPI.setToken("offline_token_" + Date.now());
                    window.KisanAPI.setUser(registeredUser);
                } else {
                    localStorage.setItem("profileEmail", registeredUser.email);
                    localStorage.setItem("userName", registeredUser.name);
                }
            } catch (storageErr) {
                console.warn("Storage warning during fallback login:", storageErr.message);
            }
            alert("Login Successful! 🚀");
            window.location.href = "dashboard.html";
        } catch (err) {
            console.error("Login error:", err);
            alert(err.message || "Login failed. Please check credentials.");
        } finally {
            loginBtn.disabled = false;
            loginBtn.innerText = originalText;
        }
    });
}