import asyncio
import json
from app.modules.analytics.service import AnalyticsService
from app.core.database import connect_to_mongo, close_mongo_connection

async def test():
    await connect_to_mongo()
    service = AnalyticsService()
    
    cats = await service.get_categories("state", "Tamil Nadu")
    print("TAMIL NADU CATEGORIES:")
    print(json.dumps(cats, indent=2))
    
    map_data = await service.get_map_data()
    print("\nMAP DATA (First 2 states):")
    print(json.dumps(map_data[:2], indent=2))
    
    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(test())
