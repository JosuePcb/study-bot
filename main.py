# backend/main.py
from fastapi import FastAPI, Depends, HTTPException
from sqlmodel import Session, select
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import json
import google.generativeai as genai

from database import init_db, get_session
from models import User, FlashcardSet
from schemas import (
    UserCreate,
    UserLogin,
    UserResponse,
    Token,
    TextRequest,
    FlashcardSaveRequest,
)
from auth import hash_password, verify_password, create_access_token, get_current_user

# Cargar variables de entorno
load_dotenv()

# Configuración de la IA
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI(title="Flashcard Generator API")

# Configurar CORS para que el Frontend pueda hablar con el Backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


# Auth endpoints


@app.post("/signup", response_model=UserResponse)
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
        import traceback

        error_detail = f"{type(e).__name__}: {str(e)}\n{traceback.format_exc()}"
        raise HTTPException(status_code=500, detail=error_detail)


@app.post("/login", response_model=Token)
def login(credentials: UserLogin, session: Session = Depends(get_session)):
    """Iniciar sesión y obtener token JWT"""
    user = session.exec(select(User).where(User.email == credentials.email)).first()

    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    token = create_access_token(data={"sub": user.id})
    return Token(access_token=token)


# Flashcard Endpoints


@app.post("/generate")
async def generate_flashcards(
    request: TextRequest, current_user: User = Depends(get_current_user)
):
    # Generar flashcards usando Gemini AI (requiere autenticación)
    try:
        model = genai.GenerativeModel("gemini-pro")

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

        response = model.generate_content(prompt)
        clean_text = response.text.replace("```json", "").replace("```", "").strip()
        flashcards = json.loads(clean_text)
        return {"flashcards": flashcards}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/save-flashcards/")
def save_flashcards(
    data: FlashcardSaveRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    # Guardar un set de flashcards para el usuario autenticado
    new_set = FlashcardSet(
        topic=data.topic, content_json=data.flashcards_json, user_id=current_user.id
    )
    session.add(new_set)
    session.commit()
    session.refresh(new_set)
    return {"message": "Guardado exitosamente", "id": new_set.id}


@app.get("/my-flashcards/")
def get_my_flashcards(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Obtener todos los sets de flashcards del usuario autenticado"""
    results = session.exec(
        select(FlashcardSet).where(FlashcardSet.user_id == current_user.id)
    ).all()
    return results


# Verificar funcionamiento de la API


@app.get("/")
def health_check():
    return {"status": "ok", "message": "Flashcard Generator API is running"}
