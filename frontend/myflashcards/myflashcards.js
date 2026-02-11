// ===== Mock Data =====
var flashcardSets = [
    {
        id: 1,
        topic: "JavaScript Fundamentals",
        created_at: "2026-02-10T14:30:00Z",
        flashcards: [
            { question: "What is a closure in JavaScript?", answer: "A closure is a function that retains access to its lexical scope even when the function is executed outside that scope." },
            { question: "What is the difference between let, const and var?", answer: "var is function-scoped and hoisted. let and const are block-scoped. const cannot be reassigned after declaration." },
            { question: "What is the event loop?", answer: "The event loop is a mechanism that allows JavaScript to perform non-blocking operations by offloading tasks to the browser and processing callbacks from a queue." },
            { question: "What does 'use strict' do?", answer: "It enables strict mode which catches common coding errors, prevents the use of undeclared variables, and disables some unsafe features." }
        ]
    },
    {
        id: 2,
        topic: "Python Basics",
        created_at: "2026-02-08T09:15:00Z",
        flashcards: [
            { question: "What is a list comprehension?", answer: "A concise way to create lists using a single line of code: [expression for item in iterable if condition]." },
            { question: "What is the difference between a tuple and a list?", answer: "Tuples are immutable and use parentheses (), while lists are mutable and use square brackets []." },
            { question: "What are Python decorators?", answer: "Decorators are functions that modify the behavior of another function, using the @decorator_name syntax." }
        ]
    },
    {
        id: 3,
        topic: "Biology - Cell Structure",
        created_at: "2026-02-05T16:45:00Z",
        flashcards: [
            { question: "What is the function of the mitochondria?", answer: "The mitochondria is the powerhouse of the cell, responsible for producing ATP through cellular respiration." },
            { question: "What is the difference between prokaryotic and eukaryotic cells?", answer: "Prokaryotic cells lack a nucleus and membrane-bound organelles, while eukaryotic cells have both." },
            { question: "What is the role of the cell membrane?", answer: "It controls what enters and leaves the cell, providing protection and structure through a phospholipid bilayer." },
            { question: "What is the endoplasmic reticulum?", answer: "An organelle that helps synthesize proteins (rough ER) and lipids (smooth ER), and transports materials within the cell." },
            { question: "What is mitosis?", answer: "A type of cell division that results in two identical daughter cells, each with the same number of chromosomes as the parent cell." }
        ]
    },
    {
        id: 4,
        topic: "World History - Ancient Rome",
        created_at: "2026-01-28T11:20:00Z",
        flashcards: [
            { question: "When was Rome founded?", answer: "According to tradition, Rome was founded in 753 BC by Romulus and Remus." },
            { question: "What was the Pax Romana?", answer: "A period of approximately 200 years (27 BC - 180 AD) of relative peace and stability across the Roman Empire." },
            { question: "Why did the Roman Empire fall?", answer: "A combination of factors including political instability, economic troubles, military defeats, and barbarian invasions led to its fall in 476 AD." }
        ]
    },
    {
        id: 5,
        topic: "CSS Flexbox & Grid",
        created_at: "2026-02-01T08:00:00Z",
        flashcards: [
            { question: "What is the difference between Flexbox and Grid?", answer: "Flexbox is one-dimensional (row or column), while Grid is two-dimensional (rows and columns simultaneously)." },
            { question: "What does justify-content do in Flexbox?", answer: "It aligns flex items along the main axis (horizontally by default), with values like center, space-between, and flex-start." },
            { question: "What does 'fr' mean in CSS Grid?", answer: "The 'fr' unit represents a fraction of the available space in the grid container." }
        ]
    }
];

// ===== DOM references =====
var setsView = document.getElementById("sets-view");
var detailView = document.getElementById("detail-view");
var setsContainer = document.getElementById("sets-container");
var emptyState = document.getElementById("empty-state");
var flashcardsContainer = document.getElementById("flashcards-container");
var detailTopic = document.getElementById("detail-topic");
var detailMeta = document.getElementById("detail-meta");
var backBtn = document.getElementById("back-btn");

// ===== Format date =====
function formatDate(dateStr) {
    var date = new Date(dateStr);
    var options = { year: "numeric", month: "short", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
}

// ===== Render set cards =====
function renderSets() {
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
        card.setAttribute("aria-label", "Open flashcard set: " + set.topic);

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
                '<span>' + formatDate(set.created_at) + '</span>' +
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
    setsView.style.display = "none";
    detailView.style.display = "flex";

    // Reset animation
    detailView.style.animation = "none";
    detailView.offsetHeight; // force reflow
    detailView.style.animation = "fade 0.8s ease-out forwards";

    detailTopic.textContent = set.topic;
    detailMeta.textContent = formatDate(set.created_at);

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
        showBtn.textContent = "Show Answer";

        showBtn.addEventListener("click", function () {
            questionDiv.classList.remove("fade-in");
            answerDiv.classList.remove("fade-in");

            if (questionDiv.style.display === "flex") {
                questionDiv.style.display = "none";
                answerDiv.style.display = "flex";
                answerDiv.classList.add("fade-in");
                showBtn.textContent = "Show Question";
            } else {
                questionDiv.style.display = "flex";
                answerDiv.style.display = "none";
                questionDiv.classList.add("fade-in");
                showBtn.textContent = "Show Answer";
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
    detailView.style.display = "none";
    setsView.style.display = "flex";

    // Reset animation
    setsView.style.animation = "none";
    setsView.offsetHeight; // force reflow
    setsView.style.animation = "fade 0.8s ease-out forwards";
});

// ===== HTML escaping =====
function escapeHtml(text) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
}

// ===== Init =====
renderSets();
