from app.core.database import get_database
from typing import List, Dict, Any

class DocumentRepository:
    @property
    def collection(self):
        return get_database()["documents"]

    async def create_document(self, document_data: Dict[str, Any]) -> str:
        """Insert a document metadata record into MongoDB."""
        result = await self.collection.insert_one(document_data)
        return str(result.inserted_id)

    async def get_document_by_id(self, doc_id: str) -> Dict[str, Any]:
        from bson import ObjectId
        try:
            return await self.collection.find_one({"_id": ObjectId(doc_id)})
        except:
            return None
            
    async def get_document_by_hash(self, file_hash: str) -> Dict[str, Any]:
        """Check if a document was already ingested by hash."""
        return await self.collection.find_one({"fileHash": file_hash})

    async def update_document_status(self, doc_id: str, status: str, chunks: int = 0, extra: dict = None):
        from bson import ObjectId
        update_data = {"status": status, "chunkCount": chunks}
        if extra:
            update_data.update(extra)
            
        await self.collection.update_one(
            {"_id": ObjectId(doc_id)},
            {"$set": update_data}
        )

    async def list_documents(self, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        cursor = self.collection.find().skip(skip).limit(limit).sort("ingestedAt", -1)
        return await cursor.to_list(length=limit)

    async def delete_document(self, doc_id: str):
        from bson import ObjectId
        await self.collection.delete_one({"_id": ObjectId(doc_id)})
