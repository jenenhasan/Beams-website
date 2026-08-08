from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, menu, orders
from app.core.database import Base, engine
from app.models.menu import Menu
from app.models.order import Order
from app.models.user import AdminUser
app = FastAPI(
    title="BEAMS Cafe API",
    description="Digital menu API for BEAMS Coffee House",
    version="1.0.0"
)
Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router, prefix="/api/v1", tags=["auth"])
app.include_router(menu.router, prefix="/api/v1", tags=["menu"])
app.include_router(orders.router, prefix="/api/v1", tags=["orders"])

@app.get("/")
async def root():
    return {"name": "BEAMS Cafe API", "version": "1.0.0", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}