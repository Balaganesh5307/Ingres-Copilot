from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.modules.users.schemas import UserCreate, UserResponse
from app.modules.users.service import UserService
from app.modules.auth.dependencies import require_role

router = APIRouter(prefix="/users", tags=["Users"])

def get_user_service():
    return UserService()

@router.post("/", response_model=dict, status_code=201)
async def create_user(user: UserCreate, service: UserService = Depends(get_user_service)):
    """
    Register a new user.
    """
    existing_user = await service.get_user_by_email(user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = await service.create_user(user)
    return {"message": "User created successfully", "id": user_id}

@router.get("/", response_model=List[UserResponse], dependencies=[Depends(require_role(["Admin"]))])
async def list_users(skip: int = 0, limit: int = 100, service: UserService = Depends(get_user_service)):
    """
    List all registered users.
    Future: Protect this route so only Admins can access it.
    """
    return await service.list_users(skip=skip, limit=limit)
