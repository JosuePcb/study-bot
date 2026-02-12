// ===== Auth Guard =====
authGuard();

// ===== DOM references =====
var setsView = document.getElementById("sets-view");
var detailView = document.getElementById("detail-view");
var setsContainer = document.getElementById("sets-container");
var emptyState = document.getElementById("empty-state");
var loadingEl = document.getElementById("loading");
var flashcardsContainer = document.getElementById("flashcards-container");
var detailTopic = document.getElementById("detail-topic");
var detailMeta = document.getElementById("detail-meta");
var backBtn = document.getElementById("back-btn");
var studyModeBtn = document.getElementById("study-mode-btn");

// Estado actual del set abierto
var currentDetailSet = null;

// ===== Logout =====
document.getElementById("logoutBtn").addEventListener("click", function (e) {
    e.preventDefault();
    logout();
});

// ===== Format date =====
function formatDate(dateStr) {
    var date = new Date(dateStr);
    var options = { year: "numeric", month: "short", day: "numeric" };
    return date.toLocaleDateString("es-ES", options);
}

// ===== Cargar sets desde la API =====
async function loadSets() {
    loadingEl.style.display = "flex";
    setsContainer.innerHTML = "";
    emptyState.style.display = "none";

    try {
        var response = await authFetch("/my-flashcards/", {
            method: "GET",
        });

        if (!response) return;

        if (!response.ok) {
            throw new Error("Error al cargar flashcards");
        }

        var data = await response.json();

        // Parsear content_json de cada set
        var flashcardSets = data.map(function (set) {
            return {
                id: set.id,
                topic: set.topic,
                created_at: set.created_at,
                flashcards: JSON.parse(set.content_json),
            };
        });

        renderSets(flashcardSets);
    } catch (error) {
        showToast(error.message, "error");
    } finally {
        loadingEl.style.display = "none";
    }
}

// ===== Render set cards =====
function renderSets(flashcardSets) {
    setsContainer.innerHTML = "";

    if (flashcardSets.length === 0) {
        emptyState.style.display = "flex";
        return;
    }

    emptyState.style.display = "none";

    flashcardSets.forEach(function (set, index) {
        var card = document.createElement("div");
        card.className = "set-card fade-in";
        card.style.animationDelay = index * 0.08 + "s";
        card.setAttribute("role", "button");
        card.setAttribute("tabindex", "0");
        card.setAttribute("aria-label", "Abrir set de flashcards: " + set.topic);

        var count = set.flashcards ? set.flashcards.length : 0;

        card.innerHTML =
            '<div class="set-card-header">' +
            '<div class="set-card-icon">' +
            '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>' +
            '<path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>' +
            '</svg>' +
            '</div>' +
            '<span class="set-card-title">' + escapeHtml(set.topic) + '</span>' +
            '</div>' +
            '<div class="set-card-footer">' +
            '<span>' + count + ' flashcard' + (count !== 1 ? 's' : '') + ' · ' + formatDate(set.created_at) + '</span>' +
            '<span class="set-card-arrow">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<polyline points="9 18 15 12 9 6"></polyline>' +
            '</svg>' +
            '</span>' +
            '</div>';

        card.addEventListener("click", function () {
            openDetail(set);
        });

        card.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openDetail(set);
            }
        });

        setsContainer.appendChild(card);
    });
}

// ===== Open detail view =====
function openDetail(set) {
    currentDetailSet = set;
    setsView.style.display = "none";
    detailView.style.display = "flex";

    // Reset animation
    detailView.style.animation = "none";
    detailView.offsetHeight; // force reflow
    detailView.style.animation = "fade 0.8s ease-out forwards";

    detailTopic.textContent = set.topic;
    var count = set.flashcards ? set.flashcards.length : 0;
    detailMeta.textContent = count + " flashcard" + (count !== 1 ? "s" : "") + " · " + formatDate(set.created_at);

    renderFlashcards(set.flashcards);
}

// ===== Render individual flashcards =====
function renderFlashcards(flashcards) {
    flashcardsContainer.innerHTML = "";

    flashcards.forEach(function (card, index) {
        var cardDiv = document.createElement("div");
        cardDiv.className = "flashcard fade-in";
        cardDiv.style.animationDelay = index * 0.08 + "s";

        var questionDiv = document.createElement("div");
        questionDiv.className = "flashcard-content";
        questionDiv.textContent = card.question;
        questionDiv.style.display = "flex";

        var answerDiv = document.createElement("div");
        answerDiv.className = "flashcard-content";
        answerDiv.textContent = card.answer;
        answerDiv.style.display = "none";

        var showBtn = document.createElement("button");
        showBtn.className = "flashcard-show-btn";
        showBtn.textContent = "Mostrar Respuesta";

        showBtn.addEventListener("click", function () {
            questionDiv.classList.remove("fade-in");
            answerDiv.classList.remove("fade-in");

            if (questionDiv.style.display === "flex") {
                questionDiv.style.display = "none";
                answerDiv.style.display = "flex";
                answerDiv.classList.add("fade-in");
                showBtn.textContent = "Mostrar Pregunta";
            } else {
                questionDiv.style.display = "flex";
                answerDiv.style.display = "none";
                questionDiv.classList.add("fade-in");
                showBtn.textContent = "Mostrar Respuesta";
            }
        });

        cardDiv.appendChild(questionDiv);
        cardDiv.appendChild(answerDiv);
        cardDiv.appendChild(showBtn);

        flashcardsContainer.appendChild(cardDiv);
    });
}

// ===== Go back to sets view =====
backBtn.addEventListener("click", function () {
    currentDetailSet = null;
    detailView.style.display = "none";
    setsView.style.display = "flex";

    // Reset animation
    setsView.style.animation = "none";
    setsView.offsetHeight; // force reflow
    setsView.style.animation = "fade 0.8s ease-out forwards";
});

// ===== Study Mode =====
studyModeBtn.addEventListener("click", function () {
    if (currentDetailSet && currentDetailSet.flashcards) {
        localStorage.setItem("study_flashcards", JSON.stringify(currentDetailSet.flashcards));
        localStorage.setItem("study_topic", currentDetailSet.topic);
        window.location.href = "../study/study.html";
    }
});

// ===== HTML escaping =====
function escapeHtml(text) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
}

// ===== Init: cargar desde API =====
loadSets();
