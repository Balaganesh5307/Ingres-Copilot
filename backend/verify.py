import asyncio
import os
from app.core.database import connect_to_mongo, close_mongo_connection, get_database
from app.core.rag import rag_core

async def verify():
    await connect_to_mongo()
    db = get_database()
    col = db["documents"]
    
    # Get chroma stats
    all_docs = rag_core.collection.get(include=['metadatas'])
    dist = {}
    for m in all_docs.get('metadatas', []):
        if not m: continue
        fname = m.get('filename', 'Unknown')
        dist[fname] = dist.get(fname, 0) + 1
        
    print("Filename | MongoDB chunkCount | ChromaDB count | Match")
    docs = await col.find().to_list(100)
    for doc in docs:
        fname = doc.get("filename")
        mongo_chunks = doc.get("chunkCount", 0)
        chroma_chunks = dist.get(fname, 0)
        match = "MATCH" if mongo_chunks == chroma_chunks else "MISMATCH"
        print(f"{fname} | {mongo_chunks} | {chroma_chunks} | {match}")
        
    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(verify())
