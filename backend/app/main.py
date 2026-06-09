# backend/app/main.py

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import dashboard


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables ready.")
    yield


app = FastAPI(title="Dashboard API", lifespan=lifespan)

# ── CORS — allow frontend (React/Vue) to call the API ────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],    # tighten this to your frontend URL in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────────────────────────
app.include_router(dashboard.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}