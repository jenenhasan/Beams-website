from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Any
from datetime import datetime, timedelta

from ..core.database import get_db
from ..core.security import verify_password, get_password_hash, create_access_token
from ..models.user import AdminUser
from ..schemas.auth import LoginRequest, LoginResponse, UserResponse
from jose import JWTError, jwt
from ..core.config import settings

router = APIRouter(prefix="/auth", tags=["authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def verify_token(token: str = Depends(oauth2_scheme)):
    """Verify JWT token and return the username"""
    try:
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        username = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return username
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.post("/setup")
async def setup_admin(db: Session = Depends(get_db)):
    """First-time setup: Create admin user"""
    # Check if admin already exists
    existing = db.query(AdminUser).filter(AdminUser.username == "admin").first()
    if existing:
        return {"message": "Admin already exists"}
    
    # ✅ SECURE: Get password from environment variable
    admin_password = settings.ADMIN_PASSWORD
    if not admin_password:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="ADMIN_PASSWORD environment variable not set. Please configure it in Vercel."
        )
    
    # Create admin user
    admin = AdminUser(
        username="admin",
        password_hash=get_password_hash(admin_password)
    )
    db.add(admin)
    db.commit()
    
    return {"message": "Admin created successfully"}


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Login and get JWT token"""
    # Find user
    user = db.query(AdminUser).filter(AdminUser.username == request.username).first()
    
    # Verify credentials
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
async def get_current_user(
    username: str = Depends(verify_token), 
    db: Session = Depends(get_db)
):
    """Get current user info"""
    user = db.query(AdminUser).filter(AdminUser.username == username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="User not found"
        )
    return {"id": user.id, "username": user.username}


@router.post("/change-password")
async def change_password(
    old_password: str,
    new_password: str,
    username: str = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Change user password"""
    user = db.query(AdminUser).filter(AdminUser.username == username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="User not found"
        )
    
    if not verify_password(old_password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Incorrect old password"
        )
    
    user.password_hash = get_password_hash(new_password)
    db.commit()
    
    return {"message": "Password updated successfully"}