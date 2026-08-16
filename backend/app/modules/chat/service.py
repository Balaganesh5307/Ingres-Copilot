import json
import uuid
import asyncio
from datetime import datetime
from groq import AsyncGroq
from app.core.config import settings
from app.modules.chat.repository import ChatRepository
from app.modules.chat.schemas import ConversationCreate, Message, Citation, Conversation

# Mock Facts as instructed
MOCK_FACTS = """
You are Ingres Copilot, an AI Groundwater Intelligence Assistant. 
You must ONLY use the following facts to answer questions about groundwater. If a user asks about a location not listed here, politely inform them that you do not have data for that region yet.

Groundwater Data:
- Coimbatore, Tamil Nadu: Semi-Critical, Stage of Extraction 82%, Assessment Year 2023. (Source: "INGRES Groundwater Assessment Report 2023")
- Bengaluru Urban, Karnataka: Over-Exploited, Stage of Extraction 145%, Assessment Year 2023. (Source: "Karnataka State Hydrology Bulletin")
- Pune, Maharashtra: Safe, Stage of Extraction 58%, Assessment Year 2023. (Source: "Maharashtra Aquifer Health Survey")
- Fresno, California: Critical, Water Level Drop -2.4m, Risk High. (Source: "CA Water Board Report 2023")
- Lubbock, Texas: Medium Risk, Water Level Drop -1.8m. (Source: "Texas Drought Analysis 2023")

Always format your response clearly.
"""

class ChatService:
    def __init__(self):
        self.repository = ChatRepository()
        self.groq_client = AsyncGroq(api_key=settings.GROQ_API_KEY)

    async def create_conversation(self, data: ConversationCreate) -> str:
        conv_dict = {
            "userId": data.userId,
            "title": data.title,
            "messages": [],
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        return await self.repository.create_conversation(conv_dict)

    async def get_conversation(self, conversation_id: str) -> Conversation:
        data = await self.repository.get_conversation(conversation_id)
        if data:
            data["_id"] = str(data["_id"])
            return Conversation(**data)
        return None

    async def list_conversations(self, user_id: str):
        data = await self.repository.list_conversations(user_id)
        for d in data:
            d["_id"] = str(d["_id"])
        return [Conversation(**d) for d in data]

    async def process_chat_stream(self, conversation_id: str, content: str):
        # 1. Save user message
        user_msg = {
            "id": str(uuid.uuid4()),
            "conversationId": conversation_id,
            "role": "user",
            "content": content,
            "citations": [],
            "timestamp": datetime.utcnow()
        }
        await self.repository.add_message(conversation_id, user_msg)

        # 2. Fetch conversation history for context
        conv = await self.get_conversation(conversation_id)
        messages = [{"role": "system", "content": MOCK_FACTS}]
        
        if conv:
            for m in conv.messages[-5:]: # Keep last 5 messages for context
                messages.append({"role": m.role, "content": m.content})
        
        # Ensure the current message is in context if conv fetch failed or was empty
        if not conv or len(conv.messages) == 0:
             messages.append({"role": "user", "content": content})

        # 3. Call Groq API with Streaming
        stream = await self.groq_client.chat.completions.create(
            messages=messages,
            model="llama-3.3-70b-versatile",
            stream=True,
            temperature=0.3
        )

        assistant_msg_id = str(uuid.uuid4())
        full_response = ""

        # Mock citations based on keywords
        citations = []
        lower_content = content.lower()
        if "coimbatore" in lower_content:
            citations.append({"source": "INGRES_2023.pdf", "title": "INGRES Groundwater Assessment Report 2023", "page": 42})
        if "bengaluru" in lower_content:
            citations.append({"source": "KA_Hydro_Bull.pdf", "title": "Karnataka State Hydrology Bulletin", "page": 12})
        if "pune" in lower_content:
            citations.append({"source": "MH_Aquifer.pdf", "title": "Maharashtra Aquifer Health Survey", "page": 8})
        if "fresno" in lower_content or "california" in lower_content:
            citations.append({"source": "CA_Water_Board.pdf", "title": "CA Water Board Report 2023", "page": 15})
        if "lubbock" in lower_content or "texas" in lower_content:
            citations.append({"source": "TX_Drought.pdf", "title": "Texas Drought Analysis 2023", "page": 22})

        # Yield metadata first (citations)
        yield f"data: {json.dumps({'type': 'metadata', 'id': assistant_msg_id, 'citations': citations})}\n\n"

        async for chunk in stream:
            if chunk.choices[0].delta.content:
                text_chunk = chunk.choices[0].delta.content
                full_response += text_chunk
                yield f"data: {json.dumps({'type': 'chunk', 'text': text_chunk})}\n\n"
            
            # Small sleep to allow event loop to yield to other tasks if needed
            await asyncio.sleep(0.01)

        # 4. Save assistant message after stream finishes
        assistant_msg = {
            "id": assistant_msg_id,
            "conversationId": conversation_id,
            "role": "assistant",
            "content": full_response,
            "citations": citations,
            "timestamp": datetime.utcnow()
        }
        await self.repository.add_message(conversation_id, assistant_msg)
        
        yield "data: [DONE]\n\n"
