from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class DocumentMetadataSchema(BaseModel):
    id: str = Field(alias="_id")
    title: Optional[str] = None
    source: str
    filename: str
    fileType: str # "pdf" or "csv"
    year: Optional[str] = None
    organization: Optional[str] = None
    pages: int = 0
    status: str = "pending" # pending, processing, processed, failed
    chunkCount: int = 0
    fileHash: str
    ingestedAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True

class DocumentCreate(BaseModel):
    title: Optional[str] = None
    source: str = "CGWB"
    filename: str
    fileType: str
    year: Optional[str] = None
    organization: Optional[str] = "Central Ground Water Board"
    pages: int = 0
    status: str = "pending"
    chunkCount: int = 0
    fileHash: str
