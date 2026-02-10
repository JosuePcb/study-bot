# Guía de Integración Frontend - StudyBot API

## 🔗 Información General

| Item | Valor |
|------|-------|
| **URL Base** | `http://localhost:8000` |
| **Documentación** | `http://localhost:8000/docs` (Swagger UI) |
| **Autenticación** | Bearer Token (JWT) |
| **Content-Type** | `application/json` |

---

## 🚀 Iniciar el Backend

```bash
cd backend
uv run python -m uvicorn main:app --reload --port 8000
```

---

## 📡 Endpoints Disponibles

### 1. Registro de Usuario
```
POST /signup
```

**Request:**
```json
{
  "email": "usuario@ejemplo.com",
  "username": "usuario123",
  "password": "mipassword"
}
```

**Response (201):**
```json
{
  "id": 1,
  "email": "usuario@ejemplo.com",
  "username": "usuario123",
  "created_at": "2024-02-07T20:00:00.000000"
}
```

---

### 2. Login
```
POST /login
```

**Request (form-data, NO JSON):**
```
Content-Type: application/x-www-form-urlencoded

username=usuario@ejemplo.com&password=mipassword
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

⚠️ **IMPORTANTE**: El campo `username` debe contener el **email** del usuario.

---

### 3. Generar Flashcards (Protegido 🔒)
```
POST /generate
Authorization: Bearer {token}
```

**Request:**
```json
{
  "text": "La fotosíntesis es el proceso por el cual las plantas..."
}
```

**Response (200):**
```json
{
  "flashcards": [
    {
      "question": "¿Qué es la fotosíntesis?",
      "answer": "Es el proceso por el cual..."
    },
    {
      "question": "¿Qué necesitan las plantas?",
      "answer": "Luz solar, agua y CO2..."
    }
  ]
}
```

---

### 4. Guardar Flashcards (Protegido 🔒)
```
POST /save-flashcards/
Authorization: Bearer {token}
```

**Request:**
```json
{
  "topic": "Biología - Fotosíntesis",
  "flashcards": [
    {
      "question": "¿Qué es la fotosíntesis?",
      "answer": "Es el proceso..."
    }
  ]
}
```

**Response (200):**
```json
{
  "message": "Guardado exitosamente",
  "id": 1
}
```

---

### 5. Obtener Mis Flashcards (Protegido 🔒)
```
GET /my-flashcards/
Authorization: Bearer {token}
```

**Response (200):**
```json
[
  {
    "id": 1,
    "topic": "Biología - Fotosíntesis",
    "content_json": "[{\"question\": \"...\", \"answer\": \"...\"}]",
    "created_at": "2024-02-07T20:00:00.000000",
    "user_id": 1
  }
]
```

---

## 🔐 Manejo de Autenticación en JavaScript

### Guardar Token (después de login)
```javascript
// Guardar token en localStorage
function saveToken(token) {
    localStorage.setItem('access_token', token);
}

// Obtener token
function getToken() {
    return localStorage.getItem('access_token');
}

// Eliminar token (logout)
function logout() {
    localStorage.removeItem('access_token');
    window.location.href = 'login.html';
}

// Verificar si está autenticado
function isAuthenticated() {
    return getToken() !== null;
}
```

---

## 📝 Ejemplos Completos de Fetch

### Login
```javascript
async function login(email, password) {
    try {
        const response = await fetch('http://localhost:8000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Error al iniciar sesión');
        }

        const data = await response.json();
        saveToken(data.access_token);
        window.location.href = 'dashboard.html';
    } catch (error) {
        alert(error.message);
    }
}
```

### Registro
```javascript
async function signup(email, username, password) {
    try {
        const response = await fetch('http://localhost:8000/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, username, password })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Error al registrarse');
        }

        alert('Cuenta creada. Ahora inicia sesión.');
        window.location.href = 'login.html';
    } catch (error) {
        alert(error.message);
    }
}
```

### Generar Flashcards
```javascript
async function generateFlashcards(text) {
    const token = getToken();
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        // Mostrar loading
        document.getElementById('loading').style.display = 'block';
        
        const response = await fetch('http://localhost:8000/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ text })
        });

        if (response.status === 401) {
            logout(); // Token expirado
            return;
        }

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Error al generar flashcards');
        }

        const data = await response.json();
        displayFlashcards(data.flashcards);
    } catch (error) {
        alert(error.message);
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}
```

### Guardar Flashcards
```javascript
async function saveFlashcards(topic, flashcards) {
    const token = getToken();
    
    const response = await fetch('http://localhost:8000/save-flashcards/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ topic, flashcards })
    });

    if (!response.ok) {
        throw new Error('Error al guardar');
    }

    const data = await response.json();
    alert(`Guardado exitosamente con ID: ${data.id}`);
}
```

### Obtener Historial
```javascript
async function getMyFlashcards() {
    const token = getToken();
    
    const response = await fetch('http://localhost:8000/my-flashcards/', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Error al obtener historial');
    }

    const flashcardSets = await response.json();
    
    // Parsear content_json de cada set
    return flashcardSets.map(set => ({
        ...set,
        flashcards: JSON.parse(set.content_json)
    }));
}
```

---

## 🎨 Ejemplo de Estructura HTML con Bootstrap

### login.html
```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - StudyBot</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-dark text-light">
    <div class="container mt-5">
        <div class="row justify-content-center">
            <div class="col-md-4">
                <div class="card bg-secondary">
                    <div class="card-body">
                        <h2 class="text-center mb-4">🧠 StudyBot</h2>
                        <form id="loginForm">
                            <div class="mb-3">
                                <label class="form-label">Email</label>
                                <input type="email" class="form-control" id="email" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Contraseña</label>
                                <input type="password" class="form-control" id="password" required>
                            </div>
                            <button type="submit" class="btn btn-primary w-100">Iniciar Sesión</button>
                        </form>
                        <p class="text-center mt-3">
                            ¿No tienes cuenta? <a href="signup.html">Regístrate</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <script src="js/auth.js"></script>
    <script>
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            await login(email, password);
        });
    </script>
</body>
</html>
```

---

## ⚠️ Manejo de Errores

| Código | Significado | Acción |
|--------|-------------|--------|
| 400 | Datos inválidos | Mostrar mensaje al usuario |
| 401 | No autenticado / Token expirado | Redirigir a login |
| 404 | Recurso no encontrado | Mostrar mensaje |
| 422 | Error de validación | Mostrar detalles del error |
| 429 | Rate limit de Gemini | Esperar y reintentar |
| 500 | Error del servidor | Mostrar error genérico |

---

## 🔄 Flujo de la Aplicación

```
1. Usuario abre la app
   |
   v
2. ¿Tiene token válido?
   |
   ├── NO --> Mostrar Login
   |           |
   |           v
   |       Login/Signup --> Guardar token --> Dashboard
   |
   └── SÍ --> Dashboard
              |
              v
           Usuario ingresa texto
              |
              v
           POST /generate (con token)
              |
              v
           Mostrar flashcards generadas
              |
              v
           ¿Guardar? --> POST /save-flashcards/
              |
              v
           Ver historial --> GET /my-flashcards/
```

---

## 📁 Estructura Sugerida de Archivos

```
frontend/
├── index.html          # Redirige a login o dashboard
├── login.html
├── signup.html
├── dashboard.html      # Generador de flashcards
├── history.html        # Historial guardado
├── study.html          # Modo estudio
├── css/
│   └── styles.css
└── js/
    ├── auth.js         # Funciones de autenticación
    ├── api.js          # Funciones de llamadas a la API
    └── app.js          # Lógica de la aplicación
```

---

## 🧪 Testing Rápido

Para probar que el backend funciona antes de implementar el frontend:

1. Abre `http://localhost:8000/docs`
2. Haz clic en "Authorize"
3. Usa las credenciales de un usuario registrado
4. Prueba cada endpoint desde Swagger UI
