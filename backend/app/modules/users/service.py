from app.modules.users.repository import UserRepository
from app.modules.users.schemas import UserCreate, UserResponse, RoleEnum
from typing import List
from app.core.security import get_password_hash
from datetime import datetime
from typing import List

class UserService:
    def __init__(self):
        self.repository = UserRepository()

    async def create_user(self, user: UserCreate) -> str:
        """
        Create a new user.
        Always forces Public User role and hashes password.
        """
        user_dict = user.model_dump(exclude={"password"})
        user_dict["passwordHash"] = get_password_hash(user.password)
        # Enforce Public User
        user_dict["role"] = RoleEnum.PUBLIC_USER.value
        user_dict["createdAt"] = datetime.utcnow().isoformat()
        user_dict["updatedAt"] = datetime.utcnow().isoformat()
        
        return await self.repository.create_user(user_dict)

    async def get_user_by_email(self, email: str) -> dict:
        user = await self.repository.get_user_by_email(email)
        if user:
            user["_id"] = str(user["_id"])
            return user
        return None
        
    async def get_user_by_id(self, user_id: str) -> UserResponse:
        user = await self.repository.get_user_by_id(user_id)
        if user:
            user["_id"] = str(user["_id"])
            return UserResponse(**user)
        return None

    async def list_users(self, skip: int = 0, limit: int = 100) -> List[UserResponse]:
        users = await self.repository.list_users(skip=skip, limit=limit)
        result = []
        for user in users:
            user["_id"] = str(user["_id"])
            result.append(UserResponse(**user))
        return result
