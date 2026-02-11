// Scrollbar Area para el input

const areaTexto = document.getElementById('request');

    areaTexto.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });


