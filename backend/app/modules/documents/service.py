from app.modules.documents.repository import DocumentRepository
from app.modules.documents.schemas import DocumentCreate, DocumentResponse
from typing import List

class DocumentService:
    def __init__(self):
        self.repository = DocumentRepository()

    async def create_document(self, document: DocumentCreate) -> str:
        """Business logic for creating a document."""
        # Future: RAG chunking or embedding generation could hook in here.
        document_dict = document.model_dump()
        return await self.repository.create_document(document_dict)

    async def get_document(self, doc_id: str) -> DocumentResponse:
        """Business logic for fetching a single document."""
        doc = await self.repository.get_document_by_id(doc_id)
        if doc:
            doc["_id"] = str(doc["_id"])
            return DocumentResponse(**doc)
        return None

    async def list_documents(self, skip: int = 0, limit: int = 100) -> List[DocumentResponse]:
        """Business logic for listing documents."""
        docs = await self.repository.list_documents(skip=skip, limit=limit)
        result = []
        for doc in docs:
            doc["_id"] = str(doc["_id"])
            result.append(DocumentResponse(**doc))
        return result
