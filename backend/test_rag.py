import asyncio
import os
import uuid
from app.modules.chat.service import ChatService
from app.core.database import connect_to_mongo, close_mongo_connection

async def test_query(query: str, desc: str):
    print(f"\n======================================")
    print(f"TEST: {desc}")
    print(f"QUERY: {query}")
    print(f"======================================")
    
    service = ChatService()
    from app.modules.chat.schemas import ConversationCreate
    conv_id = await service.create_conversation(ConversationCreate(userId="test", title="test"))
    
    stream = service.process_chat_stream(conv_id, query)
    
    output = ""
    async for chunk in stream:
        if "data: " in chunk:
            data_str = chunk.replace("data: ", "").strip()
            if data_str == "[DONE]":
                break
            import json
            try:
                data = json.loads(data_str)
                if data["type"] == "chunk":
                    output += data["text"]
                elif data["type"] == "mapAction":
                    print(f"\n[MAP ACTION DETECTED]: {json.dumps(data['data'])}")
                elif data["type"] == "metadata":
                    pass
            except:
                pass
                
    print("\n[RESPONSE]")
    print(output)
    print("--------------------------------------\n")

async def run_tests():
    await connect_to_mongo()
    
    # Test 1: Document question
    await test_query("What does the 2025 groundwater report say about Rajasthan?", "Document question")
    
    # Test 2: State data question
    await test_query("How many over-exploited assessment units are there in Tamil Nadu?", "State data question")
    
    # Test 3: District data question
    await test_query("What is the category distribution for Coimbatore?", "District data question")
    
    # Test 4: Comparison question
    await test_query("Compare Rajasthan and Tamil Nadu.", "Comparison question")
    
    # Test 5: Concept explanation
    await test_query("What does Semi-Critical mean?", "Concept explanation")
    
    # Test 6: Unknown question
    await test_query("What is the recipe for chocolate cake?", "Unknown question")
    
    # Test 7: HYBRID question
    await test_query("Why is Rajasthan considered high risk and which districts are affected?", "Hybrid question")
    
    # Test 8: Map Action - Valid
    await test_query("Show over-exploited areas in Rajasthan on the map.", "Map Action Valid")
    
    # Test 9: Map Action - Invalid State
    await test_query("Show critical areas in unknown_state on the map.", "Map Action Invalid State")
    
    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(run_tests())
