import json
import uuid
import asyncio
import logging
from datetime import datetime
from groq import AsyncGroq
from app.core.config import settings
from app.modules.chat.repository import ChatRepository
from app.modules.chat.schemas import ConversationCreate, Message, Citation, Conversation
from app.core.rag import rag_core

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """
You are Ingres Copilot, an official AI Groundwater Intelligence Assistant.
You must ONLY use the provided RETRIEVED CONTEXT to answer the user's questions.

RULES:
1. Do not fabricate, guess, or estimate groundwater values (e.g., stage of extraction, water levels).
2. Do not use external knowledge outside the provided context for factual groundwater claims.
3. If the required information is NOT in the retrieved context, you MUST say exactly: "I don't have information on this in the current knowledge base."
4. You must cite your sources for every factual claim. Use the format [Source Name, Page X] or [Source Name, Row X].
5. Do not invent page numbers or document titles. Only use what is provided in the metadata context.
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

        # 2. Location Detection via Groq
        detected_location = {"state": None, "district": None, "block": None}
        try:
            loc_prompt = (
                "Extract geographic entities from the user's query related to India (State, District, Block). "
                "Respond ONLY with a valid JSON object. If an entity is not found, leave it as null. "
                "Format: {\"state\": null, \"district\": null, \"block\": null}\n"
                f"Query: {content}"
            )
            loc_res = await self.groq_client.chat.completions.create(
                messages=[{"role": "user", "content": loc_prompt}],
                model="llama-3.3-70b-versatile",
                temperature=0,
                response_format={"type": "json_object"}
            )
            parsed_loc = json.loads(loc_res.choices[0].message.content)
            if isinstance(parsed_loc, dict):
                detected_location.update(parsed_loc)
        except Exception as e:
            logger.warning(f"Location extraction failed: {e}")

        # 3. Build Metadata Filter
        metadata_filter = {}
        conditions = []
        
        state = detected_location.get("state")
        district = detected_location.get("district")
        
        if state:
            conditions.append({"state": {"$in": [state, state.upper(), state.title()]}})
        if district:
            conditions.append({"district": {"$in": [district, district.upper(), district.title()]}})
            
        if len(conditions) == 1:
            metadata_filter = conditions[0]
        elif len(conditions) > 1:
            metadata_filter = {"$and": conditions}

        # 4. Retrieve Context via RAG
        top_k = 5
        matches = []
        retrieval_mode = "semantic"
        
        if metadata_filter:
            retrieval_mode = "metadata + semantic"
            try:
                matches = rag_core.search(content, top_k=top_k, metadata_filter=metadata_filter)
            except Exception as e:
                logger.warning(f"Chroma search error: {e}")
                
            if not matches:
                retrieval_mode = "semantic fallback (no filter results)"
                matches = rag_core.search(content, top_k=top_k)
        else:
            matches = rag_core.search(content, top_k=top_k)

        # Output the debug block requested by the user
        logger.info(json.dumps({
            "detected_location": detected_location,
            "retrieval_mode": retrieval_mode,
            "results_count": len(matches)
        }, indent=2))
            
        # 5. Build Grounded Context
        context_str = "RETRIEVED CONTEXT:\n"
        citations = []
        for idx, m in enumerate(matches):
            meta = m["metadata"]
            title = meta.get("title", "Unknown Source")
            page = meta.get("page")
            row = meta.get("row")
            loc_info = f" (State: {meta.get('state')}, District: {meta.get('district')})" if meta.get('state') else ""
            
            ref = f"Source {idx+1}: {title}"
            if page: ref += f", Page {page}"
            elif row: ref += f", Row {row}"
            ref += loc_info
            
            context_str += f"\n[{ref}]\n{m['text']}\n"
            
            # Format citations for frontend
            citations.append({
                "source": meta.get("filename", "Unknown"),
                "title": title,
                "page": page or row
            })

        # 6. Fetch conversation history for memory
        conv = await self.get_conversation(conversation_id)
        messages = [{"role": "system", "content": SYSTEM_PROMPT + "\n\n" + context_str}]
        
        if conv:
            for m in conv.messages[-5:]:
                messages.append({"role": m.role, "content": m.content})
        
        if not conv or len(conv.messages) == 0:
             messages.append({"role": "user", "content": content})

        # 7. Stream from Groq
        try:
            stream = await self.groq_client.chat.completions.create(
                messages=messages,
                model="llama-3.3-70b-versatile",
                stream=True,
                temperature=0.1
            )
        except Exception as e:
            yield f"data: {json.dumps({'type': 'chunk', 'text': 'Error connecting to LLM provider.'})}\n\n"
            yield "data: [DONE]\n\n"
            return

        assistant_msg_id = str(uuid.uuid4())
        full_response = ""

        yield f"data: {json.dumps({'type': 'metadata', 'id': assistant_msg_id, 'citations': citations})}\n\n"

        async for chunk in stream:
            if chunk.choices[0].delta.content:
                text_chunk = chunk.choices[0].delta.content
                full_response += text_chunk
                yield f"data: {json.dumps({'type': 'chunk', 'text': text_chunk})}\n\n"
            
            await asyncio.sleep(0.01)

        # 8. Save assistant message
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
