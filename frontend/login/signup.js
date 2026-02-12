// Si ya está autenticado, redirigir al dashboard
if (isAuthenticated()) {
    window.location.href = "../index/index.html";
}

var signupForm = document.getElementById("signupForm");
var errorMsg = document.getElementById("error-msg");
var signupBtn = document.getElementById("signupBtn");

signupForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    errorMsg.textContent = "";

    var username = document.getElementById("username").value;
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;

    signupBtn.textContent = "Registrando...";
    signupBtn.disabled = true;

    try {
        var response = await fetch(API_BASE_URL + "/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email,
                username: username,
                password: password,
            }),
        });

        if (!response.ok) {
            var error = await response.json();
            throw new Error(error.detail || "Error al registrarse");
        }

        showToast("Cuenta creada exitosamente. Inicia sesión.", "success");
        setTimeout(function () {
            window.location.href = "login.html";
        }, 1500);
    } catch (error) {
        errorMsg.textContent = error.message;
    } finally {
        signupBtn.textContent = "Registrarse";
        signupBtn.disabled = false;
    }
});
