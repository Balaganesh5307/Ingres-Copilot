from app.core.database import get_database
from typing import List, Dict, Any

class DocumentRepository:
    @property
    def collection(self):
        return get_database()["documents"]

    async def create_document(self, document_data: Dict[str, Any]) -> str:
        """Insert a document into MongoDB and return its ID."""
        result = await self.collection.insert_one(document_data)
        return str(result.inserted_id)

    async def get_document_by_id(self, doc_id: str) -> Dict[str, Any]:
        """Fetch a document by its ID."""
        from bson import ObjectId
        return await self.collection.find_one({"_id": ObjectId(doc_id)})

    async def list_documents(self, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        """List documents with pagination."""
        cursor = self.collection.find().skip(skip).limit(limit)
        return await cursor.to_list(length=limit)
