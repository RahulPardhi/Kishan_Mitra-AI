if (startBtn) {
    startBtn.addEventListener("click", () => {
        const isAuth = window.KisanAPI && window.KisanAPI.isAuthenticated();
        const targetPage = isAuth ? "dashboard.html" : "login.html";
        window.location.replace(targetPage);
    });
}