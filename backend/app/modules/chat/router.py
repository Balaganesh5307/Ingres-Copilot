from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from typing import List
from app.modules.chat.schemas import ConversationCreate, Conversation, MessageCreate
from app.modules.chat.service import ChatService

router = APIRouter(prefix="/chat", tags=["Chat"])

def get_chat_service():
    return ChatService()

@router.post("/conversations", response_model=dict, status_code=201)
async def create_conversation(data: ConversationCreate, service: ChatService = Depends(get_chat_service)):
    """Create a new chat conversation."""
    conv_id = await service.create_conversation(data)
    return {"message": "Conversation created", "id": conv_id}

@router.get("/conversations", response_model=List[Conversation])
async def list_conversations(userId: str, service: ChatService = Depends(get_chat_service)):
    """List conversations for a user."""
    return await service.list_conversations(userId)

@router.get("/conversations/{conversation_id}", response_model=Conversation)
async def get_conversation(conversation_id: str, service: ChatService = Depends(get_chat_service)):
    """Get full conversation details."""
    conv = await service.get_conversation(conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conv

@router.post("/conversations/{conversation_id}/messages")
async def send_message(conversation_id: str, msg: MessageCreate, service: ChatService = Depends(get_chat_service)):
    """
    Send a message and stream the LLM response via SSE.
    """
    if conversation_id != msg.conversationId:
        raise HTTPException(status_code=400, detail="Conversation ID mismatch")
        
    return StreamingResponse(
        service.process_chat_stream(conversation_id, msg.content),
        media_type="text/event-stream"
    )
