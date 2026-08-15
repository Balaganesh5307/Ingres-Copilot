from fastapi import APIRouter, HTTPException, Depends
from app.modules.auth.schemas import LoginRequest, TokenResponse
from app.modules.users.schemas import UserCreate
from app.modules.users.service import UserService
import time

router = APIRouter(prefix="/auth", tags=["Auth"])

def get_user_service():
    return UserService()

@router.post("/register", response_model=dict, status_code=201)
async def register(user: UserCreate, service: UserService = Depends(get_user_service)):
    """
    Mock registration route.
    In the future, this will hash the password and properly verify email.
    """
    existing = await service.get_user_by_email(user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = await service.create_user(user)
    return {"message": "Registration successful", "user_id": user_id}

@router.post("/login", response_model=TokenResponse)
async def login(credentials: LoginRequest, service: UserService = Depends(get_user_service)):
    """
    Mock login route.
    Returns a dummy JWT string so the frontend can wire up the authentication flow.
    In the future, this will use python-jose to generate real signed JWTs.
    """
    user = await service.get_user_by_email(credentials.email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    # Mocking JWT return
    fake_token = f"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_payload_{int(time.time())}.mock_signature"
    
    return TokenResponse(
        access_token=fake_token,
        token_type="bearer",
        user_id=user.id,
        role=user.role
    )
