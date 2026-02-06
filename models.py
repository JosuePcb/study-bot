# backend/models.py
from typing import List
from sqlmodel import Field, Relationship, SQLModel
from datetime import datetime


class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    username: str
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relación: Un usuario tiene muchas Flashcards
    flashcards: List["FlashcardSet"] = Relationship(back_populates="owner")


class FlashcardSet(SQLModel, table=True):
    __tablename__ = "flashcard_set"
    id: int | None = Field(default=None, primary_key=True)
    topic: str
    content_json: str  # Aquí guardaremos el JSON que genera la IA como texto
    created_at: datetime = Field(default_factory=datetime.utcnow)

    user_id: int = Field(foreign_key="user.id")

    owner: User = Relationship(back_populates="flashcards")
