// Si ya está autenticado, redirigir al dashboard
if (isAuthenticated()) {
    window.location.href = "../index/index.html";
}

var loginForm = document.getElementById("loginForm");
var errorMsg = document.getElementById("error-msg");
var loginBtn = document.getElementById("loginBtn");

loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    errorMsg.textContent = "";

    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;

    loginBtn.textContent = "Ingresando...";
    loginBtn.disabled = true;

    try {
        var response = await fetch(API_BASE_URL + "/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body:
                "username=" +
                encodeURIComponent(email) +
                "&password=" +
                encodeURIComponent(password),
        });

        if (!response.ok) {
            var error = await response.json();
            throw new Error(error.detail || "Error al iniciar sesión");
        }

        var data = await response.json();
        saveToken(data.access_token);
        window.location.href = "../index/index.html";
    } catch (error) {
        errorMsg.textContent = error.message;
    } finally {
        loginBtn.textContent = "Iniciar Sesión";
        loginBtn.disabled = false;
    }
});
