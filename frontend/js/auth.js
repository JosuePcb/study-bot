// ===== Configuración de la API =====
var API_BASE_URL = "http://localhost:8000";

// ===== Manejo de Token =====

function saveToken(token) {
    localStorage.setItem("access_token", token);
}

function getToken() {
    return localStorage.getItem("access_token");
}

function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("study_flashcards");
    localStorage.removeItem("study_topic");
    window.location.href = "../login/login.html";
}

function isAuthenticated() {
    return getToken() !== null;
}

// Redirige al login si no está autenticado
function authGuard() {
    if (!isAuthenticated()) {
        window.location.href = "../login/login.html";
    }
}

// Fetch con autenticación automática
async function authFetch(url, options) {
    var token = getToken();
    if (!token) {
        logout();
        return;
    }

    options = options || {};
    options.headers = options.headers || {};
    options.headers["Authorization"] = "Bearer " + token;

    var response = await fetch(API_BASE_URL + url, options);

    if (response.status === 401) {
        logout();
        return;
    }

    return response;
}

// Mostrar notificación toast
function showToast(message, type) {
    // Remover toast anterior si existe
    var existing = document.getElementById("toast-notification");
    if (existing) existing.remove();

    var toast = document.createElement("div");
    toast.id = "toast-notification";
    toast.textContent = message;
    toast.style.cssText =
        "position:fixed;bottom:30px;left:50%;transform:translateX(-50%);padding:14px 28px;" +
        "border-radius:10px;font-family:'Roboto',sans-serif;font-weight:bold;font-size:0.95rem;" +
        "z-index:9999;opacity:0;transition:opacity 0.3s ease;" +
        "box-shadow:0 4px 20px rgba(0,0,0,0.3);";

    if (type === "error") {
        toast.style.backgroundColor = "#EF4444";
        toast.style.color = "white";
    } else {
        toast.style.backgroundColor = "#22C55E";
        toast.style.color = "white";
    }

    document.body.appendChild(toast);

    // Fade in
    setTimeout(function () {
        toast.style.opacity = "1";
    }, 10);

    // Fade out y remover
    setTimeout(function () {
        toast.style.opacity = "0";
        setTimeout(function () {
            toast.remove();
        }, 300);
    }, 3000);
}
