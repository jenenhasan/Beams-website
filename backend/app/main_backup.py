from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .core.database import engine, Base
from .core.config import settings
from .api import auth, menu , orders

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown

app = FastAPI(
    title="BEAMS Cafe API",
    description="Digital menu API for BEAMS Coffee House",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(menu.router, prefix="/api/v1")
app.include_router(orders.router, prefix="/api/v1")

@app.get("/")
async def root():
    return {
        "name": "BEAMS Cafe API",
        "version": "1.0.0",
        "status": "healthy"
    }

@app.get("/health")
async def health_check():
    return {"status": "ok"}