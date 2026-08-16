from fastapi import APIRouter, HTTPException, Depends, Response, Request, status
from app.modules.auth.schemas import LoginRequest, TokenResponse
from app.modules.users.schemas import UserCreate, UserResponse
from app.modules.users.service import UserService
from app.core.security import verify_password, create_access_token, create_refresh_token
from app.modules.auth.dependencies import get_current_user
from jose import jwt, JWTError
from app.core.config import settings
from app.core.security import ALGORITHM
import time

router = APIRouter(prefix="/auth", tags=["Auth"])

# Simple in-memory rate limiting
login_attempts = {}

def get_user_service():
    return UserService()

def check_rate_limit(email: str):
    now = time.time()
    attempts = login_attempts.get(email, [])
    # Filter attempts in the last 15 minutes
    attempts = [t for t in attempts if now - t < 900]
    login_attempts[email] = attempts
    if len(attempts) >= 5:
        raise HTTPException(status_code=429, detail="Too many login attempts. Please try again later.")

def record_failed_attempt(email: str):
    now = time.time()
    if email not in login_attempts:
        login_attempts[email] = []
    login_attempts[email].append(now)

@router.post("/register", response_model=dict, status_code=201)
async def register(user: UserCreate, response: Response, service: UserService = Depends(get_user_service)):
    existing = await service.get_user_by_email(user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = await service.create_user(user)
    
    # Auto-login after registration
    access_token = create_access_token(subject=user_id, role="Public User")
    refresh_token = create_refresh_token(subject=user_id, role="Public User")
    
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=7 * 24 * 60 * 60,
        samesite="lax",
        secure=False # Set true if HTTPS in production
    )
    
    return {
        "message": "Registration successful", 
        "user": {"id": user_id, "role": "Public User"},
        "access_token": access_token
    }

@router.post("/login", response_model=TokenResponse)
async def login(credentials: LoginRequest, response: Response, service: UserService = Depends(get_user_service)):
    check_rate_limit(credentials.email)
    
    user = await service.get_user_by_email(credentials.email)
    if not user or not verify_password(credentials.password, user.get("passwordHash", "")):
        record_failed_attempt(credentials.email)
        raise HTTPException(status_code=401, detail="Invalid email or password.")
        
    access_token = create_access_token(subject=user["_id"], role=user["role"])
    refresh_token = create_refresh_token(subject=user["_id"], role=user["role"])
    
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=7 * 24 * 60 * 60,
        samesite="lax",
        secure=False
    )
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=user["_id"],
        role=user["role"]
    )

@router.post("/refresh")
async def refresh_token(request: Request, response: Response, service: UserService = Depends(get_user_service)):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="Refresh token missing")
        
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        token_type: str = payload.get("type")
        
        if user_id is None or token_type != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token")
            
        user = await service.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
            
        access_token = create_access_token(subject=user.id, role=user.role)
        new_refresh_token = create_refresh_token(subject=user.id, role=user.role)
        
        response.set_cookie(
            key="refresh_token",
            value=new_refresh_token,
            httponly=True,
            max_age=7 * 24 * 60 * 60,
            samesite="lax",
            secure=False
        )
        
        return {"access_token": access_token}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("refresh_token")
    return {"message": "Logged out successfully"}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: UserResponse = Depends(get_current_user)):
    return current_user
