import asyncio
import json
from app.core.database import connect_to_mongo, close_mongo_connection, get_database

async def check():
    await connect_to_mongo()
    db = get_database()
    col = db["groundwater_assessments"]
    
    count = await col.count_documents({})
    states = await col.distinct("state")
    districts = await col.distinct("district")
    years = await col.distinct("assessmentYear")
    categories = await col.distinct("category")
    
    docs = await col.find({}).limit(5).to_list(5)
    
    print(f"collection name: {col.name}")
    print(f"total records: {count}")
    print(f"distinct states/UTs: {len(states)}")
    print(f"distinct districts: {len(districts)}")
    print(f"distinct assessment years: {years}")
    print(f"distinct categories: {categories}")
    print("\nSample records:")
    for d in docs:
        print(f"{d['state']} | {d['district']} | {d['assessmentUnit']} | {d['category']} | {d['assessmentYear']} | {d['sourceDocument']} | {d['sourcePage']}")
    
    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(check())
