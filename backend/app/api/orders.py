from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime

from ..core.database import get_db
from ..api.auth import oauth2_scheme
from ..core.security import decode_token

router = APIRouter(prefix="/orders", tags=["orders"])

class OrderItem(BaseModel):
    item_id: str
    name: str
    quantity: int
    price: str

class OrderRequest(BaseModel):
    items: List[OrderItem]
    total: str
    notes: str = ""

@router.post("/")
async def create_order(
    order: OrderRequest,
    db: Session = Depends(get_db)
):
    """Create a new order (public)"""
    # In a real app, save to database
    return {
        "message": "Order created successfully",
        "order_id": "ORD-" + str(int(datetime.utcnow().timestamp())),
        "items": order.items,
        "total": order.total
    }