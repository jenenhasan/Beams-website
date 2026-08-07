from fastapi import APIRouter, Depends, HTTPException, status as http_status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime

from ..core.database import get_db
from ..api.auth import oauth2_scheme, verify_token
from ..models.order import Order

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

class StatusUpdate(BaseModel):
    status: str  # "preparing", "ready", "completed"

@router.post("/")
async def create_order(order: OrderRequest, db: Session = Depends(get_db)):
    """Customer places an order (public)"""
    db_order = Order(
        items=[item.dict() for item in order.items],
        total=order.total,
        notes=order.notes,
        status="pending",
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    return {
        "message": "Order created successfully",
        "order_id": f"ORD-{db_order.id}",
        "status": db_order.status,
    }

@router.get("/")
async def list_orders(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """Barista view: see all active orders (requires login)"""
    verify_token(token)  # reuse whatever auth check you already have in auth.py
    orders = db.query(Order).filter(Order.status != "completed").order_by(Order.created_at.asc()).all()
    return orders

@router.patch("/{order_id}/status")
async def update_order_status(
    order_id: int,
    update: StatusUpdate,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """Barista marks an order as preparing/ready/completed"""
    verify_token(token)
    db_order = db.query(Order).filter(Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Order not found")
    db_order.status = update.status
    db.commit()
    db.refresh(db_order)
    return db_order