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
                elif data["type"] == "metadata":
                    pass
            except:
                pass
                
    print("\n[RESPONSE]")
    print(output)
    print("--------------------------------------\n")

async def run_tests():
    await connect_to_mongo()
    
    # Test 1: Real district
    await test_query("What is the groundwater depth level for Coimbatore in 2020?", "Real district from dataset")
    
    # Test 2: Real state (Let's assume Tamil Nadu or something from the PDFs)
    await test_query("Show groundwater information for Tamil Nadu.", "Real state from dataset")
    
    # Test 3: Real assessment unit / block
    await test_query("Which assessment units are Over-Exploited?", "Real assessment unit/block")
    
    # Test 4: No location
    await test_query("How do you calculate groundwater recharge?", "Question without a location")
    
    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(run_tests())
