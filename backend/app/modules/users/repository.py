from app.core.database import get_database
from typing import Dict, Any, List
from bson import ObjectId
from typing import Dict, Any, List

class UserRepository:
    @property
    def collection(self):
        return get_database()["users"]

    async def create_user(self, user_data: Dict[str, Any]) -> str:
        """Insert user into MongoDB."""
        result = await self.collection.insert_one(user_data)
        return str(result.inserted_id)

    async def get_user_by_email(self, email: str) -> Dict[str, Any]:
        """Fetch user by email."""
        return await self.collection.find_one({"email": email})

    async def get_user_by_id(self, user_id: str) -> Dict[str, Any]:
        """Fetch user by id."""
        try:
            return await self.collection.find_one({"_id": ObjectId(user_id)})
        except Exception:
            return None

    async def list_users(self, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        cursor = self.collection.find().skip(skip).limit(limit)
        return await cursor.to_list(length=limit)
