import json
import uuid
import asyncio
import logging
from datetime import datetime
import random
from groq import AsyncGroq
from app.core.config import settings
from app.modules.chat.repository import ChatRepository
from app.modules.chat.schemas import ConversationCreate, Message, Citation, Conversation
from app.core.rag import rag_core
from app.modules.analytics.service import AnalyticsService
from bson import ObjectId

class JSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        return json.JSONEncoder.default(self, obj)

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are Ingres Copilot, an advanced AI Assistant specialized in Groundwater Intelligence for India.
Your goal is to answer user queries based ONLY on the provided context.
You have access to Official Reports and MongoDB Analytics.

CRITICAL RULES:
1. When providing numerical facts, counts, or categorization data, you MUST base it STRICTLY on the JSON or text in the RETRIEVED CONTEXT.
2. NEVER invent, hallucinate, or guess numbers, assessment units, or data points. If the context does not contain the answer, say "I don't have sufficient evidence in the current knowledge base to verify this."
3. Synthesize both structured data (like Category Distributions) and unstructured document data if both are provided.
4. Keep answers concise, authoritative, and perfectly formatted. Do not expose internal JSON structures directly to the user; instead, interpret them into clear natural language.
"""

class ChatService:
    def __init__(self):
        self.repository = ChatRepository()
        self.analytics = AnalyticsService()
        
        # Initialize multiple clients if multiple keys are provided
        keys = settings.groq_api_keys_list
        if not keys and settings.GROQ_API_KEY:
            keys = [settings.GROQ_API_KEY]
            
        self.groq_clients = [AsyncGroq(api_key=k) for k in keys] if keys else []
        self.groq_client = self.groq_clients[0] if self.groq_clients else None

    def get_random_client(self):
        if not self.groq_clients:
            raise Exception("No Groq API keys configured")
        return random.choice(self.groq_clients)

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

    async def delete_conversation(self, conversation_id: str) -> bool:
        return await self.repository.delete_conversation(conversation_id)

    async def rename_conversation(self, conversation_id: str, new_title: str) -> bool:
        return await self.repository.update_conversation_title(conversation_id, new_title)

    async def process_chat_stream(self, conversation_id: str, content: str):
        user_msg = {
            "id": str(uuid.uuid4()),
            "conversationId": conversation_id,
            "role": "user",
            "content": content,
            "citations": [],
            "timestamp": datetime.utcnow()
        }
        await self.repository.add_message(conversation_id, user_msg)

        # Deep Query Extraction via Groq
        extracted_query = {
            "states": [],
            "districts": [],
            "year": None,
            "category": None,
            "operation": "none",
            "mapAction": False,
            "intent": "DOCUMENT_KNOWLEDGE",
            "entities": [],
            "entityType": "none",
            "targetRegion": None
        }
        try:
            loc_prompt = (
                "Analyze the user's query and extract analytical parameters. "
                "Determine the INTENT: DOCUMENT_KNOWLEDGE, STRUCTURED_DATA, COMPARISON, MAP_QUERY, CONCEPT_EXPLANATION, HYBRID.\n"
                "Determine the OPERATION: comparison, distribution, ranking, count, list_units, none.\n"
                "Use 'list_units' if the user asks about specific districts, units, or highest/lowest extraction within a state.\n"
                "Set 'mapAction' to true if the user wants to 'show', 'view', or 'display' data on a map.\n"
                "Extract lists of 'states' and 'districts'. Extract 'year' (integer) and 'category' (e.g. 'Over-Exploited', 'Critical') if present.\n"
                "For comparisons, extract 'entities' (list of items being compared), 'entityType' ('state', 'district', or 'year'), and 'targetRegion' (if comparing years for a specific place).\n"
                "Respond ONLY with a valid JSON object in this format:\n"
                "{\"states\": [], \"districts\": [], \"year\": null, \"category\": null, \"operation\": \"none\", \"mapAction\": false, \"intent\": \"DOCUMENT_KNOWLEDGE\", \"entities\": [], \"entityType\": \"none\", \"targetRegion\": null}\n"
                f"Query: {content}"
            )
            loc_res = await self.get_random_client().chat.completions.create(
                messages=[{"role": "user", "content": loc_prompt}],
                model="llama-3.3-70b-versatile",
                temperature=0,
                response_format={"type": "json_object"}
            )
            parsed_loc = json.loads(loc_res.choices[0].message.content)
            if isinstance(parsed_loc, dict):
                extracted_query.update({k: v for k, v in parsed_loc.items() if k in extracted_query})
        except Exception as e:
            logger.warning(f"Intent/Location extraction failed: {e}")

        intent = extracted_query["intent"]
        states = extracted_query["states"]
        districts = extracted_query["districts"]
        operation = extracted_query["operation"]
        wants_map = extracted_query.get("mapAction", False) or intent == "MAP_QUERY"

        indicator_msg = "Analyzing query..."
        if wants_map:
            indicator_msg = "Querying geospatial data..."
        elif intent in ["STRUCTURED_DATA", "COMPARISON", "HYBRID"]:
            indicator_msg = "Running MongoDB Analytics Aggregation..."
        elif intent in ["DOCUMENT_KNOWLEDGE", "CONCEPT_EXPLANATION"]:
            indicator_msg = "Searching source documents..."
            
        yield f"data: {json.dumps({'type': 'indicator', 'text': indicator_msg})}\n\n"

        context_str = "RETRIEVED CONTEXT:\n"
        citations = []
        sources_used = []
        visualization = None

        if intent in ["STRUCTURED_DATA", "COMPARISON", "HYBRID", "MAP_QUERY"]:
            sources_used.append("mongodb")
            
            # 1. Comparison Engine (BarChart and Table Context)
            if operation == "comparison":
                try:
                    comp_entities = extracted_query.get("entities", [])
                    comp_type = extracted_query.get("entityType", "none")
                    comp_target = extracted_query.get("targetRegion")
                    
                    # fallback logic if LLM failed to fill new fields correctly
                    if comp_type == "none" or not comp_entities:
                        if len(states) >= 2:
                            comp_entities = states
                            comp_type = "state"
                        elif len(districts) >= 2:
                            comp_entities = districts
                            comp_type = "district"
                    
                    if len(comp_entities) >= 2 and comp_type in ["state", "district", "year"]:
                        comparison_data = await self.analytics.get_comparison(
                            entities=comp_entities,
                            entity_type=comp_type,
                            target_region=comp_target,
                            year=extracted_query.get("year")
                        )
                        
                        viz_data = []
                        for comp in comparison_data["comparison"]:
                            if comp["totalAssessmentUnits"] > 0:
                                d = {"name": comp["name"]}
                                for cat, count in comp["categoryCounts"].items():
                                    d[cat] = count
                                viz_data.append(d)
                        
                        context_str += f"\n[MongoDB: Comparison Data]\n{json.dumps(comparison_data, cls=JSONEncoder)}\n"
                        citations.append({
                            "type": "analytics",
                            "source": "MongoDB groundwater_assessments",
                            "operation": "comparison",
                            "entities": comp_entities,
                            "title": f"{comp_type.capitalize()} Comparison",
                            "assessmentYear": extracted_query.get("year", 2025)
                        })
                        
                        if viz_data:
                            visualization = {
                                "type": "bar",
                                "title": f"Groundwater Comparison ({comp_type.capitalize()})",
                                "data": viz_data
                            }
                except Exception as e:
                    logger.warning(f"Comparison failed: {e}")
            
            # 2. Category Distribution (PieChart)
            elif operation == "distribution" or (len(states) == 1 and operation in ["none", "count"]):
                try:
                    target = districts[0] if districts else (states[0] if states else None)
                    level = "district" if districts else "state"
                    if target:
                        cats = await self.analytics.get_categories(level, target)
                        if cats and cats.get("totalUnits", 0) > 0:
                            context_str += f"\n[MongoDB: Assessment Categories for {target}]\n{json.dumps(cats, cls=JSONEncoder)}\n"
                            citations.append({
                                "type": "assessment",
                                "source": "MongoDB groundwater_assessments",
                                "operation": "category_distribution",
                                "target": target,
                                "level": level,
                                "title": f"Category Distribution for {target}"
                            })
                            
                            viz_data = [{"name": d["category"], "value": d["count"]} for d in cats["distribution"]]
                            visualization = {
                                "type": "pie",
                                "title": f"Category Distribution: {target}",
                                "data": viz_data
                            }
                except Exception as e:
                    logger.warning(f"Distribution failed: {e}")
                    
            # 3. Rankings
            elif operation == "ranking" or intent == "COMPARISON":
                try:
                    ranks = await self.analytics.get_rankings("state")
                    context_str += f"\n[MongoDB: State Rankings]\n{json.dumps(ranks[:10], cls=JSONEncoder)}\n"
                    citations.append({
                        "type": "analytics",
                        "source": "MongoDB analytics_data",
                        "operation": "ranking",
                        "title": "State Groundwater Rankings"
                    })
                    
                    viz_data = [{"name": r["state"], "value": r["extractable_bcm"]} for r in ranks[:10]]
                    visualization = {
                        "type": "bar",
                        "title": "Top States by Extractable BCM",
                        "data": viz_data
                    }
                except Exception as e:
                    logger.warning(f"Ranking failed: {e}")

            # 3.5 Specific Units / District Ranking within a state
            elif operation == "list_units" or (operation == "ranking" and states):
                try:
                    target_state = states[0] if states else None
                    target_district = districts[0] if districts else None
                    target_category = extracted_query.get("category")
                    
                    units = await self.analytics.get_assessment_units(
                        state=target_state,
                        district=target_district,
                        category=target_category,
                        limit=15
                    )
                    
                    if units:
                        context_str += f"\n[MongoDB: Assessment Units Details]\n{json.dumps(units, cls=JSONEncoder)}\n"
                        citations.append({
                            "type": "assessment",
                            "source": "MongoDB groundwater_assessments",
                            "operation": "list_units",
                            "state": target_state,
                            "category": target_category,
                            "title": f"Assessment Units {target_state or ''}"
                        })
                except Exception as e:
                    logger.warning(f"List units failed: {e}")

            # 4. Map Action Validation
            if wants_map:
                try:
                    # Validate state exists if requested
                    target_state = states[0] if states else None
                    target_category = extracted_query.get("category")
                    
                    if target_state:
                        cats = await self.analytics.get_categories("state", target_state)
                        if not cats or cats.get("totalUnits", 0) == 0:
                            # State does not exist in DB or has no data
                            context_str += "\n[System: Map Validation Error]\nNo groundwater assessment data is available for this selection.\n"
                        else:
                            # Valid state
                            context_str += f"\n[System: Map Action Validated]\nINSTRUCTION: The user's map action for {target_state} is valid. You MUST explain that you have highlighted the requested region on the map. Do not say you don't have information.\n"
                    else:
                        context_str += "\n[System: Map Action Validated]\nINSTRUCTION: The user's map action is valid. You MUST explain that you have updated the map view. Do not say you don't have information.\n"
                except Exception as e:
                    logger.warning(f"Map validation failed: {e}")

        # Always route to RAG (ChromaDB) to provide maximum evidence coverage
        sources_used.append("rag")
        
        metadata_filter = {}
        conditions = []
        if states:
            state = states[0]
            conditions.append({"state": {"$in": [state, state.upper(), state.title()]}})
        if districts:
            district = districts[0]
            conditions.append({"district": {"$in": [district, district.upper(), district.title()]}})
            
        if len(conditions) == 1:
            metadata_filter = conditions[0]
        elif len(conditions) > 1:
            metadata_filter = {"$and": conditions}

        top_k = 5
        matches = []
        if metadata_filter:
            try:
                matches = rag_core.search(content, top_k=top_k, metadata_filter=metadata_filter)
            except Exception as e:
                pass
            if not matches:
                matches = rag_core.search(content, top_k=top_k)
        else:
            matches = rag_core.search(content, top_k=top_k)

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
            
            citations.append({
                "type": "document",
                "source": meta.get("filename", "Unknown"),
                "title": title,
                "page": page or row,
                "excerpt": m['text'][:600] + "..." if len(m['text']) > 600 else m['text']
            })

        logger.info(json.dumps({
            "extracted_query": extracted_query,
            "sources_used": sources_used,
            "visualization_generated": visualization is not None
        }, indent=2))

        conv = await self.get_conversation(conversation_id)
        messages = [{"role": "system", "content": SYSTEM_PROMPT + "\n\n" + context_str}]
        
        if conv:
            for m in conv.messages[-5:]:
                messages.append({"role": m.role, "content": m.content})
        
        if not conv or len(conv.messages) == 0:
             messages.append({"role": "user", "content": content})

        try:
            stream = await self.get_random_client().chat.completions.create(
                messages=messages,
                model="llama-3.3-70b-versatile",
                stream=True,
                temperature=0.1
            )
        except Exception as e:
            logger.error(f"Groq API Error: {e}")
            yield f"data: {json.dumps({'type': 'chunk', 'text': 'Error connecting to LLM provider. This is usually due to API rate limits (Too Many Requests). Please wait a moment and try again.'})}\n\n"
            yield "data: [DONE]\n\n"
            return

        assistant_msg_id = str(uuid.uuid4())
        full_response = ""

        if visualization:
            yield f"data: {json.dumps({'type': 'visualization', 'data': visualization})}\n\n"

        if wants_map:
            map_payload = {
                "type": "FILTER",
                "state": states[0] if states else None,
                "category": extracted_query.get("category")
            }
            # Only emit if it's a valid targeted query
            if map_payload["state"] or map_payload["category"]:
                yield f"data: {json.dumps({'type': 'mapAction', 'data': map_payload})}\n\n"

        internal_metadata = {
            "type": "metadata", 
            "id": assistant_msg_id, 
            "citations": citations,
            "intent": intent,
            "sourcesUsed": sources_used
        }
        yield f"data: {json.dumps(internal_metadata)}\n\n"

        async for chunk in stream:
            if chunk.choices[0].delta.content:
                text_chunk = chunk.choices[0].delta.content
                full_response += text_chunk
                yield f"data: {json.dumps({'type': 'chunk', 'text': text_chunk})}\n\n"
            
            await asyncio.sleep(0.01)

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
