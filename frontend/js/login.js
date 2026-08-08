// Auth pages strictly remain in Light Mode
document.body.classList.remove("dark");
if (window.KisanAPI) {
    window.KisanAPI.applyTheme();
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
// Login Form Submission & Validation
// ===========================

const emailInput = document.getElementById("loginEmail") || document.querySelector("input[type='email']");
const emailBox = document.getElementById("emailBox") || (emailInput ? emailInput.parentElement : null);
const passwordBox = document.getElementById("passwordBox") || (password ? password.parentElement : null);

const emailErrEl = document.getElementById("loginEmailError");
const passErrEl = document.getElementById("loginPasswordError");

function clearLoginErrors() {
    if (emailErrEl) { emailErrEl.textContent = ""; emailErrEl.classList.remove("show"); }
    if (passErrEl) { passErrEl.textContent = ""; passErrEl.classList.remove("show"); }
    if (emailBox) emailBox.classList.remove("has-error");
    if (passwordBox) passwordBox.classList.remove("has-error");
}

function showLoginError(element, box, message) {
    if (element) {
        element.textContent = message;
        element.classList.add("show");
    }
    if (box) {
        box.classList.add("has-error");
    }
}

if (emailInput) {
    emailInput.addEventListener("input", () => {
        if (emailErrEl) { emailErrEl.textContent = ""; emailErrEl.classList.remove("show"); }
        if (emailBox) emailBox.classList.remove("has-error");
    });
}

if (password) {
    password.addEventListener("input", () => {
        if (passErrEl) { passErrEl.textContent = ""; passErrEl.classList.remove("show"); }
        if (passwordBox) passwordBox.classList.remove("has-error");
    });
}

if (loginBtn) {
    loginBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        clearLoginErrors();

        const email = emailInput ? emailInput.value.trim() : "";
        const pass = password ? password.value.trim() : "";

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        let hasError = false;

        if (!email) {
            showLoginError(emailErrEl, emailBox, "Please enter your email address.");
            hasError = true;
        } else if (!emailRegex.test(email)) {
            showLoginError(emailErrEl, emailBox, "Please enter a valid email address.");
            hasError = true;
        }

        if (!pass) {
            showLoginError(passErrEl, passwordBox, "Please enter your password.");
            hasError = true;
        }

        if (hasError) {
            return;
        }

        loginBtn.disabled = true;
        const originalText = loginBtn.innerText;
        loginBtn.innerText = "Logging in...";

        try {
            if (!window.KisanAPI) {
                throw new Error("API service unavailable. Please try again.");
            }

            const res = await window.KisanAPI.request("/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password: pass }),
            });

            if (res && res.success) {
                window.KisanAPI.setToken(res.token);
                window.KisanAPI.setUser(res.user);
                alert("Login Successful! 🚀");
                window.location.href = "dashboard.html";
                return;
            }

            throw new Error(res?.message || "Invalid email or password.");
        } catch (err) {
            console.error("Login error:", err.message);
            const errMsg = err.message || "Invalid email or password. Please check your credentials.";
            
            if (window.KisanAPI && window.KisanAPI.isBackendUnreachable(err)) {
                alert("Unable to connect to the authentication server. Please make sure the backend server is running.");
            } else {
                alert(errMsg);
                showLoginError(passErrEl, passwordBox, errMsg);
            }
        } finally {
            loginBtn.disabled = false;
            loginBtn.innerText = originalText;
        }
    });
}