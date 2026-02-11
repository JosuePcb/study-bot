// Scrollbar Area para el input

const areaTexto = document.getElementById('request');

    areaTexto.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });


//Lista de flashcards



const flashcards = [
{   question: "¿Qué es una variable en Python?", 
    answer: "Es un espacio en memoria para almacenar un dato." },

{ question: "¿Cómo se declara una función en JavaScript?", 
    answer: "Reemplazar el texto en esta vaina para ver hasta donde llega a la hora de hacer una respuesta para poder limpiar la pantalla jajajajajajaj si no no me gusta"},
    { question: "¿Cómo se declara una función en JavaScript?", 
    answer: "function miFuncion() { /* ... */ }"},
    { question: "¿Cómo se declara una función en JavaScript?", 
    answer: "function miFuncion() { /* ... */ }"},
    { question: "¿Cómo se declara una función en JavaScript?", 
    answer: "function miFuncion() { /* ... */ }"},
];


const main = document.getElementById('main');
if (flashcards.length > 0) {
    main.innerHTML = "";



        // Crear contenedor para las flashcards con id
    const flashcardsContainer = document.createElement('div');
    flashcardsContainer.id = "flashcards-container";
        // Agregar el input y parrafo de título

    const subtitle = document.createElement("h2")
    subtitle.textContent = "Insert a title to save your flashcards";
    subtitle.className = "subtitle"
    flashcardsContainer.appendChild(subtitle);

    const inputTitle = document.createElement('input');
    inputTitle.type = "text";
    inputTitle.className = "title-flashcards";
    inputTitle.placeholder = "Title";
    inputTitle.maxLength = "40"
    flashcardsContainer.appendChild(inputTitle);



    flashcards.forEach(card => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'flashcard';

        // Elementos para pregunta, respuesta y botón
        const question = document.createElement('div');
        question.innerHTML = card.question;
        question.style.display = "flex";

        const answer = document.createElement('div');
        answer.innerHTML = card.answer;
        answer.style.display = "none";

        const showBtn = document.createElement('button');
        showBtn.textContent = "Show Answer";
        showBtn.id = "showBtn"

        showBtn.onclick = function() {
        question.classList.remove('fade-in');
        answer.classList.remove('fade-in');

        if (question.style.display === "flex") {
            question.style.display = "none";
            answer.style.display = "flex";
            answer.classList.add('fade-in');
            showBtn.textContent = "Hide Answer";
        } else {
            question.style.display = "flex";
            answer.style.display = "none";
            question.classList.add('fade-in');
            showBtn.textContent = "Show Answer";
        }
        };

        cardDiv.appendChild(question);
        cardDiv.appendChild(answer);
        cardDiv.appendChild(showBtn);
        
        flashcardsContainer.appendChild(cardDiv);
        
    });

    const submitBtn = document.createElement('button');
        submitBtn.textContent = "Submit Flashcards";
        submitBtn.id = "submitBtn"
        flashcardsContainer.appendChild(submitBtn)

        main.appendChild(flashcardsContainer);
}