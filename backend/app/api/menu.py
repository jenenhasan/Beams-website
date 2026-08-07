#api/menu.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any
from datetime import datetime
from jose import JWTError, jwt

from ..core.database import get_db
from ..core.config import settings
from ..models.menu import Menu
from ..schemas.menu import MenuData
from ..api.auth import oauth2_scheme, verify_token

router = APIRouter(prefix="/menu", tags=["menu"])

# Default BEAMS menu
DEFAULT_MENU = {
    "categories": [
        {
            "id": "hot",
            "numeral": "01",
            "title": "Hot Coffee",
            "subtitle": "Pulled to order, no exceptions",
            "items": [
                {"id": "1", "name": "Signature Espresso", "desc": "Double shot, single origin, roasted in-house weekly", "price": "3.50", "favorite": True},
                {"id": "2", "name": "BEAMS Cappuccino", "desc": "Espresso, steamed milk, thick microfoam", "price": "4.20", "favorite": False},
                {"id": "3", "name": "Americano", "desc": "Espresso, hot water, smooth and full-bodied", "price": "3.80", "favorite": False}
            ]
        },
        {
            "id": "cold",
            "numeral": "02",
            "title": "Cold Brew",
            "subtitle": "Slow-steeped, poured over ice",
            "items": [
                {"id": "4", "name": "Iced Latte", "desc": "Espresso, cold milk, slow-poured over ice", "price": "4.20", "favorite": True},
                {"id": "5", "name": "Cold Brew Original", "desc": "18-hour steeped, notes of cacao and citrus", "price": "4.50", "favorite": False},
                {"id": "6", "name": "Vanilla Cold Foam Brew", "desc": "Cold brew, house vanilla cream, sea salt rim", "price": "5.00", "favorite": False}
            ]
        },
        {
            "id": "tea",
            "numeral": "03",
            "title": "Tea & Matcha",
            "subtitle": "Whisked, steeped, never rushed",
            "items": [
                {"id": "7", "name": "Matcha Latte", "desc": "Ceremonial grade matcha, oat milk, light sweetness", "price": "4.50", "favorite": True},
                {"id": "8", "name": "Chai Latte", "desc": "Housemade spice blend, steamed milk, honey", "price": "4.30", "favorite": False},
                {"id": "9", "name": "Golden Turmeric Tea", "desc": "Turmeric, ginger, black pepper, warm citrus", "price": "4.00", "favorite": False}
            ]
        },
        {
            "id": "pastries",
            "numeral": "04",
            "title": "Pastries",
            "subtitle": "Baked fresh, every morning",
            "items": [
                {"id": "10", "name": "Croissant", "desc": "Butter-laminated, baked fresh each morning", "price": "2.80", "favorite": True},
                {"id": "11", "name": "Almond Financier", "desc": "Brown butter, toasted almond, light glaze", "price": "3.20", "favorite": False},
                {"id": "12", "name": "Sea Salt Cookie", "desc": "Dark chocolate chunks, flaky sea salt", "price": "2.50", "favorite": False}
            ]
        }
    ]
}

@router.get("/")
async def get_menu(db: Session = Depends(get_db)):
    """Get the full menu (public)"""
    menu = db.query(Menu).first()
    if not menu:
        menu = Menu(data=DEFAULT_MENU)
        db.add(menu)
        db.commit()
        db.refresh(menu)
    
    return {
        "data": menu.data,
        "updated_at": menu.updated_at.isoformat() if menu.updated_at else None
    }

@router.put("/")
async def update_menu(
    menu_data: Dict[str, Any],
    token: str = Depends(oauth2_scheme),  # This ensures token is validated
    db: Session = Depends(get_db)
):
    """Update the entire menu (admin only)"""
    # Verify token and get username
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username = payload.get("sub")
        if username != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admin can update the menu"
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    menu = db.query(Menu).first()
    if not menu:
        menu = Menu(data=menu_data)
        db.add(menu)
    else:
        menu.data = menu_data
        menu.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(menu)
    
    return {
        "message": "Menu updated successfully",
        "data": menu.data,
        "updated_at": menu.updated_at.isoformat() if menu.updated_at else None
    }

@router.post("/reset")
async def reset_menu(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """Reset menu to default (admin only)"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username = payload.get("sub")
        if username != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admin can reset the menu"
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    menu = db.query(Menu).first()
    if not menu:
        menu = Menu(data=DEFAULT_MENU)
        db.add(menu)
    else:
        menu.data = DEFAULT_MENU
        menu.updated_at = datetime.utcnow()
    
    db.commit()
    return {"message": "Menu reset to default"}