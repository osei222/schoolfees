from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings
import os


# Helper: normalize DATABASE_URL for SQLAlchemy
def _get_sqlalchemy_database_url(database_url: str) -> str:
    if not database_url:
        return database_url

    # Render/Postgres may provide a DATABASE_URL starting with 'postgres://'
    # SQLAlchemy 1.4+ expects 'postgresql+psycopg2://'
    if database_url.startswith("postgres://"):
        return database_url.replace("postgres://", "postgresql+psycopg2://", 1)

    return database_url


# Determine final DB URL
DATABASE_URL = os.getenv("DATABASE_URL") or settings.DATABASE_URL
DATABASE_URL = _get_sqlalchemy_database_url(DATABASE_URL)


# Engine creation differs for SQLite vs other DBs
engine_kwargs = {
    "pool_pre_ping": True,
}

if DATABASE_URL and DATABASE_URL.startswith("sqlite"):
    # SQLite in-process requires check_same_thread
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    # Postgres or other databases
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
    )


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency that yields a SQLAlchemy session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Create all database tables (used in simple deployments)."""
    from app import models  # import models so they are registered on Base

    Base.metadata.create_all(bind=engine)
