# backend/app/main.py

from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.database import Base, engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Runs AFTER engine is confirmed connected (retry already happened in database.py)
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables ready.")
    yield
    # shutdown logic here if needed


app = FastAPI(title="Dashboard API", lifespan=lifespan)


@app.get("/health")
def health_check():
    return {"status": "ok"}