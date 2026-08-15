from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.modules.documents.schemas import DocumentCreate, DocumentResponse
from app.modules.documents.service import DocumentService

router = APIRouter(prefix="/documents", tags=["Documents"])

def get_document_service():
    return DocumentService()

@router.post("/", response_model=dict, status_code=201)
async def create_document(document: DocumentCreate, service: DocumentService = Depends(get_document_service)):
    """
    Upload and parse a new groundwater document.
    Currently only stores the document in MongoDB.
    Future: Will trigger background RAG processing and NLP extraction.
    """
    doc_id = await service.create_document(document)
    return {"message": "Document created successfully", "id": doc_id}

@router.get("/", response_model=List[DocumentResponse])
async def list_documents(skip: int = 0, limit: int = 100, service: DocumentService = Depends(get_document_service)):
    """
    List all ingested documents.
    Future: Add filtering by state, district, year.
    """
    return await service.list_documents(skip=skip, limit=limit)

@router.get("/{doc_id}", response_model=DocumentResponse)
async def get_document(doc_id: str, service: DocumentService = Depends(get_document_service)):
    """
    Retrieve full details for a specific document.
    """
    doc = await service.get_document(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc
