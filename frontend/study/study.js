// ===== Auth Guard =====
authGuard();

// ===== Logout =====
document.getElementById("logoutBtn").addEventListener("click", function (e) {
    e.preventDefault();
    logout();
});

// ===== Cargar flashcards desde localStorage =====
var flashcards = [];
var topic = "Flashcards";
var currentIndex = 0;
var showingAnswer = false;

try {
    var stored = localStorage.getItem("study_flashcards");
    var storedTopic = localStorage.getItem("study_topic");
    if (stored) {
        flashcards = JSON.parse(stored);
    }
    if (storedTopic) {
        topic = storedTopic;
    }
} catch (e) {
    // fallback
}

// Si no hay flashcards, redirigir
if (flashcards.length === 0) {
    showToast("No hay flashcards para estudiar", "error");
    setTimeout(function () {
        window.location.href = "../index/index.html";
    }, 1500);
}

// ===== DOM =====
var studyTopic = document.getElementById("study-topic");
var studyProgress = document.getElementById("study-progress");
var cardLabel = document.getElementById("card-label");
var cardText = document.getElementById("card-text");
var revealBtn = document.getElementById("revealBtn");
var prevBtn = document.getElementById("prevBtn");
var nextBtn = document.getElementById("nextBtn");
var dotsContainer = document.getElementById("dots-container");
var backLink = document.getElementById("backLink");

// ===== Volver (navega a la página anterior) =====
backLink.addEventListener("click", function (e) {
    e.preventDefault();
    window.history.back();
});

// ===== Inicializar =====
studyTopic.textContent = "Estudiando: " + topic;

// Crear dots
function createDots() {
    dotsContainer.innerHTML = "";
    flashcards.forEach(function (_, i) {
        var dot = document.createElement("span");
        dot.className = "dot" + (i === currentIndex ? " active" : "");
        dotsContainer.appendChild(dot);
    });
}

// Actualizar dots
function updateDots() {
    var dots = dotsContainer.querySelectorAll(".dot");
    dots.forEach(function (dot, i) {
        if (i === currentIndex) {
            dot.classList.add("active");
        } else {
            dot.classList.remove("active");
        }
    });
}

// ===== Mostrar flashcard actual =====
function showCard() {
    var card = flashcards[currentIndex];
    showingAnswer = false;

    studyProgress.textContent = "Flashcard " + (currentIndex + 1) + " de " + flashcards.length;

    cardLabel.textContent = "Pregunta";
    cardText.textContent = card.question;
    revealBtn.textContent = "Mostrar Respuesta";

    // Animación
    cardText.classList.remove("flip-in");
    void cardText.offsetHeight; // force reflow
    cardText.classList.add("flip-in");

    // Actualizar botones de navegación
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === flashcards.length - 1;

    updateDots();
}

// ===== Revelar / Ocultar respuesta =====
revealBtn.addEventListener("click", function () {
    toggleAnswer();
});

function toggleAnswer() {
    var card = flashcards[currentIndex];

    if (!showingAnswer) {
        cardLabel.textContent = "Respuesta";
        cardText.textContent = card.answer;
        revealBtn.textContent = "Mostrar Pregunta";
        showingAnswer = true;
    } else {
        cardLabel.textContent = "Pregunta";
        cardText.textContent = card.question;
        revealBtn.textContent = "Mostrar Respuesta";
        showingAnswer = false;
    }

    // Animación
    cardText.classList.remove("flip-in");
    void cardText.offsetHeight;
    cardText.classList.add("flip-in");
}

// ===== Navegación =====
prevBtn.addEventListener("click", function () {
    goToPrev();
});

nextBtn.addEventListener("click", function () {
    goToNext();
});

function goToPrev() {
    if (currentIndex > 0) {
        currentIndex--;
        showCard();
    }
}

function goToNext() {
    if (currentIndex < flashcards.length - 1) {
        currentIndex++;
        showCard();
    }
}

// ===== Keyboard Shortcuts =====
document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") {
        goToPrev();
    } else if (e.key === "ArrowRight") {
        goToNext();
    } else if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        toggleAnswer();
    }
});

// ===== Init =====
createDots();
showCard();
