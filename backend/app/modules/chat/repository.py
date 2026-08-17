from app.core.database import get_database
from typing import Dict, Any, List
from datetime import datetime

class ChatRepository:
    @property
    def conversations(self):
        return get_database()["conversations"]

    async def create_conversation(self, conversation_data: Dict[str, Any]) -> str:
        result = await self.conversations.insert_one(conversation_data)
        return str(result.inserted_id)

    async def add_message(self, conversation_id: str, message_data: Dict[str, Any]):
        from bson import ObjectId
        await self.conversations.update_one(
            {"_id": ObjectId(conversation_id)},
            {
                "$push": {"messages": message_data},
                "$set": {"updatedAt": datetime.utcnow()}
            }
        )

    async def get_conversation(self, conversation_id: str) -> Dict[str, Any]:
        from bson import ObjectId
        try:
            return await self.conversations.find_one({"_id": ObjectId(conversation_id)})
        except Exception:
            return None

    async def list_conversations(self, user_id: str) -> List[Dict[str, Any]]:
        cursor = self.conversations.find({"userId": user_id}).sort("updatedAt", -1)
        return await cursor.to_list(length=100)

    async def delete_conversation(self, conversation_id: str) -> bool:
        from bson import ObjectId
        try:
            result = await self.conversations.delete_one({"_id": ObjectId(conversation_id)})
            return result.deleted_count > 0
        except Exception:
            return False

    async def update_conversation_title(self, conversation_id: str, new_title: str) -> bool:
        from bson import ObjectId
        try:
            result = await self.conversations.update_one(
                {"_id": ObjectId(conversation_id)},
                {"$set": {"title": new_title, "updatedAt": datetime.utcnow()}}
            )
            return result.modified_count > 0
        except Exception:
            return False
