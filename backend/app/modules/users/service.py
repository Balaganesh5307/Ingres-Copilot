from app.modules.users.repository import UserRepository
from app.modules.users.schemas import UserCreate, UserResponse
from typing import List

class UserService:
    def __init__(self):
        self.repository = UserRepository()

    async def create_user(self, user: UserCreate) -> str:
        """
        Create a new user.
        Future: Implement password hashing before saving.
        """
        user_dict = user.model_dump()
        # Mocking password hash for now
        user_dict["password"] = f"hashed_{user_dict['password']}"
        return await self.repository.create_user(user_dict)

    async def get_user_by_email(self, email: str) -> UserResponse:
        user = await self.repository.get_user_by_email(email)
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
