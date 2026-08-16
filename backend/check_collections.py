import asyncio
from app.core.database import connect_to_mongo, close_mongo_connection, get_database

async def check():
    await connect_to_mongo()
    db = get_database()
    cols = await db.list_collection_names()
    print('Collections:', cols)
    
    if "documents" in cols:
        print("Sample document:")
        doc = await db["documents"].find_one()
        print(doc)
    
    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(check())
