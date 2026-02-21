# backend/main.py
import json
import os
import traceback
from typing import Annotated

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from google import genai
from sqlmodel import Session, select
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles

from .auth import hash_password, verify_password, create_access_token, get_current_user
from .database import init_db, get_session
from .models import User, FlashcardSet
from .schemas import (
    FlashcardSaveRequest,
    TextRequest,
    Token,
    UserCreate,
    UserResponse,
)

# Cargar variables de entorno
load_dotenv()

# Configuración de la IA - El cliente obtiene la API key de la variable de entorno GEMINI_API_KEY
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI(title="Flashcard Generator API")

# Configurar CORS para que el Frontend pueda hablar con el Backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://study-bot-u4w6.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


# Auth endpoints


@app.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(user_data: UserCreate, session: Session = Depends(get_session)):
    """Registrar un nuevo usuario"""
    try:
        existing = session.exec(
            select(User).where(User.email == user_data.email)
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email ya registrado")

        new_user = User(
            email=user_data.email,
            username=user_data.username,
            password_hash=hash_password(user_data.password),
        )
        session.add(new_user)
        session.commit()
        session.refresh(new_user)
        return new_user
    except HTTPException:
        raise
    except Exception as e:
        error_detail = f"{type(e).__name__}: {str(e)}\n{traceback.format_exc()}"
        raise HTTPException(status_code=500, detail=error_detail)


@app.post("/login", response_model=Token, status_code=status.HTTP_200_OK)
def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: Session = Depends(get_session),
):
    """Iniciar sesión y obtener token JWT. Usa email como username."""
    user = session.exec(select(User).where(User.email == form_data.username)).first()

    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    token = create_access_token(data={"sub": str(user.id)})
    return Token(access_token=token)


# Flashcard Endpoints


@app.post("/generate", status_code=status.HTTP_200_OK)
async def generate_flashcards(
    request: TextRequest, current_user: User = Depends(get_current_user)
):
    """Generar flashcards usando Gemini AI (requiere autenticación)"""
    try:
        prompt = f"""
        Actúa como un profesor experto. Analiza el siguiente texto y genera 5 preguntas clave con sus respuestas para estudiar.

        TEXTO: "{request.text}"

        FORMATO DE RESPUESTA:
        Debes responder ESTRICTAMENTE un Array JSON válido, sin texto adicional, sin markdown (```json).
        Ejemplo:
        [
            {{"question": "¿Qué es X?", "answer": "Es Y"}},
            {{"question": "¿Cuándo ocurre Z?", "answer": "Cuando A y B..."}}
        ]
        """

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        clean_text = response.text.replace("```json", "").replace("```", "").strip()
        flashcards = json.loads(clean_text)
        return {"flashcards": flashcards}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/save-flashcards/", status_code=status.HTTP_201_CREATED)
def save_flashcards(
    data: FlashcardSaveRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Guardar un set de flashcards para el usuario autenticado"""
    # Convertir la lista de flashcards a JSON string para almacenar
    flashcards_json = json.dumps(
        [fc.model_dump() for fc in data.flashcards], ensure_ascii=False
    )
    new_set = FlashcardSet(
        topic=data.topic, content_json=flashcards_json, user_id=current_user.id
    )
    session.add(new_set)
    session.commit()
    session.refresh(new_set)
    return {"message": "Guardado exitosamente", "id": new_set.id}


@app.get("/my-flashcards/", status_code=status.HTTP_200_OK)
def get_my_flashcards(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Obtener todos los sets de flashcards del usuario autenticado"""
    results = session.exec(
        select(FlashcardSet).where(FlashcardSet.user_id == current_user.id)
    ).all()
    return results


# APP MAIN DEPLOY

app.mount("/static", StaticFiles(directory="frontend"), name="static")

@app.get("/")
async def read_login():
    return RedirectResponse(url="/static/login/login.html")