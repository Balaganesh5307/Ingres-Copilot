from pydantic import BaseModel, Field
from typing import List, Optional

class AssessmentDataSchema(BaseModel):
    annualRecharge: float
    annualExtraction: float
    netGroundwaterAvailability: float
    stageOfExtraction: float
    category: str
    assessmentYear: str

class DocumentChunkSchema(BaseModel):
    text: str
    page: Optional[int] = None
    embedding: Optional[List[float]] = None

class DocumentBase(BaseModel):
    title: str
    source: str
    year: str
    state: str
    district: str
    block: str
    category: str
    assessmentData: AssessmentDataSchema
    chunks: List[DocumentChunkSchema] = []

class DocumentCreate(DocumentBase):
    pass

class DocumentResponse(DocumentBase):
    id: str = Field(alias="_id")

    class Config:
        populate_by_name = True
