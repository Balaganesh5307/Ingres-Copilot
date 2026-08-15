from fastapi import APIRouter

router = APIRouter(prefix="/chat", tags=["Chat"])

@router.post("/")
async def process_chat_message():
    """
    Process a chat message using the RAG pipeline.
    Future: Will interact with LangChain/Groq and ChromaDB to query documents.
    """
    return {"message": "Chat module stubbed"}
