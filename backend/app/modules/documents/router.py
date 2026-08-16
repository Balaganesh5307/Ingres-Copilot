from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, BackgroundTasks
from typing import List, Dict, Any
from app.modules.documents.service import DocumentService
import shutil
import os

router = APIRouter(prefix="/documents", tags=["Documents"])

def get_document_service():
    return DocumentService()

@router.post("/upload")
async def upload_pdf(background_tasks: BackgroundTasks, file: UploadFile = File(...), service: DocumentService = Depends(get_document_service)):
    """Upload and ingest a PDF document."""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    file_path = f"ingestion/{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Process in background
    background_tasks.add_task(service.ingest_pdf, file_path, file.filename)
    return {"message": f"Upload received. Processing {file.filename} in the background."}

@router.post("/upload-csv")
async def upload_csv(background_tasks: BackgroundTasks, file: UploadFile = File(...), service: DocumentService = Depends(get_document_service)):
    """Upload and ingest a CSV file."""
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
        
    file_path = f"ingestion/{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    background_tasks.add_task(service.ingest_csv, file_path, file.filename)
    return {"message": f"Upload received. Processing {file.filename} in the background."}

@router.get("/")
async def list_documents(skip: int = 0, limit: int = 100, service: DocumentService = Depends(get_document_service)):
    """List all document metadata."""
    docs = await service.repository.list_documents(skip, limit)
    for d in docs:
        d["_id"] = str(d["_id"])
    return docs

@router.get("/{doc_id}")
async def get_document(doc_id: str, service: DocumentService = Depends(get_document_service)):
    doc = await service.repository.get_document_by_id(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    doc["_id"] = str(doc["_id"])
    return doc

@router.delete("/{doc_id}")
async def delete_document(doc_id: str, service: DocumentService = Depends(get_document_service)):
    """Delete document metadata. (Note: currently doesn't delete chunks from ChromaDB for prototype simplicity)."""
    await service.repository.delete_document(doc_id)
    return {"message": "Document deleted"}
