import asyncio
from app.core.database import connect_to_mongo, close_mongo_connection, get_database

async def check():
    await connect_to_mongo()
    db = get_database()
    col = db["documents"]
    docs = await col.find().to_list(10)
    for doc in docs:
        print(doc.get("filename"), "chunkCount:", doc.get("chunkCount"), "chunks:", doc.get("chunks"))
    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(check())
