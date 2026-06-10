# backend/app/database.py

import os
import time

# pyrefly: ignore [missing-import]
from sqlalchemy import create_engine
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import sessionmaker, declarative_base
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")


def create_engine_with_retry(url, retries=10, delay=3):
    """Retry DB connection on startup — Postgres may not be ready yet."""
    for attempt in range(1, retries + 1):
        try:
            eng = create_engine(url, pool_pre_ping=True)
            # Test the connection
            with eng.connect() as conn:
                pass
            print(f"✅ Database connected on attempt {attempt}")
            return eng
        except Exception as e:
            print(f"⏳ DB not ready (attempt {attempt}/{retries}): {e}")
            if attempt < retries:
                time.sleep(delay)
            else:
                raise RuntimeError("❌ Could not connect to database after retries.") from e


engine = create_engine_with_retry(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


# Dependency for FastAPI routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()