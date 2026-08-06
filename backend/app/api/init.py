from .auth import router as auth_router
from .menu import router as menu_router
from .orders import router as orders_router

__all__ = ["auth_router", "menu_router", "orders_router"]