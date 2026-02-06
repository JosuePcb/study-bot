from pydantic import BaseModel, EmailStr
from datetime import datetime


# --- Auth Schemas ---
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str  # Contraseña en texto plano (se hashea en el backend)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    username: str
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# --- Flashcard Schemas ---
class TextRequest(BaseModel):
    text: str


class FlashcardSaveRequest(BaseModel):
    topic: str
    flashcards_json: str
