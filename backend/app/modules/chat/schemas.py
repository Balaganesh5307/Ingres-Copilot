from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class Citation(BaseModel):
    source: str
    title: str
    page: Optional[int] = None

class Message(BaseModel):
    id: str
    conversationId: str
    role: str # "user" | "assistant"
    content: str
    citations: List[Citation] = []
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class Conversation(BaseModel):
    id: str = Field(alias="_id")
    userId: str
    title: str
    messages: List[Message] = []
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True

class ConversationCreate(BaseModel):
    userId: str
    title: Optional[str] = "New Conversation"

class MessageCreate(BaseModel):
    conversationId: str
    content: str
