// ===== Auth Guard =====
authGuard();

// ===== Textarea auto-resize =====
var areaTexto = document.getElementById("request");

areaTexto.addEventListener("input", function () {
    this.style.height = "auto";
    this.style.height = this.scrollHeight + "px";
});

// ===== Logout =====
document.getElementById("logoutBtn").addEventListener("click", function (e) {
    e.preventDefault();
    logout();
});

// ===== Estado global de flashcards generadas =====
var currentFlashcards = [];

// ===== Generar Flashcards =====
var generateBtn = document.getElementById("generateBtn");
var loadingEl = document.getElementById("loading");
var flashcardsContainer = document.getElementById("flashcards-container");
var welcomeSection = document.getElementById("welcome-section");

generateBtn.addEventListener("click", async function () {
    var text = areaTexto.value.trim();

    if (!text) {
        showToast("Por favor ingresa texto para generar flashcards", "error");
        return;
    }

    if (text.length < 15) {
        showToast("El texto es muy corto. Ingresa más contenido.", "error");
        return;
    }

    // Mostrar loading, ocultar flashcards previas
    generateBtn.disabled = true;
    generateBtn.textContent = "Generando...";
    loadingEl.style.display = "flex";
    flashcardsContainer.style.display = "none";
    flashcardsContainer.innerHTML = "";

    try {
        var response = await authFetch("/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ text: text }),
        });

        if (!response) return; // authFetch handled redirect

        if (!response.ok) {
            var error = await response.json();
            throw new Error(error.detail || "Error al generar flashcards");
        }

        var data = await response.json();
        currentFlashcards = data.flashcards;
        displayFlashcards(data.flashcards);
    } catch (error) {
        showToast(error.message, "error");
    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = "Generar Flashcards";
        loadingEl.style.display = "none";
    }
});

// ===== Mostrar Flashcards Generadas =====
function displayFlashcards(flashcards) {
    flashcardsContainer.innerHTML = "";
    flashcardsContainer.style.display = "grid";

    // Ocultar welcome
    if (welcomeSection) welcomeSection.style.display = "none";

    // Subtítulo
    var subtitle = document.createElement("h2");
    subtitle.textContent = "Ingresa un título para guardar tus flashcards";
    subtitle.className = "subtitle";
    flashcardsContainer.appendChild(subtitle);

    // Input de título
    var inputTitle = document.createElement("input");
    inputTitle.type = "text";
    inputTitle.id = "topicInput";
    inputTitle.className = "title-flashcards";
    inputTitle.placeholder = "Título del tema";
    inputTitle.maxLength = "40";
    flashcardsContainer.appendChild(inputTitle);

    // Renderizar cada flashcard
    flashcards.forEach(function (card) {
        var cardDiv = document.createElement("div");
        cardDiv.className = "flashcard fade-in";

        var question = document.createElement("div");
        question.textContent = card.question;
        question.style.display = "flex";

        var answer = document.createElement("div");
        answer.textContent = card.answer;
        answer.style.display = "none";

        var showBtn = document.createElement("button");
        showBtn.textContent = "Mostrar Respuesta";
        showBtn.className = "showBtn";

        showBtn.onclick = function () {
            question.classList.remove("fade-in");
            answer.classList.remove("fade-in");

            if (question.style.display === "flex") {
                question.style.display = "none";
                answer.style.display = "flex";
                answer.classList.add("fade-in");
                showBtn.textContent = "Mostrar Pregunta";
            } else {
                question.style.display = "flex";
                answer.style.display = "none";
                question.classList.add("fade-in");
                showBtn.textContent = "Mostrar Respuesta";
            }
        };

        cardDiv.appendChild(question);
        cardDiv.appendChild(answer);
        cardDiv.appendChild(showBtn);
        flashcardsContainer.appendChild(cardDiv);
    });

    // Botones de acción: Guardar y Modo Estudio
    var actionsDiv = document.createElement("div");
    actionsDiv.className = "actions-row";

    var submitBtn = document.createElement("button");
    submitBtn.textContent = "Guardar Flashcards";
    submitBtn.id = "submitBtn";
    submitBtn.onclick = saveCurrentFlashcards;

    var studyBtn = document.createElement("button");
    studyBtn.textContent = "Modo Estudio";
    studyBtn.id = "studyBtn";
    studyBtn.onclick = function () {
        startStudyMode(currentFlashcards, document.getElementById("topicInput").value || "Flashcards");
    };

    actionsDiv.appendChild(submitBtn);
    actionsDiv.appendChild(studyBtn);
    flashcardsContainer.appendChild(actionsDiv);
}

// ===== Guardar Flashcards =====
async function saveCurrentFlashcards() {
    var topicInput = document.getElementById("topicInput");
    var topic = topicInput ? topicInput.value.trim() : "";

    if (!topic) {
        showToast("Por favor ingresa un título para el tema", "error");
        return;
    }

    if (currentFlashcards.length === 0) {
        showToast("No hay flashcards para guardar", "error");
        return;
    }

    var submitBtn = document.getElementById("submitBtn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Guardando...";

    try {
        var response = await authFetch("/save-flashcards/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                topic: topic,
                flashcards: currentFlashcards,
            }),
        });

        if (!response) return;

        if (!response.ok) {
            var error = await response.json();
            throw new Error(error.detail || "Error al guardar");
        }

        showToast("Flashcards guardadas exitosamente", "success");
    } catch (error) {
        showToast(error.message, "error");
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Guardar Flashcards";
    }
}

// ===== Iniciar Modo Estudio =====
function startStudyMode(flashcards, topic) {
    localStorage.setItem("study_flashcards", JSON.stringify(flashcards));
    localStorage.setItem("study_topic", topic);
    window.location.href = "../study/study.html";
}