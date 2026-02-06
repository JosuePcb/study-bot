# backend/database.py
from sqlmodel import SQLModel, create_engine, Session
from dotenv import load_dotenv
import os

load_dotenv()

DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")

DATABASE_URL = f"postgresql://postgres:{DB_PASSWORD}@localhost:5432/{DB_NAME}"

engine = create_engine(
    DATABASE_URL, echo=True
)  # echo=True imprime los SQL en consola (útil para debug)


def init_db():
    # Crea las tablas si no existen
    SQLModel.metadata.create_all(engine)


def get_session():
    # Dependencia para inyectar la sesión en cada request
    with Session(engine) as session:
        yield session
