# StudyBot

Aplicacion web para generar flashcards de estudio usando inteligencia artificial. StudyBot permite a los usuarios ingresar texto o temas de estudio y, mediante la API de Google Gemini, genera automaticamente tarjetas de preguntas y respuestas para facilitar el aprendizaje.

---

## Tabla de Contenidos

- [Arquitectura del Proyecto](#arquitectura-del-proyecto)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Requisitos Previos](#requisitos-previos)
- [Instalacion y Configuracion](#instalacion-y-configuracion)
- [Ejecucion](#ejecucion)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Backend - API REST](#backend---api-rest)
- [Frontend](#frontend)
- [Flujo de Usuario](#flujo-de-usuario)
- [Autores](#autores)

---

## Arquitectura del Proyecto

StudyBot sigue una arquitectura cliente-servidor:

- **Backend:** API REST construida con FastAPI (Python), conectada a una base de datos PostgreSQL y a la API de Google Gemini para la generacion de flashcards.
- **Frontend:** Interfaz de usuario construida con HTML, CSS y JavaScript vanilla. Se comunica con el backend mediante peticiones HTTP (fetch API).

---

## Tecnologias Utilizadas

### Backend

| Tecnologia | Proposito |
|---|---|
| Python 3.10+ | Lenguaje principal |
| FastAPI | Framework web API REST |
| SQLModel | ORM para PostgreSQL |
| PostgreSQL | Base de datos relacional |
| python-jose | Manejo de tokens JWT |
| passlib (bcrypt) | Hash de contrasenas |
| google-generativeai | Integracion con Gemini AI |
| uvicorn | Servidor ASGI |
| python-dotenv | Variables de entorno |

### Frontend

| Tecnologia | Proposito |
|---|---|
| HTML5 | Estructura |
| CSS3 | Estilos y diseno responsivo |
| JavaScript (ES6+) | Logica del cliente |
| Lucide Icons | Iconografia |
| Google Fonts (Roboto) | Tipografia |

---

## Requisitos Previos

- Python 3.10 o superior
- PostgreSQL instalado y en ejecucion
- Una API Key de Google Gemini
- uv (gestor de paquetes Python) o pip

---

## Instalacion y Configuracion

### 1. Clonar el repositorio

```bash
git clone https://github.com/AaronDuque2006/flashcards-study-bot.git
cd flashcards-study-bot
```

### 2. Configurar variables de entorno

Crear un archivo `.env` en la carpeta `backend/` con las siguientes variables:

```env
GEMINI_API_KEY=tu_api_key_de_gemini
SECRET_KEY=tu_clave_secreta_para_jwt
DB_PASSWORD=tu_contrasena_de_postgresql
DB_NAME=nombre_de_tu_base_de_datos
```

### 3. Instalar dependencias del backend

```bash
cd backend
uv sync
```

O con pip:

```bash
pip install -r requirements.txt
```

### 4. Crear la base de datos

Asegurate de tener PostgreSQL corriendo y crear la base de datos especificada en `DB_NAME`. Las tablas se crean automaticamente al iniciar el servidor.

---

## Ejecucion

### Iniciar el backend

```bash
cd backend
uv run python -m uvicorn main:app --reload --port 8000
```

El servidor estara disponible en `http://localhost:8000`.

### Abrir el frontend

Abrir directamente en el navegador:

```
frontend/login/login.html
```

O usar un servidor local como Live Server en VS Code.

---

## Estructura del Proyecto

```
StudyBot/
├── backend/
│   ├── main.py              # Aplicacion FastAPI, endpoints principales
│   ├── auth.py              # Logica de autenticacion (JWT, hashing)
│   ├── database.py          # Conexion y configuracion de PostgreSQL
│   ├── models.py            # Modelos de base de datos (User, FlashcardSet)
│   ├── schemas.py           # Esquemas Pydantic para validacion
│   ├── .env                 # Variables de entorno (no incluido en git)
│   └── pyproject.toml       # Dependencias del proyecto
│
├── frontend/
│   ├── js/
│   │   └── auth.js          # Utilidades compartidas de autenticacion
│   ├── login/
│   │   ├── login.html       # Pagina de inicio de sesion
│   │   ├── login.css        # Estilos (compartido con signup)
│   │   ├── login.js         # Logica de login
│   │   ├── signup.html      # Pagina de registro
│   │   └── signup.js        # Logica de registro
│   ├── index/
│   │   ├── index.html       # Dashboard principal
│   │   ├── index.css        # Estilos del dashboard
│   │   └── index.js         # Generacion y guardado de flashcards
│   ├── myflashcards/
│   │   ├── myflashcards.html # Vista de flashcards guardadas
│   │   ├── myflashcards.css  # Estilos de mis flashcards
│   │   └── myflashcards.js   # Carga y visualizacion de sets
│   └── study/
│       ├── study.html        # Modo estudio (card por card)
│       ├── study.css         # Estilos del modo estudio
│       └── study.js          # Navegacion y atajos de teclado
│
├── UI_DESIGN.md             # Especificaciones de diseno UI
├── FRONTEND_INTEGRATION.md  # Guia de integracion frontend-backend
└── README.md                # Este archivo
```

---

## Backend - API REST

### Autenticacion

El backend usa autenticacion basada en JWT (JSON Web Tokens). Los endpoints protegidos requieren un header `Authorization: Bearer <token>`.

### Endpoints

#### POST /signup

Registrar un nuevo usuario.

**Request Body (JSON):**
```json
{
    "email": "usuario@ejemplo.com",
    "username": "NombreUsuario",
    "password": "contrasena123"
}
```

**Response (200):**
```json
{
    "id": 1,
    "email": "usuario@ejemplo.com",
    "username": "NombreUsuario",
    "created_at": "2026-02-11T00:00:00"
}
```

---

#### POST /login

Iniciar sesion y obtener token JWT.

**Request Body (form-urlencoded):**
```
username=usuario@ejemplo.com&password=contrasena123
```

> Nota: El campo `username` recibe el email del usuario (requerido por OAuth2PasswordRequestForm).

**Response (200):**
```json
{
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "bearer"
}
```

---

#### POST /generate (requiere autenticacion)

Generar flashcards a partir de texto usando Gemini AI.

**Request Body (JSON):**
```json
{
    "text": "La fotosintesis es el proceso mediante el cual..."
}
```

**Response (200):**
```json
{
    "flashcards": [
        {
            "question": "Que es la fotosintesis?",
            "answer": "Es el proceso mediante el cual las plantas..."
        }
    ]
}
```

---

#### POST /save-flashcards/ (requiere autenticacion)

Guardar un set de flashcards.

**Request Body (JSON):**
```json
{
    "topic": "Fotosintesis",
    "flashcards": [
        {
            "question": "Que es la fotosintesis?",
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

#### GET /my-flashcards/ (requiere autenticacion)

Obtener todos los sets de flashcards del usuario autenticado.

**Response (200):**
```json
[
    {
        "id": 1,
        "topic": "Fotosintesis",
        "content_json": "[{\"question\": \"...\", \"answer\": \"...\"}]",
        "created_at": "2026-02-11T00:00:00",
        "user_id": 1
    }
]
```

---

### Modelos de Base de Datos

#### User

| Campo | Tipo | Descripcion |
|---|---|---|
| id | Integer (PK) | Identificador unico |
| email | String (unique) | Correo electronico |
| username | String | Nombre de usuario |
| password_hash | String | Hash de la contrasena |
| created_at | DateTime | Fecha de creacion |

#### FlashcardSet

| Campo | Tipo | Descripcion |
|---|---|---|
| id | Integer (PK) | Identificador unico |
| topic | String | Nombre del tema |
| content_json | String | Flashcards en formato JSON |
| created_at | DateTime | Fecha de creacion |
| user_id | Integer (FK) | Referencia al usuario |

---

## Frontend

### Paginas

| Pagina | Ruta | Descripcion |
|---|---|---|
| Login | `login/login.html` | Inicio de sesion |
| Signup | `login/signup.html` | Registro de nueva cuenta |
| Dashboard | `index/index.html` | Generacion de flashcards con IA |
| Mis Flashcards | `myflashcards/myflashcards.html` | Historial de sets guardados |
| Modo Estudio | `study/study.html` | Estudio card por card |

### Autenticacion en el Frontend

El archivo `js/auth.js` centraliza la logica de autenticacion:

- **saveToken / getToken:** Almacena y recupera el JWT de localStorage.
- **logout:** Limpia el token y redirige al login.
- **authGuard:** Redirige al login si no hay sesion activa.
- **authFetch:** Wrapper de fetch que inyecta automaticamente el header `Authorization: Bearer`.
- **showToast:** Sistema de notificaciones visuales.

### Diseno Visual

- **Tema:** Modo oscuro
- **Paleta de colores:**
  - Principal: `#191716` (fondo oscuro)
  - Secundario: `#C9C4B4` (texto claro)
  - Terciario: `#FF5A1F` (acentos naranja)
  - Cuarto: `#E2E4DD` (superficies claras)
- **Tipografia:** Roboto (Google Fonts)
- **Iconos:** Lucide Icons (CDN)
- **Responsive:** Adaptable a dispositivos moviles

### Modo Estudio

El modo estudio permite revisar flashcards una por una con las siguientes funcionalidades:

- Navegacion entre flashcards (botones anterior/siguiente)
- Mostrar/ocultar respuesta con animacion flip
- Indicador de progreso con dots
- Atajos de teclado: flechas izquierda/derecha para navegar, espacio para revelar respuesta

---

## Flujo de Usuario

1. El usuario se registra en la pagina de signup.
2. Inicia sesion con sus credenciales.
3. En el dashboard, escribe o pega texto sobre el tema que desea estudiar.
4. Presiona "Generar Flashcards" y la IA genera preguntas y respuestas.
5. Puede revisar las flashcards generadas, guardarlas con un titulo, o entrar al modo estudio.
6. En "Mis Flashcards" puede ver todos sus sets guardados y acceder al modo estudio de cualquiera de ellos.

---

## Autores

- **Aaron Duque**
- **Josue Hernandez**

---

Copyright 2026 StudyBot. Todos los derechos reservados.
