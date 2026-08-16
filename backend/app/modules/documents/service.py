import os
import hashlib
import fitz # PyMuPDF
import pandas as pd
import uuid
import re
from typing import List, Dict, Any
from app.modules.documents.repository import DocumentRepository
from app.modules.documents.schemas import DocumentCreate, DocumentMetadataSchema
from app.core.rag import rag_core

def get_file_hash(file_path: str) -> str:
    hasher = hashlib.sha256()
    with open(file_path, 'rb') as f:
        buf = f.read()
        hasher.update(buf)
    return hasher.hexdigest()

def chunk_text(text: str, chunk_size: int = 800, overlap: int = 150) -> List[str]:
    """Basic word-based chunking."""
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk_words = words[i:i + chunk_size]
        chunks.append(" ".join(chunk_words))
        i += chunk_size - overlap
    return chunks

class DocumentService:
    def __init__(self):
        self.repository = DocumentRepository()

    async def ingest_pdf(self, file_path: str, filename: str) -> str:
        file_hash = get_file_hash(file_path)
        existing = await self.repository.get_document_by_hash(file_hash)
        if existing:
            return f"Duplicate: Document already ingested with ID {existing['_id']}"

        # 1. Create DB Record
        doc_data = DocumentCreate(
            filename=filename,
            fileType="pdf",
            fileHash=file_hash,
            status="processing"
        )
        doc_id = await self.repository.create_document(doc_data.model_dump())

        # 2. Extract with PyMuPDF
        try:
            doc = fitz.open(file_path)
            total_pages = len(doc)
            all_chunks = []
            
            # Simple heuristic to find year in first 3 pages
            inferred_year = None
            inferred_title = filename.replace(".pdf", "")
            
            for page_num in range(total_pages):
                page = doc[page_num]
                text = page.get_text()
                
                # Basic cleanup
                text = re.sub(r'\s+', ' ', text).strip()
                if not text:
                    continue
                
                if page_num < 3 and not inferred_year:
                    # Look for YYYY
                    match = re.search(r'\b(19|20)\d{2}\b', text)
                    if match:
                        inferred_year = match.group(0)

                # Chunk page
                page_chunks = chunk_text(text)
                for i, chunk_text_str in enumerate(page_chunks):
                    chunk_id = f"{doc_id}_p{page_num+1}_c{i}"
                    all_chunks.append({
                        "id": chunk_id,
                        "text": chunk_text_str,
                        "metadata": {
                            "document_id": doc_id,
                            "source": "CGWB",
                            "title": inferred_title,
                            "filename": filename,
                            "page": page_num + 1,
                            "year": inferred_year or "Unknown",
                            "organization": "Central Ground Water Board",
                            "department": "Ministry of Jal Shakti"
                        }
                    })

            # 3. Add to Chroma
            rag_core.add_chunks(all_chunks)

            # 4. Update Status
            await self.repository.update_document_status(
                doc_id, 
                status="processed", 
                chunks=len(all_chunks),
                extra={"pages": total_pages, "year": inferred_year, "title": inferred_title}
            )
            return f"Success: Ingested {filename} ({len(all_chunks)} chunks)"

        except Exception as e:
            await self.repository.update_document_status(doc_id, status="failed")
            return f"Failed: {str(e)}"

    async def ingest_csv(self, file_path: str, filename: str) -> str:
        file_hash = get_file_hash(file_path)
        existing = await self.repository.get_document_by_hash(file_hash)
        if existing:
            return f"Duplicate: CSV already ingested with ID {existing['_id']}"

        doc_data = DocumentCreate(
            filename=filename,
            fileType="csv",
            fileHash=file_hash,
            status="processing"
        )
        doc_id = await self.repository.create_document(doc_data.model_dump())

        try:
            df = pd.read_csv(file_path)
            all_chunks = []
            
            inferred_year = None
            # Heuristic for year in filename
            match = re.search(r'\b(19|20)\d{2}\b', filename)
            if match:
                inferred_year = match.group(0)

            for idx, row in df.iterrows():
                row_dict = row.dropna().to_dict()
                if not row_dict:
                    continue
                
                # Format row into a readable text chunk
                text_parts = []
                for k, v in row_dict.items():
                    text_parts.append(f"{k}: {v}")
                
                chunk_text_str = ", ".join(text_parts)
                chunk_id = f"{doc_id}_row{idx}"
                
                # Try to extract location metadata for filtering
                state = str(row_dict.get("State", row_dict.get("state", "")))
                district = str(row_dict.get("District", row_dict.get("district", "")))
                
                metadata = {
                    "document_id": doc_id,
                    "source": "data.gov.in",
                    "title": filename.replace(".csv", ""),
                    "filename": filename,
                    "row": idx + 1,
                    "year": inferred_year or "Unknown"
                }
                if state: metadata["state"] = state
                if district: metadata["district"] = district

                all_chunks.append({
                    "id": chunk_id,
                    "text": chunk_text_str,
                    "metadata": metadata
                })

            rag_core.add_chunks(all_chunks)

            await self.repository.update_document_status(
                doc_id, 
                status="processed", 
                chunks=len(all_chunks),
                extra={"year": inferred_year, "title": filename.replace(".csv", "")}
            )
            return f"Success: Ingested {filename} ({len(all_chunks)} chunks)"

        except Exception as e:
            await self.repository.update_document_status(doc_id, status="failed")
            return f"Failed: {str(e)}"
